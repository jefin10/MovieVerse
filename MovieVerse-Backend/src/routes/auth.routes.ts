import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// Mirrors Django users/urls.py
authRouter.get('/csrf', c.csrf); // kept for client compatibility (no-op with JWT)
authRouter.post('/register', c.register);
authRouter.post('/login', c.login);
authRouter.post('/logout', c.logout);
authRouter.get('/check-username', c.checkUsername);
authRouter.get('/validate-session', requireAuth, c.validateSession);
authRouter.post('/forgot-password', c.forgotPassword);
authRouter.post('/verify-otp', c.verifyOtp);
authRouter.post('/reset-password', c.resetPassword);
authRouter.get('/getEmail', requireAuth, c.getEmail);
