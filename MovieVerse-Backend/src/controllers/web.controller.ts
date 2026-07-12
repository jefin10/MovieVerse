import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination } from '../utils/sample.js';
import { movieInclude, serializeCatalog } from '../utils/serializeMovie.js';

function pageMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    page_size: pageSize,
    total_movies: total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_previous: page > 1,
  };
}

// GET /api/web/catalog — paginated public catalog, optional ?genre filter.
export const catalog = asyncHandler(async (req, res) => {
  const { page, pageSize } = parsePagination(req.query);
  const genre = (req.query.genre as string)?.trim();
  const where = genre ? { genres: { some: { name: { equals: genre, mode: 'insensitive' as const } } } } : {};

  const [total, movies] = await Promise.all([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      include: movieInclude,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  res.json({ results: movies.map(serializeCatalog), ...pageMeta(total, page, pageSize) });
});

// GET /api/web/search/:query — paginated title search.
export const search = asyncHandler(async (req, res) => {
  const { page, pageSize } = parsePagination(req.query);
  const where = { title: { contains: req.params.query ?? '', mode: 'insensitive' as const } };

  const [total, movies] = await Promise.all([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      include: movieInclude,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  res.json({ results: movies.map(serializeCatalog), ...pageMeta(total, page, pageSize) });
});

// GET /api/web/movie/:query — public movie detail by id or title.
export const fetchInfo = asyncHandler(async (req, res) => {
  const query = req.params.query ?? '';
  const asId = Number.parseInt(query, 10);

  const movie =
    Number.isInteger(asId) && String(asId) === query
      ? await prisma.movie.findUnique({ where: { id: asId }, include: movieInclude })
      : await prisma.movie.findFirst({
          where: { title: { contains: query, mode: 'insensitive' } },
          include: movieInclude,
        });

  if (!movie) throw ApiError.notFound(`Movie '${query}' not found`);

  res.json({
    id: movie.id,
    title: movie.title,
    movie_info: movie.description,
    description: movie.description,
    director: movie.director,
    star1: movie.star1,
    star2: movie.star2,
    poster_url: movie.posterUrl,
    release_date: movie.releaseDate,
    imdb_rating: movie.imdbRating,
    our_rating: movie.ourRating,
    tmdb_vote_average: movie.tmdbVoteAverage,
    trailer_url: movie.trailerUrl,
    trailer_name: movie.trailerName,
    genres: movie.genres?.map((g) => g.name) ?? [],
  });
});
