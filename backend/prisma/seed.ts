import { prisma } from '../src/config/prisma';

const categories = [
  { name: 'Gameplay', slug: 'gameplay' },
  { name: 'Graphismes', slug: 'graphismes' },
  { name: 'Cartes', slug: 'cartes' },
  { name: 'Interface', slug: 'interface' },
];

async function main(): Promise<void> {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`${categories.length} catégories prêtes.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
