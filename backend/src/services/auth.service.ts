import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/sql/user.repository';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

interface AuthResult {
  token: string;
  user: { id: string; email: string; displayName: string; role: Role };
}

function signToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, 'Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ email, passwordHash, displayName });

    return {
      token: signToken(user.id, user.role),
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Identifiants invalides');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Identifiants invalides');
    }

    return {
      token: signToken(user.id, user.role),
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    };
  },
};
