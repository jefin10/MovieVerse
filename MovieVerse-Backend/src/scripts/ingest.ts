import { readFile } from 'node:fs/promises';
import { prisma } from '../config/prisma.js';

// Loads the bundled catalog (prisma/data/movies.json, built by
// src/scripts/build-catalog.ts). Safe to re-run: a movie is matched on its TMDB
// id (or, for older rows without one, title + director) and updated in place,
// never duplicated. Rows have no ourRating, so ratings from real users are kept.
// With --prune, movies that are no longer in the catalog are deleted, along
// with their watchlist entries, ratings and swipes.
//   npm run db:ingest [-- --prune]                                  (local)
//   docker compose exec backend npm run db:ingest:prod [-- --prune] (deployed)

interface MovieRow {
  tmdbId: number;
  imdbId: string;
  title: string;
  originalTitle: string;
  description: string;
  tagline: string;
  director: string;
  star1: string;
  star2: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  runtime: number | null;
  status: string;
  homepage: string;
  imdbRating: number;
  imdbVotes: number;
  tmdbVoteAverage: number;
  voteCount: number;
  budget: number;
  revenue: number;
  trailerKey: string;
  trailerUrl: string;
  trailerName: string;
  genres: string[];
  sources: string[];
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
  const args = process.argv.slice(2);
  const prune = args.includes('--prune');
  const file = args.find((a) => !a.startsWith('--')) ?? 'prisma/data/movies.json';
  const rows = JSON.parse(await readFile(file, 'utf8')) as MovieRow[];

  await prisma.genre.createMany({
    data: Object.entries(GENRE_IDS).map(([name, id]) => ({ id, name })),
    skipDuplicates: true,
  });

  let created = 0;
  let updated = 0;
  const keep: number[] = [];
  for (const { genres, sources: _sources, imdbVotes: _votes, releaseDate, budget, revenue, ...row } of rows) {
    const unknown = genres.find((g) => !(g in GENRE_IDS));
    if (unknown) throw new Error(`Unknown genre "${unknown}" on "${row.title}"`);

    // The discovery feed sorts on popularity; IMDb rating puts the
    // best-rated movies in its pool.
    const data = {
      ...row,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      budget: BigInt(budget),
      revenue: BigInt(revenue),
      popularity: row.imdbRating,
    };
    const connect = genres.map((name) => ({ id: GENRE_IDS[name] }));

    const existing =
      (await prisma.movie.findUnique({ where: { tmdbId: row.tmdbId }, select: { id: true } })) ??
      (await prisma.movie.findFirst({
        where: { tmdbId: null, title: row.title, director: row.director },
        select: { id: true },
      }));
    if (existing) {
      await prisma.movie.update({
        where: { id: existing.id },
        data: { ...data, genres: { set: connect } },
      });
      keep.push(existing.id);
      updated += 1;
    } else {
      const movie = await prisma.movie.create({ data: { ...data, genres: { connect } }, select: { id: true } });
      keep.push(movie.id);
      created += 1;
    }
  }

  let pruned = 0;
  if (prune) {
    // Cascades remove the movies' watchlist entries, ratings, swipes and providers.
    ({ count: pruned } = await prisma.movie.deleteMany({ where: { id: { notIn: keep } } }));
  }

  const total = await prisma.movie.count();
  console.log(
    `ingest complete: ${created} created, ${updated} updated, ${pruned} pruned, ${total} movies in total`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
