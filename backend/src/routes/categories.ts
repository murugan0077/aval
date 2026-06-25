import { Router, Request, Response } from 'express';
import store from '../store';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = store.findCategories().map((cat: any) => ({
      ...cat,
      subCategories: store.findSubCategoriesByCategory(cat.id),
    }));
    res.json(categories);
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = store.findCategoryById(req.params.id as string);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({
      ...category,
      subCategories: store.findSubCategoriesByCategory(category.id),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
