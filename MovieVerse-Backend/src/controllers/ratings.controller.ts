import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function recomputeMovieRating(movieId: number) {
  const agg = await prisma.rating.aggregate({ where: { movieId }, _avg: { rating: true } });
  const avg = agg._avg.rating ?? 0;
  await prisma.movie.update({ where: { id: movieId }, data: { ourRating: Math.round(avg * 10) / 10 } });
}

function parseRating(raw: unknown): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) throw ApiError.badRequest('Rating must be a number');
  if (value < 0 || value > 5) throw ApiError.badRequest('Rating must be between 0 and 5');
  return value;
}

// POST /api/addRatings — body { username?, movie_id, rating }.
export const add = asyncHandler(async (req, res) => {
  const submitted = (req.body?.username ?? '').trim();
  if (submitted && submitted !== req.user!.username) throw ApiError.forbidden();

  if (req.body?.rating == null || req.body?.movie_id == null) {
    throw ApiError.badRequest('Movie ID and rating are required');
  }
  const rating = parseRating(req.body.rating);
  const movieId = Number(req.body.movie_id);

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw ApiError.notFound('Movie not found');

  const existing = await prisma.rating.findUnique({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
  });
  await prisma.rating.upsert({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
    update: { rating },
    create: { userId: req.user!.id, movieId, rating },
  });
  await recomputeMovieRating(movieId);
  res.json({ message: existing ? 'Rating updated successfully' : 'Rating added successfully' });
});

// GET /api/getRatings/:username/:movieId — owner only; returns rating/2.
export const get = asyncHandler(async (req, res) => {
  if (req.params.username !== req.user!.username) throw ApiError.forbidden();
  const movieId = Number(req.params.movieId);
  const rating = await prisma.rating.findUnique({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
  });
  res.json({ rating: rating ? rating.rating / 2 : 0 });
});

// POST /api/movie/:movieId/rate — body { username?, rating }.
export const rate = asyncHandler(async (req, res) => {
  const submitted = (req.body?.username ?? '').trim();
  if (submitted && submitted !== req.user!.username) throw ApiError.forbidden();
  if (req.body?.rating == null) throw ApiError.badRequest('Rating is required');
  const rating = parseRating(req.body.rating);
  const movieId = Number(req.params.movieId);

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw ApiError.notFound(`Movie with ID ${movieId} not found`);

  const existing = await prisma.rating.findUnique({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
  });
  const saved = await prisma.rating.upsert({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
    update: { rating },
    create: { userId: req.user!.id, movieId, rating },
  });
  await recomputeMovieRating(movieId);
  res.json({
    id: saved.id,
    movie_id: movie.id,
    rating: saved.rating,
    movie_title: movie.title,
    created: !existing,
  });
});

// GET /api/movie/:movieId/rating — owner's rating for a movie.
export const movieRating = asyncHandler(async (req, res) => {
  const username = (req.query.username as string)?.trim();
  if (username && username !== req.user!.username) throw ApiError.forbidden();
  const movieId = Number(req.params.movieId);

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw ApiError.notFound(`Movie with ID ${movieId} not found`);

  const rating = await prisma.rating.findUnique({
    where: { userId_movieId: { userId: req.user!.id, movieId } },
  });
  if (!rating) throw ApiError.notFound('No rating found for this movie');
  res.json({ id: rating.id, movie_id: movie.id, rating: rating.rating, created_at: rating.createdAt });
});
