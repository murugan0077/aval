import { Router, Request, Response } from 'express';
import store from '../store';
import { authenticate, requireRole } from '../middleware/auth';
import { generateVerificationBadge } from '../utils/language';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const minRating = req.query.minRating as string | undefined;
    const sort = req.query.sort as string | undefined;
    const city = req.query.city as string | undefined;

    let results = store.searchProfessionals({
      category,
      city,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sort,
    });

    // Attach user info and listing data
    const result = results.slice(0, 20).map((p: any) => {
      const user = store.findUserById(p.userId);
      const listings = store.findListingsByProfessional(p.id);
      return {
        id: p.id, name: user?.name || '', category: p.skillCategory,
        subSkills: p.subSkills, rating: p.averageRating,
        totalReviews: p.totalReviews, experience: p.yearsOfExperience,
        city: user?.city || '',
        distance: Math.floor(Math.random() * 10) + 1,
        startingPrice: listings[0]?.price || null,
        priceUnit: listings[0]?.priceUnit || 'per visit',
        availableNow: p.availabilityNow, premiumTier: p.premiumTier,
        verificationBadge: p.verificationBadge,
      };
    });

    // Price sort (can't do in indexed search)
    if (sort === 'price_asc') {
      result.sort((a: any, b: any) => (a.startingPrice || Infinity) - (b.startingPrice || Infinity));
    }

    res.json(result);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search professionals' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prof = store.getProfessionalWithRelations(req.params.id as string);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });
    res.json(prof);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch professional profile' });
  }
});

router.put('/onboarding', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional profile not found' });

    const updateData: any = {};
    const fields = ['skillCategory', 'subSkills', 'description', 'idProofType', 'idProofUrl', 'portfolioUrls'];
    fields.forEach((f) => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });
    if (req.body.yearsOfExperience !== undefined) updateData.yearsOfExperience = Number(req.body.yearsOfExperience);
    if (req.body.serviceRadiusKm !== undefined) updateData.serviceRadiusKm = Number(req.body.serviceRadiusKm);

    const current = { ...prof, ...updateData };
    if (current.skillCategory && current.yearsOfExperience > 0) {
      updateData.isProfileComplete = true;
      updateData.verificationStatus = 'VERIFIED';
      updateData.isVerified = true;
      updateData.verificationBadge = generateVerificationBadge(current.yearsOfExperience, req.lang || 'en');
    }

    const updated = store.updateProfessional(prof.id, updateData);

    if (req.body.availability && Array.isArray(req.body.availability)) {
      store.setAvailability(prof.id, req.body.availability);
    }

    res.json({ message: 'Profile updated successfully', professional: updated, isComplete: updated?.isProfileComplete });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/services', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const listing = store.createServiceListing({
      professionalId: prof.id,
      categoryId: req.body.categoryId as string,
      subCategoryId: (req.body.subCategoryId as string) || null,
      price: Number(req.body.price) || null,
      priceUnit: (req.body.priceUnit as string) || 'per visit',
      isCustomPricing: !!req.body.isCustomPricing,
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error('Service creation error:', err);
    res.status(500).json({ error: 'Failed to add service' });
  }
});

router.put('/services/:id', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const listingId = req.params.id as string;
    const listing = store.findListingsByProfessional(prof.id).find((l: any) => l.id === listingId);
    if (!listing) return res.status(404).json({ error: 'Service not found' });

    const updated = store.updateServiceListing(listingId, {
      categoryId: req.body.categoryId as string,
      subCategoryId: (req.body.subCategoryId as string) || null,
      price: Number(req.body.price) || null,
      priceUnit: (req.body.priceUnit as string) || 'per visit',
      isCustomPricing: !!req.body.isCustomPricing,
    });
    res.json(updated);
  } catch (err) {
    console.error('Service update error:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', authenticate, requireRole('PROFESSIONAL'), async (req: Request, res: Response) => {
  try {
    const prof = store.findProfessionalByUserId(req.user!.userId);
    if (!prof) return res.status(404).json({ error: 'Professional not found' });

    const listingId = req.params.id as string;
    const listing = store.findListingsByProfessional(prof.id).find((l: any) => l.id === listingId);
    if (!listing) return res.status(404).json({ error: 'Service not found' });

    store.deleteServiceListing(listingId);
    res.json({ message: 'Service removed' });
  } catch (err) {
    console.error('Service deletion error:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

router.get('/:id/availability', async (req: Request, res: Response) => {
  try {
    const availability = store.findAvailability(req.params.id as string);
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
