import { prisma } from '../config/prisma.js';
import { aiService } from '../services/ai.service.js';
import { buildFromTitles } from '../services/recommendation.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sample } from '../utils/sample.js';
import { movieInclude, serializeMovie } from '../utils/serializeMovie.js';

// POST /ai/recommend — mood text -> genre (Flask) -> 50 movies from DB.
export const mood = asyncHandler(async (req, res) => {
  const userMood = (req.body?.mood ?? '').trim();
  if (!userMood) throw ApiError.badRequest('Mood is required');

  let genre: string | null = null;
  try {
    genre = (await aiService.predictMood(userMood)).genre;
  } catch {
    genre = null; // AI service unavailable -> fall back to popular movies
  }

  const orderBy = [
    { ourRating: 'desc' as const },
    { imdbRating: 'desc' as const },
    { popularity: 'desc' as const },
  ];
  let pool = genre
    ? await prisma.movie.findMany({
        where: { genres: { some: { name: { equals: genre, mode: 'insensitive' } } } },
        include: movieInclude,
        orderBy,
        take: 200,
      })
    : [];

  if (pool.length < 50) {
    const seen = new Set(pool.map((m) => m.id));
    const filler = await prisma.movie.findMany({
      where: { id: { notIn: [...seen] } },
      include: movieInclude,
      orderBy,
      take: 400,
    });
    pool = [...pool, ...sample(filler, 50 - pool.length)];
  }

  const selected = pool.length >= 50 ? sample(pool, 50) : pool;
  res.json({ genre, recommendations: selected.slice(0, 50).map(serializeMovie) });
});

// POST /ai/rec — liked/disliked titles -> ranked recommendations.
export const recommend = asyncHandler(async (req, res) => {
  const liked: string[] = Array.isArray(req.body?.liked) ? req.body.liked : [];
  const disliked: string[] = Array.isArray(req.body?.disliked) ? req.body.disliked : [];
  if (!liked.length) throw ApiError.badRequest('Liked list must be a non-empty list');

  const recommendations = await buildFromTitles(liked, disliked, 10);
  if (!recommendations.length) {
    throw ApiError.badRequest('None of the liked movies were found in the database');
  }
  res.json(recommendations);
});
