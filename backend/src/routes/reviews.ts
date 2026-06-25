import { Router, Request, Response } from 'express';
import store from '../store';
import { authenticate } from '../middleware/auth';

const router = Router();

const abusivePatterns = [
  /fuck/i, /shit/i, /bitch/i, /asshole/i, /damn/i,
  /gand/i, /bhosd/i, /madar/i, /behen/i, /chuti/i,
  /randi/i, /kutti/i, /harami/i, /suar/i,
];
const containsAbuse = (t: string) => abusivePatterns.some((p) => p.test(t));

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const bookingId = req.body.bookingId as string;
    const rating = Number(req.body.rating);
    const comment = req.body.comment as string | undefined;
    const isAnonymous = !!req.body.isAnonymous;

    if (!bookingId || !rating) return res.status(400).json({ error: 'Booking ID and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const booking = store.findBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId !== req.user!.userId) return res.status(403).json({ error: 'Only the customer can review' });
    if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only review completed bookings' });
    if (store.findReviewByBookingId(bookingId)) return res.status(409).json({ error: 'Review already exists' });

    const isFlagged = comment ? containsAbuse(comment) : false;

    store.createReview({
      bookingId,
      professionalId: booking.professionalId,
      reviewerId: req.user!.userId,
      rating,
      comment: comment || null,
      isAnonymous,
      isFlagged,
      isPublished: !isFlagged,
      flagReason: isFlagged ? 'Flagged for moderation: potentially abusive language' : null,
    });

    if (!isFlagged) {
      const stats = store.aggregateReviews(booking.professionalId);
      store.updateProfessional(booking.professionalId, {
        averageRating: stats.avg,
        totalReviews: stats.count,
      });
      if (stats.avg < 3.5 && stats.avg > 0) {
        console.log(`[ALERT] Rating drop for professional ${booking.professionalId}: ${stats.avg}`);
      }
    }

    res.status(201).json({
      message: isFlagged
        ? 'Your review has been flagged for moderation and will be reviewed before publishing.'
        : 'Thank you for your review!',
      moderated: isFlagged,
    });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.get('/professional/:professionalId', async (req: Request, res: Response) => {
  try {
    const reviews = store.findReviewsByProfessional(req.params.professionalId as string);
    const anon = reviews.map((r: any) => ({
      ...r,
      reviewer: r.isAnonymous ? { name: 'Anonymous' } : (store.findUserById(r.reviewerId) ? { name: store.findUserById(r.reviewerId).name } : { name: 'Unknown' }),
    }));
    res.json(anon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
