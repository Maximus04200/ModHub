import { Router } from 'express';
import { authRouter } from './auth.routes';
import { modRouter } from './mod.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/mods', modRouter);
