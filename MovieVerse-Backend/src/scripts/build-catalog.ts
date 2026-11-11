import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { createGunzip } from 'node:zlib';

// Builds prisma/data/movies.json, the catalog that `npm run db:ingest` loads.
//
// The catalog is:
//   - IMDb's most-voted feature films (500 by default; --top N to change)
//   - every film directed by Christopher Nolan, Denis Villeneuve and Steven Spielberg
//   - the big franchises: Star Wars, Marvel (MCU plus the Spider-Man, X-Men,
//     Deadpool, Wolverine, Venom and Spider-Verse films), DC (live action since
//     2000), Transformers, Fast & Furious, Middle-earth, the Wizarding World,
//     James Bond (2000 on), Mission: Impossible, John Wick and Pirates of the
//     Caribbean
//
// Ratings and vote counts come from IMDb's public dataset; everything else from TMDB.
//   curl -O https://datasets.imdbws.com/title.ratings.tsv.gz
//   TMDB_API_KEY=... npx tsx src/scripts/build-catalog.ts title.ratings.tsv.gz [--top 500]

const KEY = process.env.TMDB_API_KEY ?? '';
const TMDB = 'https://api.themoviedb.org/3';
const TODAY = new Date().toISOString().slice(0, 10);
const OUT = 'prisma/data/movies.json';
const MOST_VOTED = 'IMDb most voted';

const DIRECTORS = ['Christopher Nolan', 'Denis Villeneuve', 'Steven Spielberg'];

// TMDB collection ids. `since` keeps only films released on or after that date.
const COLLECTIONS: { id: number; name: string; since?: string }[] = [
  { id: 10, name: 'Star Wars' },
  { id: 556, name: 'Marvel' }, // Spider-Man (Raimi)
  { id: 125574, name: 'Marvel' }, // The Amazing Spider-Man
  { id: 573436, name: 'Marvel' }, // Spider-Verse
  { id: 748, name: 'Marvel' }, // X-Men
  { id: 448150, name: 'Marvel' }, // Deadpool
  { id: 453993, name: 'Marvel' }, // Wolverine
  { id: 558216, name: 'Marvel' }, // Venom
  { id: 8650, name: 'Transformers', since: '2000-01-01' },
  { id: 9485, name: 'Fast & Furious' },
  { id: 119, name: 'Middle-earth' },
  { id: 121938, name: 'Middle-earth' },
  { id: 1241, name: 'Wizarding World' },
  { id: 435259, name: 'Wizarding World' },
  { id: 645, name: 'James Bond', since: '2000-01-01' },
  { id: 87359, name: 'Mission: Impossible' },
  { id: 404609, name: 'John Wick' },
  { id: 295, name: 'Pirates of the Caribbean' },
];

// Studio filmographies, read through /discover.
const STUDIOS: { name: string; params: Record<string, string> }[] = [
  {
    name: 'Marvel', // Marvel Studios: the MCU
    params: { with_companies: '420', 'with_runtime.gte': '70', without_genres: '99,10770' },
  },
  {
    name: 'DC', // DC Entertainment, DC Films, DC Studios, DC Comics; live action since 2000
    params: {
      with_companies: '9993|128064|184898|429',
      'primary_release_date.gte': '2000-01-01',
      'vote_count.gte': '1500',
      'with_runtime.gte': '70',
      without_genres: '16,99,10770',
    },
  },
];

// Single films outside any collection.
const EXTRA: { title: string; year: number; name: string }[] = [
  { title: 'Rogue One: A Star Wars Story', year: 2016, name: 'Star Wars' },
  { title: 'Solo: A Star Wars Story', year: 2018, name: 'Star Wars' },
  { title: 'Bumblebee', year: 2018, name: 'Transformers' },
  { title: 'Transformers: Rise of the Beasts', year: 2023, name: 'Transformers' },
  { title: 'Transformers One', year: 2024, name: 'Transformers' },
  { title: 'Ballerina', year: 2025, name: 'John Wick' },
  { title: 'Joker: Folie à Deux', year: 2024, name: 'DC' },
];

// TMDB genre names -> the catalog's genre names (see GENRE_IDS in ingest.ts).
// Anything else (TV Movie, Documentary) is dropped.
const GENRES: Record<string, string> = {
  Action: 'Action',
  Adventure: 'Adventure',
  Animation: 'Animation',
  Comedy: 'Comedy',
  Crime: 'Crime',
  Drama: 'Drama',
  Family: 'Family',
  Fantasy: 'Fantasy',
  History: 'History',
  Horror: 'Horror',
  Music: 'Music',
  Mystery: 'Mystery',
  Romance: 'Romance',
  'Science Fiction': 'Sci-Fi',
  Thriller: 'Thriller',
  War: 'War',
  Western: 'Western',
};

interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string;
  release_date: string;
  status: string;
  runtime: number | null;
  imdb_id: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  budget: number;
  revenue: number;
  homepage: string | null;
  genres: { id: number; name: string }[];
  credits: { cast: { name: string }[]; crew: { job: string; name: string }[] };
  videos: { results: { key: string; name: string; site: string; type: string; official: boolean }[] };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(TMDB + path);
  url.searchParams.set('api_key', KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  for (let attempt = 0; ; attempt += 1) {
    let res: Response | undefined;
    try {
      res = await fetch(url);
    } catch (e) {
      // Dropped connection: retry.
      if (attempt >= 5) throw e;
    }
    if (res?.ok) return (await res.json()) as T;
    if ((!res || res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    throw new Error(`TMDB ${res?.status} for ${path}`);
  }
}

/** Runs `fn` over `items`, `limit` at a time. */
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

async function readImdbRatings(file: string) {
  const ratings = new Map<string, { rating: number; votes: number }>();
  const lines = createInterface({ input: createReadStream(file).pipe(createGunzip()) });
  for await (const line of lines) {
    const [id, rating, votes] = line.split('\t');
    if (id === 'tconst') continue;
    ratings.set(id, { rating: Number(rating), votes: Number(votes) });
  }
  return ratings;
}

/** Em dashes read as filler on the site; turn them into commas. */
const noDashes = (s: string) => s.replace(/\s*—\s*/g, ', ').replace(/,\s*([.,;:!?])/g, '$1');

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
  const topIdx = args.indexOf('--top');
  const TOP = topIdx >= 0 ? Number(args[topIdx + 1]) : 500;
  if (!Number.isInteger(TOP) || TOP < 1) throw new Error('--top needs a whole number');
  if (!KEY) throw new Error('Set TMDB_API_KEY');
  if (!file) throw new Error('Pass the path to title.ratings.tsv.gz');

  const imdb = await readImdbRatings(file);
  console.log(`IMDb ratings: ${imdb.size} titles`);

  // tmdb id -> why it is in the catalog
  const picked = new Map<number, Set<string>>();
  const add = (id: number, why: string) => {
    if (!picked.has(id)) picked.set(id, new Set());
    picked.get(id)!.add(why);
  };

  // 1. IMDb's most-voted films. The dataset mixes in TV, so /find keeps films only.
  const byVotes = [...imdb.entries()].sort((a, b) => b[1].votes - a[1].votes);
  let top = 0;
  for (let i = 0; top < TOP && i < byVotes.length; i += 20) {
    const batch = byVotes.slice(i, i + 20);
    const found = await pool(batch, 10, ([imdbId]) =>
      tmdb<{ movie_results: { id: number }[] }>(`/find/${imdbId}`, { external_source: 'imdb_id' }),
    );
    for (const f of found) {
      if (top < TOP && f.movie_results[0]) {
        add(f.movie_results[0].id, MOST_VOTED);
        top += 1;
      }
    }
  }
  console.log(`top by votes: ${top}`);

  // 2. Directors.
  for (const name of DIRECTORS) {
    const { results } = await tmdb<{ results: { id: number; name: string; known_for_department: string }[] }>(
      '/search/person',
      { query: name },
    );
    const person = results.find((p) => p.name === name && p.known_for_department === 'Directing');
    if (!person) throw new Error(`No director found for ${name}`);
    const { crew } = await tmdb<{ crew: { id: number; job: string }[] }>(`/person/${person.id}/movie_credits`);
    for (const c of crew) {
      if (c.job === 'Director') add(c.id, name);
    }
  }

  // 3. Franchise collections.
  for (const c of COLLECTIONS) {
    const { parts } = await tmdb<{ parts: { id: number; release_date?: string }[] }>(`/collection/${c.id}`);
    for (const p of parts) {
      if (c.since && (!p.release_date || p.release_date < c.since)) continue;
      add(p.id, c.name);
    }
  }

  // 4. Studio filmographies.
  for (const s of STUDIOS) {
    for (let page = 1; page <= 10; page += 1) {
      const data = await tmdb<{ results: { id: number }[]; total_pages: number }>('/discover/movie', {
        ...s.params,
        sort_by: 'vote_count.desc',
        'primary_release_date.lte': TODAY,
        page: String(page),
      });
      data.results.forEach((r) => add(r.id, s.name));
      if (page >= data.total_pages) break;
    }
  }

  // 5. Single films.
  for (const e of EXTRA) {
    const { results } = await tmdb<{ results: { id: number }[] }>('/search/movie', {
      query: e.title,
      year: String(e.year),
    });
    if (!results[0]) throw new Error(`Not found: ${e.title}`);
    add(results[0].id, e.name);
  }

  console.log(`candidates: ${picked.size}`);

  // Details for every candidate, then the release and fame filters.
  const ids = [...picked.keys()];
  const details = await pool(ids, 8, (id) =>
    tmdb<TmdbMovie>(`/movie/${id}`, { append_to_response: 'credits,videos' }),
  );

  const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const skipped: string[] = [];
  const rows = [];
  for (const m of details) {
    const why = [...picked.get(m.id)!];
    const label = `${m.title} (${m.release_date?.slice(0, 4) || '?'}) [${why.join(', ')}]`;
    const released = m.status === 'Released' && Boolean(m.release_date) && m.release_date <= TODAY;
    const isDoc = m.genres.some((g) => g.id === 99);
    const isShort = (m.runtime ?? 0) > 0 && (m.runtime ?? 0) < 60;
    // Films only here as a director's work need a real audience; franchise
    // films need a big one unless they are brand new.
    const onlyDirector = why.every((w) => DIRECTORS.includes(w));
    const minVotes = why.includes(MOST_VOTED)
      ? 0
      : onlyDirector
        ? 100
        : m.release_date >= yearAgo
          ? 50
          : 1000;
    const reason = !released
      ? 'not released'
      : isDoc
        ? 'documentary'
        : isShort
          ? 'short'
          : !m.poster_path
            ? 'no poster'
            : m.vote_count < minVotes
              ? `${m.vote_count} votes`
              : '';
    if (reason) {
      skipped.push(`${label}: ${reason}`);
      continue;
    }

    const imdbScore = m.imdb_id ? imdb.get(m.imdb_id) : undefined;
    const directors = m.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name);
    const trailers = m.videos.results.filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
    const trailer = trailers.find((v) => v.official) ?? trailers[0];
    rows.push({
      tmdbId: m.id,
      imdbId: m.imdb_id ?? '',
      title: m.title,
      originalTitle: m.original_title,
      description: noDashes(m.overview ?? ''),
      tagline: noDashes(m.tagline ?? ''),
      director: directors.join(', '),
      star1: m.credits.cast[0]?.name ?? '',
      star2: m.credits.cast[1]?.name ?? '',
      posterUrl: m.poster_path,
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
      releaseDate: m.release_date,
      runtime: m.runtime,
      status: m.status,
      homepage: m.homepage ?? '',
      imdbRating: imdbScore?.rating ?? Math.round(m.vote_average * 10) / 10,
      imdbVotes: imdbScore?.votes ?? 0,
      tmdbVoteAverage: m.vote_average,
      voteCount: m.vote_count,
      budget: m.budget,
      revenue: m.revenue,
      trailerKey: trailer?.key ?? '',
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
      trailerName: noDashes(trailer?.name ?? ''),
      genres: [...new Set(m.genres.map((g) => GENRES[g.name]).filter(Boolean))],
      sources: why,
    });
  }

  rows.sort((a, b) => b.imdbVotes - a.imdbVotes);
  await writeFile(OUT, `${JSON.stringify(rows, null, 1)}\n`);
  console.log(`wrote ${rows.length} movies to ${OUT}; skipped ${skipped.length}:`);
  skipped.sort().forEach((s) => console.log(`  - ${s}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
