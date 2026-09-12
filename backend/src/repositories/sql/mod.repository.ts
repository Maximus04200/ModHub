import { prisma } from '../../config/prisma';
import type { Mod, ModStatus, Prisma } from '@prisma/client';

export interface ModSearchFilters {
  gameKey?: string;
  categoryId?: string;
  search?: string;
  status?: ModStatus;
}

export const modRepository = {
  create(data: Prisma.ModCreateInput): Promise<Mod> {
    return prisma.mod.create({ data });
  },

  findBySlug(slug: string) {
    return prisma.mod.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, displayName: true } },
        category: true,
        versions: { orderBy: { createdAt: 'desc' } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, displayName: true } } },
        },
        _count: { select: { ratings: true, comments: true, follows: true } },
      },
    });
  },

  findById(id: string): Promise<Mod | null> {
    return prisma.mod.findUnique({ where: { id } });
  },

  search(filters: ModSearchFilters, skip: number, take: number) {
    const where: Prisma.ModWhereInput = {
      status: filters.status ?? 'APPROVED',
      ...(filters.gameKey && { gameKey: filters.gameKey }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { summary: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.mod.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { category: true, author: { select: { id: true, displayName: true } } },
      }),
      prisma.mod.count({ where }),
    ]);
  },

  updateStatus(id: string, status: ModStatus): Promise<Mod> {
    return prisma.mod.update({ where: { id }, data: { status } });
  },

  addVersion(modId: string, data: Omit<Prisma.VersionCreateInput, 'mod'>) {
    return prisma.version.create({ data: { ...data, mod: { connect: { id: modId } } } });
  },

  upsertRating(modId: string, userId: string, value: number) {
    return prisma.rating.upsert({
      where: { modId_userId: { modId, userId } },
      update: { value },
      create: { modId, userId, value },
    });
  },

  averageRating(modId: string) {
    return prisma.rating.aggregate({ where: { modId }, _avg: { value: true }, _count: true });
  },

  addComment(modId: string, userId: string, body: string) {
    return prisma.comment.create({ data: { modId, userId, body } });
  },

  follow(modId: string, userId: string) {
    return prisma.follow.upsert({
      where: { modId_userId: { modId, userId } },
      update: {},
      create: { modId, userId },
    });
  },

  unfollow(modId: string, userId: string) {
    return prisma.follow.delete({ where: { modId_userId: { modId, userId } } });
  },

  followedModIds(userId: string): Promise<string[]> {
    return prisma.follow
      .findMany({ where: { userId }, select: { modId: true } })
      .then((rows) => rows.map((r) => r.modId));
  },

  findByAuthor(authorId: string) {
    return prisma.mod.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  },

  findByStatus(status: ModStatus) {
    return prisma.mod.findMany({
      where: { status },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, displayName: true } }, category: true },
    });
  },
};
