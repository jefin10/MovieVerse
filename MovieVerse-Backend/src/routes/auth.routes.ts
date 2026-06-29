import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';

export const authRouter = Router();

// Mirrors Django users/urls.py
authRouter.get('/csrf', c.csrf); // kept for client compatibility (no-op with JWT)
authRouter.post('/register', c.register);
authRouter.post('/login', c.login);
authRouter.post('/logout', c.logout);
authRouter.post('/check-username', c.checkUsername);
authRouter.get('/validate-session', c.validateSession);
authRouter.post('/forgot-password', c.forgotPassword);
authRouter.post('/verify-otp', c.verifyOtp);
authRouter.post('/reset-password', c.resetPassword);
authRouter.post('/getEmail', c.getEmail);
