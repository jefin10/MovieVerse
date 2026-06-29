import { asyncHandler } from '../utils/asyncHandler.js';
import { aiService } from '../services/ai.service.js';

// mood -> genre (via Flask), then resolve movies from DB. TODO: DB resolve.
export const mood = asyncHandler(async (req, res) => {
  const { genre } = await aiService.predictMood(req.body?.mood ?? '');
  res.json({ genre, recommendations: [] });
});

// liked/disliked -> rank candidate pool in Flask. TODO: pull candidates from DB.
export const recommend = asyncHandler(async (req, res) => {
  const { liked = [], disliked = [] } = req.body ?? {};
  const ranked = await aiService.recommend({ liked, disliked, candidates: [], limit: 10 });
  res.json(ranked);
});
