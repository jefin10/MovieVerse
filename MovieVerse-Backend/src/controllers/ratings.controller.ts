import { asyncHandler } from '../utils/asyncHandler.js';

export const add = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'addRatings' }));
export const get = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'getRatings' }));
export const rate = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'rate movie' }));
export const movieRating = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'movie rating' }));
