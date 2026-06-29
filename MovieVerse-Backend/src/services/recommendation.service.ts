import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { movieInclude, serializeMovie, type MovieWithRelations } from '../utils/serializeMovie.js';

interface Signature {
  genres: Set<string>;
  director: string;
  stars: Set<string>;
  imdb: number;
}

function signature(m: MovieWithRelations): Signature {
  return {
    genres: new Set((m.genres ?? []).map((g) => g.name.toLowerCase().trim()).filter(Boolean)),
    director: (m.director ?? '').toLowerCase().trim(),
    stars: new Set([m.star1, m.star2].map((s) => (s ?? '').toLowerCase().trim()).filter(Boolean)),
    imdb: Number(m.imdbRating ?? 0),
  };
}

function score(cand: Signature, likedSigs: Signature[], movie: MovieWithRelations): number {
  let liked = 0;
  for (const s of likedSigs) {
    let cur = 0;
    if (s.genres.size && cand.genres.size) {
      const overlap = [...s.genres].filter((g) => cand.genres.has(g)).length;
      cur += 2.0 * (overlap / Math.max(1, s.genres.size));
    }
    if (s.director && s.director === cand.director) cur += 1.2;
    if (s.stars.size && cand.stars.size) {
      cur += 0.7 * [...s.stars].filter((x) => cand.stars.has(x)).length;
    }
    cur += 0.6 * (1 - Math.min(Math.abs(s.imdb - cand.imdb) / 10, 1));
    liked = Math.max(liked, cur);
  }
  const quality = 0.25 * Number(movie.ourRating ?? 0) + 0.08 * cand.imdb;
  return liked + quality;
}

/**
 * Content-based recommendations. Tries the Flask AI service first, then falls
 * back to in-process signature scoring so the endpoint always responds.
 */
export async function buildFromTitles(
  likedTitles: string[],
  dislikedTitles: string[],
  limit = 10,
) {
  const liked = likedTitles.map((t) => t.trim()).filter(Boolean);
  const disliked = dislikedTitles.map((t) => t.trim()).filter(Boolean);

  const likedMovies = await prisma.movie.findMany({
    where: { title: { in: liked } },
    include: movieInclude,
  });
  if (likedMovies.length === 0) return [];

  const excludedTitles = [...liked, ...disliked];
  const candidates = await prisma.movie.findMany({
    where: { title: { notIn: excludedTitles } },
    include: movieInclude,
    orderBy: [
      { ourRating: 'desc' },
      { imdbRating: 'desc' },
      { tmdbVoteAverage: 'desc' },
      { popularity: 'desc' },
    ],
    take: 1500,
  });

  // Preferred path: delegate scoring to the Flask service.
  try {
    const payload = {
      liked,
      disliked,
      candidates: candidates.map((m) => ({
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
    const ranked: { id: number; score: number }[] = result?.recommendations ?? [];
    if (ranked.length) {
      const byId = new Map(candidates.map((m) => [m.id, m]));
      return ranked
        .map((r) => ({ movie: byId.get(r.id), score: r.score }))
        .filter((x) => x.movie)
        .map((x) => ({ ...serializeMovie(x.movie!), similarity: x.score }));
    }
  } catch {
    // fall through to local scoring
  }

  // Fallback: signature scoring in Node.
  const likedSigs = likedMovies.map(signature);
  return candidates
    .map((m) => ({ movie: m, s: score(signature(m), likedSigs, m) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => ({ ...serializeMovie(x.movie), similarity: x.s }));
}
