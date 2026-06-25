import { Router, Request, Response } from 'express';
import store from '../store';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const category = req.body.category as string;
    const description = req.body.description as string;
    const bookingId = req.body.bookingId as string | undefined;

    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required' });
    }

    const validCategories = ['BILLING', 'SERVICE_QUALITY', 'NO_SHOW', 'SAFETY', 'ACCOUNT'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid dispute category' });
    }

    const slaDate = new Date();
    slaDate.setHours(slaDate.getHours() + 48);

    const dispute = store.createDispute({
      bookingId: bookingId || null,
      raisedById: req.user!.userId,
      category,
      description,
      responseSla: slaDate,
    });

    if (category === 'SAFETY') {
      store.disputes.update(dispute.id, { status: 'ESCALATED', assignedTo: 'human-support-team' });

      if (bookingId) {
        const booking = store.findBookingById(bookingId);
        if (booking) {
          store.updateProfessional(booking.professionalId, {
            isVerified: false,
            verificationStatus: 'PENDING',
          });
        }
      }

      return res.json({
        dispute,
        escalated: true,
        message: 'Safety concern escalated immediately. Our support team has been notified and the professional\'s profile has been suspended pending review.',
      });
    }

    res.status(201).json({
      dispute,
      message: category === 'BILLING'
        ? `Billing dispute registered. We will respond within 48 hours (by ${slaDate.toLocaleDateString()}).`
        : 'Your request has been registered. We will respond within 48 hours.',
    });
  } catch (err) {
    console.error('Dispute error:', err);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const disputes = store.findDisputesByUser(req.user!.userId);
    const result = disputes.map((d: any) => {
      const booking = d.bookingId ? store.findBookingById(d.bookingId) : null;
      return { ...d, booking: booking ? { bookingId: booking.bookingId, status: booking.status, categoryName: booking.categoryName } : null };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

export default router;
