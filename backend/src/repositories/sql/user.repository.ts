import { prisma } from '../../config/prisma';
import type { User } from '@prisma/client';

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    return prisma.user.create({ data });
  },
};
