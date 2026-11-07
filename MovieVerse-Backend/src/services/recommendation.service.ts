import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { loadSignals } from './taste.service.js';
import { movieInclude, serializeMovie, type MovieWithRelations } from '../utils/serializeMovie.js';

export interface Signature {
  genres: Set<string>;
  director: string;
  stars: Set<string>;
  imdb: number;
}

export function signature(m: MovieWithRelations): Signature {
  return {
    genres: new Set((m.genres ?? []).map((g) => g.name.toLowerCase().trim()).filter(Boolean)),
    director: (m.director ?? '').toLowerCase().trim(),
    stars: new Set([m.star1, m.star2].map((s) => (s ?? '').toLowerCase().trim()).filter(Boolean)),
    imdb: Number(m.imdbRating ?? 0),
  };
}

function similarity(a: Signature, b: Signature): number {
  let total = 0;
  if (b.genres.size && a.genres.size) {
    const overlap = [...b.genres].filter((g) => a.genres.has(g)).length;
    total += 2.0 * (overlap / Math.max(1, b.genres.size));
  }
  if (b.director && b.director === a.director) total += 1.2;
  if (b.stars.size && a.stars.size) {
    total += 0.7 * [...b.stars].filter((x) => a.stars.has(x)).length;
  }
  return total;
}

const DISLIKE_WEIGHT = 0.6;

/** Closeness to the best-matching liked movie, minus closeness to the worst-matching disliked one. */
export function score(
  cand: Signature,
  likedSigs: Signature[],
  dislikedSigs: Signature[],
  quality: { ourRating: number; imdb: number },
): number {
  let liked = 0;
  for (const s of likedSigs) {
    const closeness = 0.6 * (1 - Math.min(Math.abs(s.imdb - cand.imdb) / 10, 1));
    liked = Math.max(liked, similarity(cand, s) + closeness);
  }
  let disliked = 0;
  for (const s of dislikedSigs) disliked = Math.max(disliked, similarity(cand, s));
  return liked - DISLIKE_WEIGHT * disliked + 0.25 * quality.ourRating + 0.08 * quality.imdb;
}

const ranked = (
  candidates: MovieWithRelations[],
  liked: MovieWithRelations[],
  disliked: MovieWithRelations[],
  limit: number,
) => {
  const likedSigs = liked.map(signature);
  const dislikedSigs = disliked.map(signature);
  return candidates
    .map((m) => ({
      movie: m,
      s: score(signature(m), likedSigs, dislikedSigs, { ourRating: Number(m.ourRating ?? 0), imdb: Number(m.imdbRating ?? 0) }),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => ({ ...serializeMovie(x.movie), similarity: x.s }));
};

const CANDIDATE_ORDER = [
  { ourRating: 'desc' as const },
  { imdbRating: 'desc' as const },
  { tmdbVoteAverage: 'desc' as const },
  { popularity: 'desc' as const },
];

/**
 * Tries the Flask AI service first, then falls back to the same scoring in Node
 * so the endpoint always responds.
 */
async function rank(
  liked: MovieWithRelations[],
  disliked: MovieWithRelations[],
  candidates: MovieWithRelations[],
  limit: number,
) {
  try {
    // Liked and disliked movies go along too: the service builds the taste
    // profile from their genres and cast, and leaves them out of its results.
    const payload = {
      liked: liked.map((m) => m.title),
      disliked: disliked.map((m) => m.title),
      candidates: [...liked, ...disliked, ...candidates].map((m) => ({
        id: m.id,
        title: m.title,
        genres: m.genres?.map((g) => g.name) ?? [],
        director: m.director,
        star1: m.star1,
        star2: m.star2,
        imdb_rating: m.imdbRating,
        our_rating: m.ourRating,
        popularity: m.popularity,
      })),
      limit,
    };
    const result = await aiService.recommend(payload);
    const scored: { id: number; score: number }[] = result?.recommendations ?? [];
    if (scored.length) {
      const byId = new Map(candidates.map((m) => [m.id, m]));
      return scored
        .map((r) => ({ movie: byId.get(r.id), score: r.score }))
        .filter((x) => x.movie)
        .map((x) => ({ ...serializeMovie(x.movie!), similarity: x.score }));
    }
  } catch {
    // fall through to local scoring
  }
  return ranked(candidates, liked, disliked, limit);
}

export async function buildFromTitles(likedTitles: string[], dislikedTitles: string[], limit = 10) {
  const likedNames = likedTitles.map((t) => t.trim()).filter(Boolean);
  const dislikedNames = dislikedTitles.map((t) => t.trim()).filter(Boolean);

  const [liked, disliked] = await Promise.all([
    prisma.movie.findMany({ where: { title: { in: likedNames } }, include: movieInclude }),
    prisma.movie.findMany({ where: { title: { in: dislikedNames } }, include: movieInclude }),
  ]);
  if (liked.length === 0) return [];

  const candidates = await prisma.movie.findMany({
    where: { title: { notIn: [...likedNames, ...dislikedNames] } },
    include: movieInclude,
    orderBy: CANDIDATE_ORDER,
    take: 1500,
  });
  return rank(liked, disliked, candidates, limit);
}

/** Recommendations from everything a user has done: ratings, swipes and their watchlist. */
export async function buildForUser(
  userId: number,
  limit = 10,
  { onlyProviders, region }: { onlyProviders?: number[]; region?: string } = {},
) {
  const signals = await loadSignals(userId);
  const likedIds = [...signals].filter(([, v]) => v > 0).map(([id]) => id);
  const dislikedIds = [...signals].filter(([, v]) => v < 0).map(([id]) => id);
  if (likedIds.length === 0) return [];

  const [liked, disliked, candidates] = await Promise.all([
    prisma.movie.findMany({ where: { id: { in: likedIds } }, include: movieInclude }),
    prisma.movie.findMany({ where: { id: { in: dislikedIds } }, include: movieInclude }),
    prisma.movie.findMany({
      where: {
        id: { notIn: [...signals.keys()] },
        ...(onlyProviders?.length
          ? { providers: { some: { providerId: { in: onlyProviders }, region, kind: 'flatrate' } } }
          : {}),
      },
      include: movieInclude,
      orderBy: CANDIDATE_ORDER,
      take: 1500,
    }),
  ]);
  return rank(liked, disliked, candidates, limit);
}
