import { Router, Request, Response } from 'express';
import store from '../store';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const phone = req.body.phone as string;
    const category = req.body.category as string;
    const city = req.body.city as string;

    if (!phone || !category || !city) {
      return res.status(400).json({ error: 'Phone, category, and city are required' });
    }

    const entry = store.createWaitlistEntry({
      customerId: (req.body.customerId as string) || null,
      customerName: (req.body.customerName as string) || null,
      phone, category, city,
      pincode: (req.body.pincode as string) || null,
    });

    res.status(201).json({
      entry,
      message: `You've been added to the waitlist for ${category} services in ${city}. We'll notify you when a verified professional becomes available.`,
    });
  } catch (err) {
    console.error('Waitlist error:', err);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

export default router;
