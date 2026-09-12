import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { connectMongo, disconnectMongo } from '../src/config/mongo';

const app = createApp();

const testUser = {
  email: `test-${Date.now()}@modhub.dev`,
  password: 'SuperSecret123',
  displayName: 'Testeur',
};

beforeAll(async () => {
  await connectMongo();
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
  await disconnectMongo();
});

describe('Auth flow', () => {
  it('refuse une inscription avec un mot de passe trop court', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, password: '123' });

    expect(res.status).toBe(400);
  });

  it('inscrit un nouvel utilisateur et renvoie un token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('refuse une inscription en double sur le même email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('connecte l\'utilisateur avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('refuse la connexion avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});
