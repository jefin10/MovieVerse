import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function sign(user: { id: number; username: string }) {
  return jwt.sign({ id: user.id, username: user.username }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

// Kept so existing clients calling /api/auth/csrf keep working (JWT needs no CSRF).
export const csrf = (_req: Request, res: Response) => res.json({ message: 'ok' });

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) throw ApiError.badRequest('All fields are required');
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email, password: hash } });
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: env.isProd });
  res.status(201).json({ id: user.id, username: user.username, token });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body ?? {};
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: env.isProd });
  res.json({ id: user.id, username: user.username, token });
});

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'logged out' });
};

// TODO: port remaining flows from users/views.py
export const checkUsername = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'check-username' }));
export const validateSession = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'validate-session' }));
export const forgotPassword = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'forgot-password (OTP)' }));
export const verifyOtp = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'verify-otp' }));
export const resetPassword = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'reset-password' }));
export const getEmail = asyncHandler(async (_req, res) => res.status(501).json({ todo: 'getEmail' }));
