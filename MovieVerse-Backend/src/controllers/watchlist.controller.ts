import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'watchlist list' }));
export const add = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'watchlist add' }));
export const remove = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'watchlist remove' }));
