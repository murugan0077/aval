import { Router, Request, Response } from 'express';
import store from '../store';
import { config } from '../config';
import { authenticate } from '../middleware/auth';

const router = Router();

function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'NS-';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { professionalId, jobDescription, address, city } = req.body;
    if (!professionalId || !jobDescription || !address || !city) {
      return res.status(400).json({ error: 'Professional, job description, address, and city are required' });
    }

    const prof = store.findProfessionalById(professionalId as string);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const scheduledDateInput = req.body.scheduledDate ? new Date(req.body.scheduledDate as string) : null;
    const scheduledSlotInput = (req.body.scheduledSlot as string) || null;

    if (scheduledDateInput) {
      const existingBookings = store.findBookingsByProfessional(prof.id);
      const isBooked = existingBookings.some((b: any) => {
        if (['CANCELLED', 'COMPLETED'].includes(b.status)) return false;
        if (!b.scheduledDate) return false;
        const sameDate = new Date(b.scheduledDate).toDateString() === scheduledDateInput.toDateString();
        const sameSlot = b.scheduledSlot === scheduledSlotInput;
        return sameDate && sameSlot;
      });

      if (isBooked) {
        return res.status(409).json({ error: 'The professional is already booked at this time. Please select another time slot.' });
      }
    }

    const isInstant = !!req.body.isInstant;
    const estimatedCost = Number(req.body.estimatedCost) || 0;

    const booking = store.createBooking({
      bookingId: generateBookingId(),
      customerId: req.user!.userId,
      professionalId: professionalId as string,
      listingId: (req.body.listingId as string) || null,
      categoryName: (req.body.categoryName as string) || prof.skillCategory,
      subCategoryName: (req.body.subCategoryName as string) || null,
      jobDescription: jobDescription as string,
      status: isInstant ? 'CONFIRMED' : 'PENDING',
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate as string) : null,
      scheduledSlot: (req.body.scheduledSlot as string) || null,
      isInstant,
      address: address as string,
      addressLine2: (req.body.addressLine2 as string) || null,
      city: city as string,
      pincode: (req.body.pincode as string) || null,
      estimatedCost,
      customerNotes: (req.body.customerNotes as string) || null,
    });

    if (isInstant) {
      store.createPayment({
        bookingId: booking.id, amount: estimatedCost,
        platformCommission: estimatedCost * config.platformCommissionRate,
        status: 'PENDING',
      });
    }

    res.status(201).json({
      booking: store.getBookingWithRelations(booking.id),
      nextSteps: [
        `Booking ID: ${booking.bookingId}`,
        isInstant ? 'Professional has been notified. They will arrive shortly.' : 'Awaiting professional confirmation.',
        'You will receive a reminder 24 hours before the appointment.',
      ],
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    let bookings: any[] = [];
    if (req.user!.role === 'CUSTOMER') {
      bookings = store.findBookingsByCustomer(req.user!.userId);
    } else {
      const prof = store.findProfessionalByUserId(req.user!.userId);
      if (prof) bookings = store.findBookingsByProfessional(prof.id);
    }
    // Attach relations
    const result = bookings.map((b: any) => store.getBookingWithRelations(b.id));
    res.json(result);
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = store.getBookingWithRelations(req.params.id as string);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const userId = req.user!.userId;
    if (booking.customerId !== userId) {
      const prof = store.findProfessionalByUserId(userId);
      if (!prof || booking.professionalId !== prof.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.patch('/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const status = req.body.status as string;
    const notes = req.body.notes as string | undefined;
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'RESCHEDULED'],
      IN_PROGRESS: ['COMPLETED'],
    };

    const booking = store.findBookingById(req.params.id as string);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${booking.status} to ${status}` });
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') updateData.finalCost = booking.estimatedCost;
    if (status === 'CANCELLED') updateData.cancelledBy = req.user!.role;
    if (notes) {
      if (req.user!.role === 'PROFESSIONAL') updateData.professionalNotes = notes;
      else updateData.customerNotes = notes;
    }

    store.updateBooking(req.params.id as string, updateData);

    if (status === 'COMPLETED') {
      const payment = store.findPaymentByBookingId(booking.id);
      if (payment?.status === 'HELD_IN_ESCROW') {
        store.payments.update(payment.id, { status: 'RELEASED', releasedAt: new Date() });
        store.createPayout({
          professionalId: booking.professionalId,
          amount: payment.professionalEarning,
          status: 'processed',
          processedAt: new Date(),
        });
      }
    }

    res.json(store.getBookingWithRelations(req.params.id as string));
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

router.post('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const booking = store.findBookingById(req.params.id as string);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    const hoursUntilBooking = booking.scheduledDate
      ? (new Date(booking.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60) : 48;
    let cancellationFee = 0;
    if (hoursUntilBooking < 2 && booking.estimatedCost > 0) {
      cancellationFee = booking.estimatedCost * 0.25;
    }

    store.updateBooking(booking.id, {
      status: 'CANCELLED',
      cancelledBy: req.user!.role,
      cancelReason: (req.body.reason as string) || null,
      cancellationFee,
    });

    const payment = store.findPaymentByBookingId(booking.id);
    if (payment?.status === 'HELD_IN_ESCROW') {
      if (cancellationFee > 0) {
        store.payments.update(payment.id, {
          status: 'REFUNDED',
          professionalEarning: cancellationFee * 0.88,
          platformCommission: cancellationFee * 0.12,
        });
      } else {
        store.payments.update(payment.id, { status: 'REFUNDED' });
      }
    }

    res.json({
      message: cancellationFee > 0
        ? `Booking cancelled. A cancellation fee of ₹${cancellationFee} applies. Refund of ₹${booking.estimatedCost - cancellationFee} will be processed.`
        : 'Booking cancelled successfully. Full refund will be processed.',
    });
  } catch (err) {
    console.error('Cancellation error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

router.post('/:id/reschedule', authenticate, async (req: Request, res: Response) => {
  try {
    const scheduledDate = req.body.scheduledDate as string;
    if (!scheduledDate) return res.status(400).json({ error: 'New date is required' });

    const booking = store.findBookingById(req.params.id as string);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot reschedule' });
    }

    const scheduledDateInput = new Date(scheduledDate);
    const scheduledSlotInput = (req.body.scheduledSlot as string) || null;

    const existingBookings = store.findBookingsByProfessional(booking.professionalId);
    const isBooked = existingBookings.some((b: any) => {
      if (b.id === booking.id) return false;
      if (['CANCELLED', 'COMPLETED'].includes(b.status)) return false;
      if (!b.scheduledDate) return false;
      const sameDate = new Date(b.scheduledDate).toDateString() === scheduledDateInput.toDateString();
      const sameSlot = b.scheduledSlot === scheduledSlotInput;
      return sameDate && sameSlot;
    });

    if (isBooked) {
      return res.status(409).json({ error: 'The professional is already booked at this time. Please select another time slot.' });
    }

    store.updateBooking(booking.id, {
      scheduledDate: scheduledDateInput,
      scheduledSlot: (req.body.scheduledSlot as string) || null,
      status: booking.status === 'CONFIRMED' ? 'CONFIRMED' : 'RESCHEDULED',
      rescheduleCount: (booking.rescheduleCount || 0) + 1,
    });

    res.json({ message: `Booking rescheduled to ${new Date(scheduledDate).toLocaleDateString()}` });
  } catch (err) {
    console.error('Reschedule error:', err);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

export default router;
