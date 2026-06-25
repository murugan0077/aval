import { Router, Request, Response } from 'express';
import store from '../store';
import { generateVerificationBadge } from '../utils/language';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/disputes', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const disputes = store.disputes.filter((d: any) => d.status !== 'RESOLVED')
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const result = disputes.map((d: any) => {
      const user = store.findUserById(d.raisedById);
      const booking = d.bookingId ? store.findBookingById(d.bookingId) : null;
      return {
        ...d,
        raisedBy: user ? { name: user.name, phone: user.phone } : null,
        booking: booking ? { bookingId: booking.bookingId, status: booking.status } : null,
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

router.patch('/disputes/:id/resolve', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const dispute = store.disputes.update(req.params.id as string, {
      status: (req.body.status as string) || 'RESOLVED',
      resolution: (req.body.resolution as string) || null,
      assignedTo: req.user!.userId,
    });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

router.get('/professionals/pending', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const pending = store.professionals.filter((p: any) => p.verificationStatus === 'PENDING' && p.isProfileComplete);
    const result = pending.map((p: any) => {
      const user = store.findUserById(p.userId);
      return { ...p, user: user ? { name: user.name, phone: user.phone, createdAt: user.createdAt } : null };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

router.patch('/professionals/:id/verify', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const status = req.body.status as string;
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be VERIFIED or REJECTED' });
    }

    const prof = store.findProfessionalById(req.params.id as string);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const updated = store.updateProfessional(prof.id, {
      verificationStatus: status,
      isVerified: status === 'VERIFIED',
      verificationBadge: status === 'VERIFIED'
        ? generateVerificationBadge(prof.yearsOfExperience)
        : null,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

export default router;
