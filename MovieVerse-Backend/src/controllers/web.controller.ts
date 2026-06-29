import { asyncHandler } from '../utils/asyncHandler.js';

// Public website catalog (paginated), search, and movie detail.
export const catalog = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'web catalog' }));
export const search = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'web search' }));
export const fetchInfo = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'web movie info' }));
