import type { Request } from 'express';
import { prisma } from '../config/prisma.js';
import { tmdbService } from '../services/tmdb.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sample } from '../utils/sample.js';
import { movieInclude, serializeMovie, type MovieWithRelations } from '../utils/serializeMovie.js';

function detailShape(m: MovieWithRelations) {
  return {
    id: m.id,
    title: m.title,
    movie_info: m.description,
    description: m.description,
    director: m.director,
    star1: m.star1,
    star2: m.star2,
    poster_url: m.posterUrl,
    release_date: m.releaseDate,
    imdb_rating: m.imdbRating,
    our_rating: m.ourRating,
    tmdb_vote_average: m.tmdbVoteAverage,
    trailer_url: m.trailerUrl,
    trailer_name: m.trailerName,
    genres: m.genres?.map((g) => g.name) ?? [],
  };
}

// GET /api/Trending — recent rated movies, supplemented with random.
export const trending = asyncHandler(async (_req, res) => {
  const recentRatings = await prisma.rating.findMany({
    orderBy: { createdAt: 'desc' },
    select: { movieId: true },
    take: 100,
  });
  const orderedIds: number[] = [];
  for (const r of recentRatings) {
    if (!orderedIds.includes(r.movieId)) orderedIds.push(r.movieId);
    if (orderedIds.length >= 10) break;
  }

  const rated = await prisma.movie.findMany({ where: { id: { in: orderedIds } }, include: movieInclude });
  if (rated.length < 10) {
    const fillerPool = await prisma.movie.findMany({
      where: { id: { notIn: orderedIds } },
      include: movieInclude,
      take: 200,
    });
    rated.push(...sample(fillerPool, 10 - rated.length));
  }
  res.json(rated.map(serializeMovie));
});

// GET /api/TinderMovies — sample from the most popular pool.
export const tinder = asyncHandler(async (_req, res) => {
  const candidates = await prisma.movie.findMany({
    orderBy: [{ popularity: 'desc' }, { tmdbVoteAverage: 'desc' }, { voteCount: 'desc' }],
    include: movieInclude,
    take: 200,
  });
  res.json(sample(candidates, 10).map(serializeMovie));
});

// GET /api/mobile/catalog — same behaviour as tinder.
export const catalog = tinder;

// GET /api/shorts/random-trailers — movies that have a trailer.
export const randomTrailers = asyncHandler(async (_req, res) => {
  const withTrailers = await prisma.movie.findMany({
    where: { OR: [{ trailerKey: { not: '' } }, { trailerUrl: { not: '' } }] },
    include: movieInclude,
    take: 300,
  });
  if (withTrailers.length === 0) throw ApiError.notFound('No movies with trailers found');
  res.json(sample(withTrailers, 30).map(serializeMovie));
});

// GET /api/searchMovie/:query — title contains.
export const search = asyncHandler(async (req: Request, res) => {
  const query = req.params.query ?? '';
  const movies = await prisma.movie.findMany({
    where: { title: { contains: query, mode: 'insensitive' } },
    include: movieInclude,
    orderBy: { releaseDate: 'desc' },
    take: 50,
  });
  res.json(movies.map(serializeMovie));
});

// GET /api/fetchMovieInfo/:query — by id or title, TMDB fallback creates a record.
export const fetchInfo = asyncHandler(async (req: Request, res) => {
  const query = req.params.query ?? '';
  const asId = Number.parseInt(query, 10);

  let movie: MovieWithRelations | null = null;
  if (Number.isInteger(asId) && String(asId) === query) {
    movie = await prisma.movie.findUnique({ where: { id: asId }, include: movieInclude });
  } else {
    movie = await prisma.movie.findFirst({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: movieInclude,
    });
  }
  if (movie) return res.json(detailShape(movie));

  if (!tmdbService.enabled()) throw ApiError.notFound(`Movie '${query}' not found`);

  // TMDB fallback: resolve an id, fetch details + credits, persist.
  let tmdbId = Number.isInteger(asId) && String(asId) === query ? asId : 0;
  if (!tmdbId) {
    const results = await tmdbService.searchMovie(query);
    if (!results?.results?.length) throw ApiError.notFound(`Movie '${query}' not found`);
    tmdbId = results.results[0].id;
  }
  const data = await tmdbService.getMovie(tmdbId);
  const credits = await tmdbService.getCredits(tmdbId).catch(() => ({ crew: [], cast: [] }));
  const director = credits.crew?.find((p) => p.job?.toLowerCase() === 'director')?.name ?? 'Unknown';
  const star1 = credits.cast?.[0]?.name ?? 'Unknown';
  const star2 = credits.cast?.[1]?.name ?? 'Unknown';
  const posterUrl = data.poster_path ? tmdbService.imageUrl(data.poster_path) : '';
  const genreNames: string[] = (data.genres ?? []).map((g: { name: string }) => g.name);

  const created = await prisma.movie.create({
    data: {
      tmdbId,
      title: data.title ?? 'Unknown',
      description: data.overview ?? '',
      director,
      star1,
      star2,
      posterUrl,
      releaseDate: data.release_date ? new Date(data.release_date) : null,
      imdbRating: data.vote_average ?? 0,
      genres: {
        connectOrCreate: genreNames.map((name, i) => ({
          where: { id: (data.genres?.[i]?.id as number) ?? 0 },
          create: { id: (data.genres?.[i]?.id as number) ?? 0, name },
        })),
      },
    },
    include: movieInclude,
  });
  res.json(detailShape(created));
});

// GET /api/getMoviePoster/:query — poster url, TMDB fallback.
export const poster = asyncHandler(async (req: Request, res) => {
  const query = req.params.query ?? '';
  if (!query) throw ApiError.badRequest('Movie name (query) is required');

  const local = await prisma.movie.findFirst({ where: { title: { equals: query, mode: 'insensitive' } } });
  if (local?.posterUrl) return res.json({ poster_url: local.posterUrl });

  if (!tmdbService.enabled()) throw ApiError.notFound('Poster not found');
  const results = await tmdbService.searchMovie(query);
  const first = results?.results?.[0];
  if (!first?.poster_path) throw ApiError.notFound('Poster not found');
  res.json({ poster_url: tmdbService.imageUrl(first.poster_path) });
});
