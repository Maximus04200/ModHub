import { modRepository, type ModSearchFilters } from '../repositories/sql/mod.repository';
import { activityRepository } from '../repositories/nosql/activity.repository';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slug';
import type { ModStatus } from '@prisma/client';

interface CreateModInput {
  title: string;
  summary: string;
  description: string;
  gameKey: string;
  categoryId: string;
  gameMetadata?: Record<string, unknown>;
}

interface AddVersionInput {
  versionLabel: string;
  changelog: string;
  fileUrl: string;
  fileSizeBytes: number;
}

const PAGE_SIZE = 20;

export const modService = {
  async createMod(authorId: string, input: CreateModInput) {
    const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;

    const mod = await modRepository.create({
      title: input.title,
      slug,
      summary: input.summary,
      description: input.description,
      gameKey: input.gameKey,
      author: { connect: { id: authorId } },
      category: { connect: { id: input.categoryId } },
    });

    if (input.gameMetadata) {
      await activityRepository.setMetadata(mod.id, input.gameKey, input.gameMetadata);
    }
    await activityRepository.record('NEW_MOD', mod.id, authorId, { title: mod.title });

    return mod;
  },

  async search(filters: ModSearchFilters, page: number) {
    const skip = (page - 1) * PAGE_SIZE;
    const [items, total] = await modRepository.search(filters, skip, PAGE_SIZE);
    return { items, total, page, pageSize: PAGE_SIZE };
  },

  async getBySlug(slug: string) {
    const mod = await modRepository.findBySlug(slug);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    const metadata = await activityRepository.getMetadata(mod.id);
    return { ...mod, metadata: metadata?.fields ?? {} };
  },

  async addVersion(modId: string, authorId: string, input: AddVersionInput) {
    const mod = await modRepository.findById(modId);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    if (mod.authorId !== authorId) {
      throw new AppError(403, 'Seul l\'auteur du mod peut publier une version');
    }

    const version = await modRepository.addVersion(modId, input);
    await activityRepository.record('NEW_VERSION', modId, authorId, {
      versionLabel: version.versionLabel,
    });

    return version;
  },

  async rate(modId: string, userId: string, value: number) {
    if (value < 1 || value > 5) {
      throw new AppError(400, 'La note doit être comprise entre 1 et 5');
    }
    const mod = await modRepository.findById(modId);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    await modRepository.upsertRating(modId, userId, value);
    return modRepository.averageRating(modId);
  },

  async comment(modId: string, userId: string, body: string) {
    const mod = await modRepository.findById(modId);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    const comment = await modRepository.addComment(modId, userId, body);
    await activityRepository.record('NEW_COMMENT', modId, userId, {
      commentPreview: body.slice(0, 120),
    });
    return comment;
  },

  async follow(modId: string, userId: string) {
    const mod = await modRepository.findById(modId);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    return modRepository.follow(modId, userId);
  },

  unfollow(modId: string, userId: string) {
    return modRepository.unfollow(modId, userId);
  },

  async feedFor(userId: string) {
    const modIds = await modRepository.followedModIds(userId);
    if (modIds.length === 0) {
      return [];
    }
    return activityRepository.feedForMods(modIds, 50);
  },

  myMods(authorId: string) {
    return modRepository.findByAuthor(authorId);
  },

  pendingMods() {
    return modRepository.findByStatus('PENDING');
  },

  async moderate(modId: string, status: ModStatus) {
    const mod = await modRepository.findById(modId);
    if (!mod) {
      throw new AppError(404, 'Mod introuvable');
    }
    return modRepository.updateStatus(modId, status);
  },
};
