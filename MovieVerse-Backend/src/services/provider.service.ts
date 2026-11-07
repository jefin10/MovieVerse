import { Prisma, type Movie } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { posterUrl } from '../utils/serializeMovie.js';
import { notify } from './notification.service.js';
import { tmdbService, type TmdbProvider } from './tmdb.service.js';

const KINDS = ['flatrate', 'rent', 'buy'] as const;
const normalize = (s: string) => s.toLowerCase().trim();

/**
 * The catalog has no TMDB ids, so a movie is matched by title and then confirmed
 * by director: remakes share titles, and a wrong match shows wrong services.
 */
async function resolveTmdbId(movie: Movie): Promise<number | null> {
  if (movie.tmdbId) return movie.tmdbId;
  const search = await tmdbService.searchMovie(movie.title);
  for (const hit of (search?.results ?? []).slice(0, 3) as { id: number; release_date?: string }[]) {
    const credits = await tmdbService.getCredits(hit.id);
    const directed = credits.crew?.some(
      (p) => p.job?.toLowerCase() === 'director' && normalize(p.name ?? '') === normalize(movie.director),
    );
    if (!directed) continue;
    try {
      await prisma.movie.update({
        where: { id: movie.id },
        data: {
          tmdbId: hit.id,
          releaseDate: movie.releaseDate ?? (hit.release_date ? new Date(hit.release_date) : null),
        },
      });
      return hit.id;
    } catch (err) {
      // Another row already holds this id; leave this one unmatched.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return null;
      throw err;
    }
  }
  return null;
}

const upsertProvider = (p: TmdbProvider) =>
  prisma.watchProvider.upsert({
    where: { id: p.provider_id },
    update: { name: p.provider_name, logoPath: p.logo_path ?? '' },
    create: { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? '' },
  });

/** Refreshes one movie's availability and alerts anyone waiting for it. */
export async function syncMovieProviders(movie: Movie): Promise<void> {
  const hadData = movie.providersSyncedAt !== null;
  const tmdbId = await resolveTmdbId(movie);
  if (!tmdbId) {
    await prisma.movie.update({ where: { id: movie.id }, data: { providersSyncedAt: new Date() } });
    return;
  }

  const { results = {} } = await tmdbService.getWatchProviders(tmdbId);
  const rows: { movieId: number; providerId: number; region: string; kind: string; link: string }[] = [];
  const seen = new Map<number, TmdbProvider>();
  for (const region of env.providerRegions) {
    const entry = results[region];
    if (!entry) continue;
    for (const kind of KINDS) {
      for (const p of entry[kind] ?? []) {
        seen.set(p.provider_id, p);
        rows.push({ movieId: movie.id, providerId: p.provider_id, region, kind, link: entry.link ?? '' });
      }
    }
  }
  await Promise.all([...seen.values()].map(upsertProvider));

  const before = await prisma.movieProvider.findMany({ where: { movieId: movie.id } });
  const key = (r: { providerId: number; region: string; kind: string }) => `${r.providerId}:${r.region}:${r.kind}`;
  const known = new Set(before.map(key));
  await prisma.$transaction([
    prisma.movieProvider.deleteMany({ where: { movieId: movie.id } }),
    prisma.movieProvider.createMany({ data: rows }),
    prisma.movie.update({ where: { id: movie.id }, data: { providersSyncedAt: new Date() } }),
  ]);

  // A movie's first sync reports everything as new, which isn't news to anyone.
  if (!hadData) return;
  for (const row of rows) {
    if (row.kind === 'flatrate' && !known.has(key(row))) await alertWatchers(movie, row.providerId, row.region);
  }
}

async function alertWatchers(movie: Movie, providerId: number, region: string) {
  const provider = await prisma.watchProvider.findUnique({ where: { id: providerId } });
  const users = await prisma.user.findMany({
    where: {
      region,
      providerAlertsEnabled: true,
      watchlist: { some: { movieId: movie.id } },
      providers: { some: { providerId } },
    },
    select: { id: true },
  });
  for (const u of users) {
    await notify({
      userId: u.id,
      type: 'provider',
      title: `${movie.title} is on ${provider?.name}`,
      body: 'It was on your watchlist, and now you can stream it.',
      imageUrl: posterUrl(movie.posterUrl),
      data: { movieId: movie.id },
      dedupeKey: `provider:${movie.id}:${providerId}`,
    });
  }
}
