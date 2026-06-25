import { Router, Request, Response } from 'express';
import store from '../store';
import { config } from '../config';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/initiate', authenticate, async (req: Request, res: Response) => {
  try {
    const bookingId = req.body.bookingId as string;
    const method = req.body.method as string;
    if (!bookingId || !method) return res.status(400).json({ error: 'Booking ID and payment method are required' });

    const booking = store.findBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId !== req.user!.userId) return res.status(403).json({ error: 'Access denied' });

    const amount = booking.finalCost || booking.estimatedCost;
    const commission = Math.round(amount * config.platformCommissionRate * 100) / 100;
    const taxAmount = Math.round(amount * 0.018 * 100) / 100;
    const professionalEarning = Math.round((amount - commission - taxAmount) * 100) / 100;
    const txnId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    store.upsertPayment(bookingId, {
      bookingId, amount, platformCommission: commission, taxAmount,
      professionalEarning, status: 'HELD_IN_ESCROW', method,
      transactionId: txnId, paidAt: new Date(),
    }, {
      amount, platformCommission: commission, taxAmount,
      professionalEarning, status: 'HELD_IN_ESCROW', method,
      transactionId: txnId, paidAt: new Date(),
    });

    res.json({
      breakdown: {
        subtotal: amount,
        commission: `-₹${commission} (12% platform fee)`,
        tax: `-₹${taxAmount} (1.8% tax)`,
        professionalEarning: `₹${professionalEarning}`,
        total: amount,
      },
      receipt: {
        bookingId: booking.bookingId,
        transactionId: txnId,
        amount,
        status: 'Payment held in escrow',
        message: 'Payment will be released after you confirm job completion.',
      },
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.get('/:bookingId/receipt', authenticate, async (req: Request, res: Response) => {
  try {
    const payment = store.findPaymentByBookingId(req.params.bookingId as string);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const booking = store.findBookingById(payment.bookingId);
    const prof = booking ? store.findProfessionalById(booking.professionalId) : null;
    const profUser = prof ? store.findUserById(prof.userId) : null;

    res.json({
      receiptId: 'RCT-' + payment.id.substring(0, 8).toUpperCase(),
      date: payment.paidAt,
      bookingId: booking?.bookingId || '',
      professional: profUser?.name || '',
      service: booking?.categoryName || '',
      breakdown: {
        subtotal: payment.amount,
        platformFee: payment.platformCommission,
        tax: payment.taxAmount,
        professionalEarning: payment.professionalEarning,
      },
      total: payment.amount,
      status: payment.status,
      transactionId: payment.transactionId,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

router.post('/:bookingId/release', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = store.findBookingById(req.params.bookingId as string);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId !== req.user!.userId) {
      return res.status(403).json({ error: 'Only the customer can confirm completion' });
    }

    const payment = store.findPaymentByBookingId(booking.id);
    if (!payment || payment.status !== 'HELD_IN_ESCROW') {
      return res.status(400).json({ error: 'No escrow payment to release' });
    }

    store.payments.update(payment.id, { status: 'RELEASED', releasedAt: new Date() });
    store.createPayout({
      professionalId: booking.professionalId,
      amount: payment.professionalEarning,
      status: 'processed',
      processedAt: new Date(),
    });
    store.updateBooking(booking.id, { status: 'COMPLETED' });

    res.json({ message: 'Payment released to professional. Thank you for confirming completion!' });
  } catch (err) {
    console.error('Release error:', err);
    res.status(500).json({ error: 'Failed to release payment' });
  }
});

export default router;
