import { prisma } from '../config/prisma.js';

/** What a user's activity says about movies: -1 (disliked) to 1 (loved). */
export type Signals = Map<number, number>;

const MIN_SIGNALS = 3;

// The gap in stars from a neutral 3: 5 stars is 1, 1 star is -1.
const fromRating = (stars: number) => (stars - 3) / 2;
const SWIPE_LIKE = 0.7;
const WATCHLISTED = 0.5;

function cosine(a: Map<number, number>, b: Map<number, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [k, v] of a) {
    normA += v * v;
    const other = b.get(k);
    if (other !== undefined) dot += v * other;
  }
  for (const v of b.values()) normB += v * v;
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

function genreProfile(signals: Signals, genresByMovie: Map<number, number[]>): Map<number, number> {
  const profile = new Map<number, number>();
  for (const [movieId, weight] of signals) {
    if (weight <= 0) continue;
    for (const genre of genresByMovie.get(movieId) ?? []) {
      profile.set(genre, (profile.get(genre) ?? 0) + weight);
    }
  }
  return profile;
}

export interface TasteMatch {
  /** 0-100, or null when either person has too little activity to compare. */
  score: number | null;
  shared: number;
  bothLiked: number[];
}

/**
 * Blends two views of similarity. Movies both people have an opinion on are the
 * strongest evidence but are rare at first, so genre taste carries the score
 * until they've shared a few: `shared / (shared + 5)` shifts the weight across.
 */
export function compareTaste(a: Signals, b: Signals, genresByMovie: Map<number, number[]>): TasteMatch {
  const sharedIds = [...a.keys()].filter((id) => b.has(id));
  const bothLiked = sharedIds.filter((id) => a.get(id)! > 0 && b.get(id)! > 0);
  if (a.size < MIN_SIGNALS || b.size < MIN_SIGNALS) {
    return { score: null, shared: sharedIds.length, bothLiked };
  }

  const genres = cosine(genreProfile(a, genresByMovie), genreProfile(b, genresByMovie));
  let direct = 0;
  if (sharedIds.length) {
    const pick = (s: Signals) => new Map(sharedIds.map((id) => [id, s.get(id)!]));
    direct = (cosine(pick(a), pick(b)) + 1) / 2; // -1..1 -> 0..1
  }
  const weight = sharedIds.length / (sharedIds.length + 5);
  return {
    score: Math.round((weight * direct + (1 - weight) * genres) * 100),
    shared: sharedIds.length,
    bothLiked,
  };
}

/** Ratings beat swipes, which beat a watchlist add: the most deliberate signal wins. */
export async function loadSignals(userId: number): Promise<Signals> {
  const [watchlist, swipes, ratings] = await Promise.all([
    prisma.watchlist.findMany({ where: { userId }, select: { movieId: true } }),
    prisma.swipe.findMany({ where: { userId }, select: { movieId: true, liked: true } }),
    prisma.rating.findMany({ where: { userId }, select: { movieId: true, rating: true } }),
  ]);
  const signals: Signals = new Map();
  for (const w of watchlist) signals.set(w.movieId, WATCHLISTED);
  for (const s of swipes) signals.set(s.movieId, s.liked ? SWIPE_LIKE : -SWIPE_LIKE);
  for (const r of ratings) signals.set(r.movieId, fromRating(r.rating));
  return signals;
}

export async function tasteMatch(userA: number, userB: number) {
  const [a, b] = await Promise.all([loadSignals(userA), loadSignals(userB)]);
  const ids = [...new Set([...a.keys(), ...b.keys()])];
  const movies = await prisma.movie.findMany({
    where: { id: { in: ids } },
    select: { id: true, genres: { select: { id: true } } },
  });
  const genresByMovie = new Map(movies.map((m) => [m.id, m.genres.map((g) => g.id)]));
  return compareTaste(a, b, genresByMovie);
}
