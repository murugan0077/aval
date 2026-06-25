import { Router, Request, Response } from 'express';
import store from '../store';
import { config } from '../config';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/plans', (_req: Request, res: Response) => {
  res.json({
    plans: [
      {
        tier: 'PRO', name: 'Pro', price: config.premium.pro, period: 'monthly',
        features: ['Priority in search results', 'Pro badge on profile', '10% more visibility', 'Basic analytics'],
      },
      {
        tier: 'FEATURED', name: 'Featured', price: config.premium.featured, period: 'monthly',
        features: ['Top placement in search results', 'Featured badge', '50% more visibility', 'Advanced analytics', 'Dedicated support', 'Early access to new jobs'],
      },
    ],
  });
});

router.post('/subscribe', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const tier = req.body.tier as string;
    if (!['PRO', 'FEATURED'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Choose PRO or FEATURED' });
    }

    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const fee = tier === 'FEATURED' ? config.premium.featured : config.premium.pro;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const updated = store.updateProfessional(prof.id, { premiumTier: tier, premiumExpiry: expiry });

    res.json({
      message: `Upgraded to ${tier} tier successfully. ₹${fee} will be charged.`,
      professional: updated,
      validUntil: expiry,
      nextSteps: [
        'Your profile now has priority visibility in search results.',
        tier === 'FEATURED' ? 'Your listings will show the Featured badge.' : 'Your profile will show the Pro badge.',
        'Manage your subscription from profile settings.',
      ],
    });
  } catch (err) {
    console.error('Premium error:', err);
    res.status(500).json({ error: 'Failed to upgrade listing' });
  }
});

router.get('/suggest-upgrade', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    if (prof.premiumTier !== 'NONE') {
      return res.json({ eligible: false, message: 'You are already on a premium plan.' });
    }

    if (prof.totalReviews >= 5 && prof.averageRating >= 4.0) {
      return res.json({
        eligible: true,
        message: 'Your 5+ positive reviews make you a great candidate for premium listing!',
        recommended: 'FEATURED',
        plans: [
          { tier: 'PRO', price: config.premium.pro },
          { tier: 'FEATURED', price: config.premium.featured, recommended: true },
        ],
      });
    }

    res.json({
      eligible: false,
      message: `You need at least 5 positive reviews to qualify for premium. You currently have ${prof.totalReviews} review(s).`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check upgrade eligibility' });
  }
});

export default router;
