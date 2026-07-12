import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { sendMail } from '../services/mail.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validatePassword } from '../utils/validatePassword.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_REQUESTS_PER_HOUR = 5;

function sign(user: { id: number; username: string }) {
  return jwt.sign({ id: user.id, username: user.username }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function numericOtp(length = OTP_LENGTH) {
  return Array.from({ length }, () => crypto.randomInt(0, 10)).join('');
}

const genericForgot = (res: Response) =>
  res.json({
    message: 'If the account exists, a one-time code has been sent to the registered email.',
  });

// Kept so existing clients calling /api/auth/csrf keep working (JWT needs no CSRF).
export const csrf = (_req: Request, res: Response) => res.json({ message: 'CSRF cookie set' });

export const register = asyncHandler(async (req, res) => {
  const username = (req.body?.username ?? '').trim();
  const email = (req.body?.email ?? '').trim();
  const password = req.body?.password ?? '';
  if (!username || !email || !password) {
    throw ApiError.badRequest('Username, email, and password are required.');
  }
  validatePassword(password);

  const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (exists) throw ApiError.badRequest('Username or email already exists.');

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { username, email, password: hash } });
  res.status(201).json({ message: 'User created successfully!' });
});

export const login = asyncHandler(async (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password ?? '';
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.badRequest('Invalid credentials!');
  }
  const token = sign(user);
  setAuthCookie(res, token);
  res.json({ message: 'Login successful', token });
});

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful!' });
};

export const checkUsername = asyncHandler(async (req, res) => {
  const username = (req.query.username as string) ?? '';
  if (!username) throw ApiError.badRequest('Username not provided');
  const exists = await prisma.user.findUnique({ where: { username } });
  res.json({ available: !exists });
});

export const validateSession = asyncHandler(async (_req, res) => res.json({ valid: true }));

export const getEmail = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ email: user.email, username: user.username });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const username = (req.body?.username ?? '').trim();
  if (!username) return genericForgot(res);

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return genericForgot(res);

  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentCount = await prisma.passwordResetOTP.count({
    where: { userId: user.id, createdAt: { gte: hourAgo } },
  });
  if (recentCount >= OTP_MAX_REQUESTS_PER_HOUR) return genericForgot(res);

  const latest = await prisma.passwordResetOTP.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (latest && (now.getTime() - latest.createdAt.getTime()) / 1000 < OTP_COOLDOWN_SECONDS) {
    return genericForgot(res);
  }

  const otp = numericOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const reset = await prisma.passwordResetOTP.create({
    data: {
      userId: user.id,
      otpHash,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000),
      requestIp: req.ip ?? null,
    },
  });

  try {
    await sendMail(
      user.email,
      'Your OTP for Password Reset',
      `Your one-time password is: ${otp}\nIt expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    );
  } catch {
    await prisma.passwordResetOTP.delete({ where: { id: reset.id } });
  }
  return genericForgot(res);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const username = (req.body?.username ?? '').trim();
  const otp = (req.body?.otp ?? '').trim();
  if (!username || !otp) throw ApiError.badRequest('Invalid OTP');

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw ApiError.badRequest('Invalid OTP');

  const reset = await prisma.passwordResetOTP.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!reset || reset.expiresAt <= new Date()) throw ApiError.badRequest('Invalid or expired OTP');
  if (reset.failedAttempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Too many invalid attempts. Please request a new OTP.');
  }

  if (!(await bcrypt.compare(otp, reset.otpHash))) {
    const failedAttempts = reset.failedAttempts + 1;
    await prisma.passwordResetOTP.update({ where: { id: reset.id }, data: { failedAttempts } });
    if (failedAttempts >= OTP_MAX_ATTEMPTS) {
      throw new ApiError(429, 'Too many invalid attempts. Please request a new OTP.');
    }
    throw ApiError.badRequest('Invalid OTP');
  }

  const resetToken = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  await prisma.passwordResetOTP.update({
    where: { id: reset.id },
    data: { verifiedAt: now, resetTokenHash: await bcrypt.hash(resetToken, 10), failedAttempts: 0 },
  });
  await prisma.passwordResetOTP.updateMany({
    where: { userId: user.id, usedAt: null, id: { not: reset.id } },
    data: { usedAt: now },
  });

  res.json({ message: 'OTP verified', reset_token: resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const username = (req.body?.username ?? '').trim();
  const newPassword = req.body?.password ?? '';
  const resetToken = (req.body?.reset_token ?? '').trim();
  if (!username || !newPassword || !resetToken) {
    throw ApiError.badRequest('Username, reset token, and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw ApiError.badRequest('Invalid reset session');

  const reset = await prisma.passwordResetOTP.findFirst({
    where: { userId: user.id, verifiedAt: { not: null }, usedAt: null },
    orderBy: { verifiedAt: 'desc' },
  });
  if (!reset || reset.expiresAt <= new Date()) throw ApiError.badRequest('Invalid or expired reset session');
  if (!reset.resetTokenHash || !(await bcrypt.compare(resetToken, reset.resetTokenHash))) {
    throw ApiError.badRequest('Invalid reset session');
  }

  validatePassword(newPassword);
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPassword, 12) } }),
    prisma.passwordResetOTP.update({ where: { id: reset.id }, data: { usedAt: now } }),
    prisma.passwordResetOTP.updateMany({
      where: { userId: user.id, usedAt: null, id: { not: reset.id } },
      data: { usedAt: now },
    }),
  ]);

  res.json({ message: 'Password updated' });
});
