import { createApp } from './app';
import { env } from './config/env';
import { connectMongo } from './config/mongo';

async function main(): Promise<void> {
  await connectMongo();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`ModHub API à l'écoute sur le port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Échec du démarrage du serveur:', err);
  process.exit(1);
});
