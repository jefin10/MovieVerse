import { Router } from 'express';
import * as c from '../controllers/engagement.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const engagementRouter = Router();

engagementRouter.post('/swipes', requireAuth, c.swipe);
engagementRouter.get('/onboarding/movies', requireAuth, c.starterMovies);
engagementRouter.post('/onboarding/favorites', requireAuth, c.saveFavorites);

engagementRouter.get('/movie/:movieId/providers', requireAuth, c.movieProviders);
engagementRouter.get('/providers', requireAuth, c.listProviders);
engagementRouter.get('/preferences', requireAuth, c.getPreferences);
engagementRouter.patch('/preferences', requireAuth, c.updatePreferences);

engagementRouter.get('/users', requireAuth, c.searchUsers);
engagementRouter.get('/users/:username', requireAuth, c.userProfile);
engagementRouter.get('/friends', requireAuth, c.friends);
engagementRouter.post('/follow/:username', requireAuth, c.follow);
engagementRouter.delete('/follow/:username', requireAuth, c.unfollow);

engagementRouter.get('/notifications', requireAuth, c.listNotifications);
engagementRouter.post('/notifications/read', requireAuth, c.markNotificationsRead);
engagementRouter.post('/push-tokens', requireAuth, c.registerPushToken);
engagementRouter.delete('/push-tokens', requireAuth, c.removePushToken);

engagementRouter.post('/rooms', requireAuth, c.createRoom);
engagementRouter.get('/rooms/:code', requireAuth, c.getRoom);
engagementRouter.post('/rooms/:code/join', requireAuth, c.joinRoom);
engagementRouter.post('/rooms/:code/swipes', requireAuth, c.roomSwipe);
