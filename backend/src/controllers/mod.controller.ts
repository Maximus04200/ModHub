import type { Request, Response } from 'express';
import { z } from 'zod';
import { modService } from '../services/mod.service';
import { AppError, requireParam } from '../utils/AppError';

const createModSchema = z.object({
  title: z.string().min(3).max(100),
  summary: z.string().min(10).max(300),
  description: z.string().min(20),
  gameKey: z.string().min(2),
  categoryId: z.string().uuid(),
  gameMetadata: z.record(z.string(), z.unknown()).optional(),
});

const addVersionSchema = z.object({
  versionLabel: z.string().min(1).max(30),
  changelog: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.coerce.number().int().positive(),
});

const rateSchema = z.object({ value: z.coerce.number().int().min(1).max(5) });
const commentSchema = z.object({ body: z.string().min(1).max(2000) });
const moderateSchema = z.object({ status: z.enum(['APPROVED', 'REJECTED']) });

function requireAuthUser(req: Request): { userId: string } {
  if (!req.auth) {
    throw new AppError(401, 'Authentification requise');
  }
  return { userId: req.auth.userId };
}

export const modController = {
  async create(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    const input = createModSchema.parse(req.body);
    const mod = await modService.createMod(userId, input);
    res.status(201).json(mod);
  },

  async search(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page) || 1);
    const result = await modService.search(
      {
        gameKey: typeof req.query.gameKey === 'string' ? req.query.gameKey : undefined,
        categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
        search: typeof req.query.q === 'string' ? req.query.q : undefined,
      },
      page,
    );
    res.json(result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const mod = await modService.getBySlug(requireParam(req.params.slug));
    res.json(mod);
  },

  async addVersion(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    const input = addVersionSchema.parse(req.body);
    const version = await modService.addVersion(requireParam(req.params.id), userId, input);
    res.status(201).json(version);
  },

  async rate(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    const { value } = rateSchema.parse(req.body);
    const result = await modService.rate(requireParam(req.params.id), userId, value);
    res.json(result);
  },

  async comment(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    const { body } = commentSchema.parse(req.body);
    const comment = await modService.comment(requireParam(req.params.id), userId, body);
    res.status(201).json(comment);
  },

  async follow(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    await modService.follow(requireParam(req.params.id), userId);
    res.status(204).send();
  },

  async unfollow(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    await modService.unfollow(requireParam(req.params.id), userId);
    res.status(204).send();
  },

  async feed(req: Request, res: Response): Promise<void> {
    const { userId } = requireAuthUser(req);
    const feed = await modService.feedFor(userId);
    res.json(feed);
  },

  async moderate(req: Request, res: Response): Promise<void> {
    const { status } = moderateSchema.parse(req.body);
    const mod = await modService.moderate(requireParam(req.params.id), status);
    res.json(mod);
  },
};
