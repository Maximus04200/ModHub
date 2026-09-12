import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

export const authRouter = Router();

authRouter.use(authRateLimiter);
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
