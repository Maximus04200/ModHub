import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { connectMongo, disconnectMongo } from '../src/config/mongo';
import { ActivityEventModel } from '../src/models/mongo/ActivityEvent';
import { ModMetadataModel } from '../src/models/mongo/ModMetadata';

const app = createApp();

const creator = {
  email: `creator-${Date.now()}@modhub.dev`,
  password: 'SuperSecret123',
  displayName: 'Créateur Test',
};

let token: string;
let categoryId: string;
let modId: string;
let modSlug: string;

beforeAll(async () => {
  await connectMongo();
  const category = await prisma.category.findFirstOrThrow();
  categoryId = category.id;

  const res = await request(app).post('/api/auth/register').send(creator);
  token = res.body.token;
});

afterAll(async () => {
  await ActivityEventModel.deleteMany({ modId });
  await ModMetadataModel.deleteMany({ modId });
  const user = await prisma.user.findUnique({ where: { email: creator.email } });
  if (user) {
    await prisma.mod.deleteMany({ where: { authorId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.$disconnect();
  await disconnectMongo();
});

describe('Mods flow (SQL + NoSQL)', () => {
  it('crée un mod (Postgres) et enregistre ses métadonnées jeu (Mongo)', async () => {
    const res = await request(app)
      .post('/api/mods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Realistic Military Movement',
        summary: 'Ajoute des animations militaires réalistes pour Arma Reforger.',
        description: 'Description longue et détaillée du mod, largement suffisante.',
        gameKey: 'arma-reforger',
        categoryId,
        gameMetadata: { workshopId: 'RMM-001', requiredDLC: ['none'] },
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    modId = res.body.id;
    modSlug = res.body.slug;

    const metadata = await ModMetadataModel.findOne({ modId }).lean();
    expect(metadata?.gameKey).toBe('arma-reforger');
    expect((metadata?.fields as Record<string, unknown>).workshopId).toBe('RMM-001');

    const events = await ActivityEventModel.find({ modId }).lean();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('NEW_MOD');
  });

  it('ajoute une version et journalise l\'événement dans le fil d\'activité', async () => {
    const res = await request(app)
      .post(`/api/mods/${modId}/versions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        versionLabel: '1.0.0',
        changelog: 'Première version publique',
        fileUrl: '/uploads/rmm-1.0.0.zip',
        fileSizeBytes: 1024,
      });

    expect(res.status).toBe(201);

    const events = await ActivityEventModel.find({ modId, type: 'NEW_VERSION' }).lean();
    expect(events).toHaveLength(1);
  });

  it('refuse la publication de version par un utilisateur non-auteur', async () => {
    const other = {
      email: `other-${Date.now()}@modhub.dev`,
      password: 'SuperSecret123',
      displayName: 'Autre',
    };
    const otherRes = await request(app).post('/api/auth/register').send(other);

    const res = await request(app)
      .post(`/api/mods/${modId}/versions`)
      .set('Authorization', `Bearer ${otherRes.body.token}`)
      .send({
        versionLabel: '2.0.0',
        changelog: 'Tentative non autorisée',
        fileUrl: '/uploads/x.zip',
        fileSizeBytes: 10,
      });

    expect(res.status).toBe(403);

    await prisma.user.delete({ where: { id: otherRes.body.user.id } });
  });

  it('récupère un mod par son slug avec ses métadonnées fusionnées', async () => {
    const res = await request(app).get(`/api/mods/${modSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Realistic Military Movement');
    expect(res.body.metadata.workshopId).toBe('RMM-001');
    expect(res.body.versions).toHaveLength(1);
  });
});
