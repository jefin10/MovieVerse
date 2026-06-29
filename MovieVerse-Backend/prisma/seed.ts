import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: seed genres/languages and import movies (port load_*_from_excel / sync_tmdb_catalog).
  console.log('seed: nothing to do yet');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
