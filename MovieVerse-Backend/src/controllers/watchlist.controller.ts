import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/watchlist/ — items for the authenticated user.
export const list = asyncHandler(async (req, res) => {
  const items = await prisma.watchlist.findMany({
    where: { userId: req.user!.id },
    include: { movie: true },
    orderBy: { addedOn: 'desc' },
  });
  res.json(
    items.map((w) => ({
      id: w.id,
      movie_id: w.movieId,
      title: w.movie.title,
      added_on: w.addedOn,
      description: w.movie.description,
      poster_url: w.movie.posterUrl,
    })),
  );
});

// POST /api/watchlist/add — body { movie_id }.
export const add = asyncHandler(async (req, res) => {
  const movieId = Number(req.body?.movie_id);
  if (!movieId) throw ApiError.badRequest('Movie ID is required');

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw ApiError.notFound(`Movie with ID ${movieId} not found`);

  const existing = await prisma.watchlist.findFirst({
    where: { userId: req.user!.id, movieId },
  });
  if (existing) return res.json({ message: 'Movie already in watchlist' });

  const item = await prisma.watchlist.create({ data: { userId: req.user!.id, movieId } });
  res.status(201).json({
    id: item.id,
    movie_id: movie.id,
    title: movie.title,
    added_on: item.addedOn,
    description: movie.description,
    poster_url: movie.posterUrl,
  });
});

// DELETE /api/watchlist/remove/:pk — only the owner may remove.
export const remove = asyncHandler(async (req, res) => {
  const pk = Number(req.params.pk);
  const item = await prisma.watchlist.findFirst({ where: { id: pk, userId: req.user!.id } });
  if (!item) throw ApiError.notFound('Watchlist item not found');
  await prisma.watchlist.delete({ where: { id: pk } });
  res.json({ message: 'Movie removed from watchlist' });
});
