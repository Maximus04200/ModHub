import { Router } from 'express';
import { categoryRepository } from '../repositories/sql/category.repository';

export const categoryRouter = Router();

categoryRouter.get('/', async (_req, res) => {
  const categories = await categoryRepository.findAll();
  res.json(categories);
});
