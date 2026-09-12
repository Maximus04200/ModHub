import type { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  displayName: z.string().min(2).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, displayName } = registerSchema.parse(req.body);
    const result = await authService.register(email, password, displayName);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.status(200).json(result);
  },
};
