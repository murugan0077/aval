import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import store from '../store';
import { config } from '../config';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const phone = req.body.phone as string;
    const password = req.body.password as string;
    const name = req.body.name as string;
    const role = req.body.role as string | undefined;

    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    if (store.findUserByPhone(phone)) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = store.createUser({
      phone, passwordHash, name, role: role || 'CUSTOMER',
    });

    if (role === 'PROFESSIONAL') {
      store.createProfessional({ userId: user.id, skillCategory: '', yearsOfExperience: 0 });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const phone = req.body.phone as string;
    const password = req.body.password as string;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = store.findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this phone number' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.post('/upgrade-professional', authenticate, async (req: Request, res: Response) => {
  try {
    const user = store.findUserById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (store.findProfessionalByUserId(user.id)) {
      return res.status(409).json({ error: 'You already have a professional account' });
    }

    store.users.update(user.id, { role: 'PROFESSIONAL' });
    const prof = store.createProfessional({ userId: user.id, skillCategory: '', yearsOfExperience: 0 });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: 'PROFESSIONAL' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({ token, professional: prof, message: 'Professional account created! Complete your profile to go live.' });
  } catch (err) {
    console.error('Upgrade error:', err);
    res.status(500).json({ error: 'Failed to upgrade account' });
  }
});

router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const name = req.body.name as string | undefined;
    const preferredLang = req.body.preferredLang as string | undefined;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (preferredLang) updateData.preferredLang = preferredLang;
    const updated = store.updateUser(req.user!.userId, updateData);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: updated.id, name: updated.name, phone: updated.phone, role: updated.role, preferredLang: updated.preferredLang } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/location', authenticate, async (req: Request, res: Response) => {
  try {
    const { city, pincode, state, lat, lng } = req.body;
    const updated = store.updateUser(req.user!.userId, { city, pincode, state, lat, lng });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Location updated', user: { id: updated.id, city: updated.city, pincode: updated.pincode, state: updated.state, lat: updated.lat, lng: updated.lng } });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = store.findUserById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const prof = store.findProfessionalByUserId(user.id);
    let professionalWithRelations = null;
    if (prof) {
      const listings = store.findListingsByProfessional(prof.id).map((l: any) => ({
        ...l, category: store.findCategoryById(l.categoryId) || null,
        subCategory: l.subCategoryId ? store.serviceSubCategories.byId(l.subCategoryId) : null,
      }));
      const avail = store.findAvailability(prof.id);
      const { passwordHash: _, ...safeUser } = user;
      professionalWithRelations = { ...prof, user: safeUser, serviceListings: listings, availability: avail };
    }
    const { passwordHash, ...safe } = user;
    res.json({ ...safe, professional: professionalWithRelations });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
