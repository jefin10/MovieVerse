import { prisma } from '../config/prisma.js';
import { buildFromTitles } from '../services/recommendation.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sample } from '../utils/sample.js';
import { movieInclude, serializeMovie } from '../utils/serializeMovie.js';

// POST /api/recommendations/temp-add — seed first 5 movies into recommendations.
export const tempAdd = asyncHandler(async (req, res) => {
  const submitted = (req.body?.username ?? '').trim();
  if (submitted && submitted !== req.user!.username) throw ApiError.forbidden();

  const movies = await prisma.movie.findMany({ take: 5, orderBy: { id: 'asc' } });
  if (movies.length === 0) throw ApiError.notFound('No movies found in database');

  const added: unknown[] = [];
  for (const movie of movies) {
    const existing = await prisma.recommendedMovie.findUnique({
      where: { userId_movieId: { userId: req.user!.id, movieId: movie.id } },
    });
    if (!existing) {
      await prisma.recommendedMovie.create({ data: { userId: req.user!.id, movieId: movie.id } });
      added.push({ id: movie.id, title: movie.title, description: movie.description, poster_url: movie.posterUrl });
    } else {
      added.push({ id: movie.id, title: movie.title, status: 'already exists' });
    }
  }
  res.json({ message: `Added ${added.length} movies to recommendations`, movies: added });
});

// POST /api/recommendations/ — stored recommendations (seeds 5 random if empty).
export const list = asyncHandler(async (req, res) => {
  const submitted = (req.body?.username ?? '').trim();
  if (submitted && submitted !== req.user!.username) throw ApiError.forbidden();

  let recs = await prisma.recommendedMovie.findMany({
    where: { userId: req.user!.id },
    include: { movie: { include: movieInclude } },
    orderBy: { recommendedOn: 'desc' },
  });

  if (recs.length === 0) {
    const pool = await prisma.movie.findMany({ take: 200 });
    for (const m of sample(pool, 5)) {
      await prisma.recommendedMovie.create({ data: { userId: req.user!.id, movieId: m.id } });
    }
    recs = await prisma.recommendedMovie.findMany({
      where: { userId: req.user!.id },
      include: { movie: { include: movieInclude } },
      orderBy: { recommendedOn: 'desc' },
    });
  }

  res.json(
    recs.map((r) => ({
      id: r.movie.id,
      title: r.movie.title,
      description: r.movie.description,
      poster_url: r.movie.posterUrl,
      recommended_on: r.recommendedOn,
      genres: r.movie.genres?.map((g) => g.name) ?? [],
    })),
  );
});

// GET /api/recommendations/from-ratings — recommendations derived from ratings.
export const fromRatings = asyncHandler(async (req, res) => {
  const username = (req.query.username as string)?.trim();
  if (username && username !== req.user!.username) throw ApiError.forbidden();

  const ratings = await prisma.rating.findMany({
    where: { userId: req.user!.id },
    include: { movie: true },
  });

  const trendingFallback = async (info: string) => {
    const pool = await prisma.movie.findMany({ include: movieInclude, take: 200 });
    return res.json({ info, recommendations: sample(pool, 10).map(serializeMovie) });
  };

  if (ratings.length === 0) return trendingFallback('No ratings found, showing trending movies instead');

  const liked = ratings.filter((r) => r.rating >= 5).map((r) => r.movie.title);
  const disliked = ratings.filter((r) => r.rating < 5).map((r) => r.movie.title);
  if (liked.length === 0) {
    return trendingFallback('No liked movies found, showing trending movies instead');
  }

  const recommendations = await buildFromTitles(liked, disliked, 10);
  if (!recommendations.length) {
    return trendingFallback('Unable to score from current ratings, showing trending movies instead');
  }
  res.json({ recommendations });
});
