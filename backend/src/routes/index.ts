import { Router } from 'express';
import { authRouter } from './auth.routes';
import { modRouter } from './mod.routes';
import { categoryRouter } from './category.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/mods', modRouter);
apiRouter.use('/categories', categoryRouter);
