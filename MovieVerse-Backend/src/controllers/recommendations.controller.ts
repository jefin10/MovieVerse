import { asyncHandler } from '../utils/asyncHandler.js';

export const tempAdd = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'temp-add' }));
export const list = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'recommendations list' }));
export const fromRatings = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'from-ratings' }));
