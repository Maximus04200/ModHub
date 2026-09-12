import { Router } from 'express';
import { modController } from '../controllers/mod.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

export const modRouter = Router();

modRouter.get('/', modController.search);
modRouter.get('/feed', requireAuth, modController.feed);
modRouter.get('/:slug', modController.getBySlug);

modRouter.post('/', requireAuth, modController.create);
modRouter.post('/:id/versions', requireAuth, modController.addVersion);
modRouter.post('/:id/ratings', requireAuth, modController.rate);
modRouter.post('/:id/comments', requireAuth, modController.comment);
modRouter.post('/:id/follow', requireAuth, modController.follow);
modRouter.delete('/:id/follow', requireAuth, modController.unfollow);
modRouter.patch('/:id/moderate', requireAuth, requireRole('ADMIN'), modController.moderate);
