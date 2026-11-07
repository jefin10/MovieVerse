import { readFile } from 'node:fs/promises';
import { prisma } from '../config/prisma.js';

// Loads the bundled catalog (prisma/data/movies.json). Safe to re-run: movies
// are matched on title + director and updated in place, never duplicated. It
// has no ourRating, so re-running never touches ratings from real users.
//   npm run db:ingest                                  (local)
//   docker compose exec backend npm run db:ingest:prod (deployed)

interface MovieRow {
  title: string;
  description: string;
  director: string;
  star1: string;
  star2: string;
  posterUrl: string;
  imdbRating: number;
  genres: string[];
}

// TMDB's ids, so a movie fetched from TMDB later lands on the same genre row.
// The 900000s are IMDb genres TMDB has no id for.
const GENRE_IDS: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  // Named as the mood model labels it, so a predicted genre finds these movies.
  'Sci-Fi': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
  Biography: 900001,
  Musical: 900002,
  'Film-Noir': 900003,
  Sport: 900004,
};

async function main() {
  const file = process.argv[2] ?? 'prisma/data/movies.json';
  const rows = JSON.parse(await readFile(file, 'utf8')) as MovieRow[];

  await prisma.genre.createMany({
    data: Object.entries(GENRE_IDS).map(([name, id]) => ({ id, name })),
    skipDuplicates: true,
  });

  let created = 0;
  let updated = 0;
  for (const { genres, ...row } of rows) {
    const unknown = genres.find((g) => !(g in GENRE_IDS));
    if (unknown) throw new Error(`Unknown genre "${unknown}" on "${row.title}"`);

    // The catalog has no popularity figures; the discovery feed sorts on this
    // field, so IMDb rating puts the best-rated movies in its pool.
    const data = { ...row, popularity: row.imdbRating };
    const connect = genres.map((name) => ({ id: GENRE_IDS[name] }));

    const existing = await prisma.movie.findFirst({
      where: { title: row.title, director: row.director },
      select: { id: true },
    });
    if (existing) {
      await prisma.movie.update({
        where: { id: existing.id },
        data: { ...data, genres: { set: connect } },
      });
      updated += 1;
    } else {
      await prisma.movie.create({ data: { ...data, genres: { connect } } });
      created += 1;
    }
  }

  const total = await prisma.movie.count();
  console.log(`ingest complete: ${created} created, ${updated} updated, ${total} movies in total`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
