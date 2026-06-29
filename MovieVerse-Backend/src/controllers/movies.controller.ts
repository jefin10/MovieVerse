import { asyncHandler } from '../utils/asyncHandler.js';

// TODO: port from api/views.py. Use serializeMovie() + tmdbService for fallbacks.
export const trending = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'trending' }));
export const tinder = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'tinder' }));
export const randomTrailers = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'random-trailers' }));
export const search = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'search' }));
export const fetchInfo = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'fetchMovieInfo' }));
export const poster = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'getMoviePoster' }));
export const catalog = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'mobile catalog' }));
