import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { sendMail } from '../services/mail.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_REQUESTS_PER_HOUR = 5;
const SIGNUP_TOKEN_EXPIRY = '15m';

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const usernameSchema = z.string().trim().regex(/^[a-zA-Z0-9_.]{3,30}$/);

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

function startSession(res: Response, user: { id: number; username: string; email: string }) {
  const token = sign(user);
  setAuthCookie(res, token);
  res.json({ message: 'Login successful', token, username: user.username, email: user.email });
}

function numericOtp(length = OTP_LENGTH) {
  return Array.from({ length }, () => crypto.randomInt(0, 10)).join('');
}

function parseEmail(value: unknown) {
  const email = emailSchema.safeParse(value);
  if (!email.success) throw ApiError.badRequest('Please enter a valid email address.');
  return email.data;
}

// Accounts created before OTP sign-in kept the casing they registered with.
function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
}

function isEscapeCode(otp: string) {
  if (!env.otpEscapeCode) return false;
  const given = Buffer.from(otp);
  const expected = Buffer.from(env.otpEscapeCode);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

// Signed with its own key so it can never pass requireAuth as a session token.
const signupSecret = () => `${env.jwt.secret}:signup`;

const signupToken = (email: string, googleId?: string) =>
  jwt.sign({ email, googleId }, signupSecret(), { expiresIn: SIGNUP_TOKEN_EXPIRY });

const googleClient = new OAuth2Client();

const codeSent = (res: Response) =>
  res.json({ message: 'A one-time code has been sent to your email.' });

// Kept so existing clients calling /api/auth/csrf keep working (JWT needs no CSRF).
export const csrf = (_req: Request, res: Response) => res.json({ message: 'CSRF cookie set' });

// POST /api/auth/send-otp — emails a sign-in code. The same for new and
// existing accounts, so the response never reveals which emails are registered.
export const sendOtp = asyncHandler(async (req, res) => {
  const email = parseEmail(req.body?.email);

  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentCount = await prisma.loginOTP.count({
    where: { email, createdAt: { gte: hourAgo } },
  });
  if (recentCount >= OTP_MAX_REQUESTS_PER_HOUR) return codeSent(res);

  const latest = await prisma.loginOTP.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (latest && (now.getTime() - latest.createdAt.getTime()) / 1000 < OTP_COOLDOWN_SECONDS) {
    return codeSent(res);
  }

  const otp = numericOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const pending = await prisma.loginOTP.create({
    data: {
      email,
      otpHash,
      expiresAt: new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000),
      requestIp: req.ip ?? null,
    },
  });

  try {
    await sendMail(
      email,
      'Your MovieVerse sign-in code',
      `Your one-time code is: ${otp}\nIt expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    );
  } catch (err) {
    console.error('[auth] could not send sign-in code:', err);
    await prisma.loginOTP.delete({ where: { id: pending.id } });
    // With the escape code on, people can still sign in without the email.
    if (!env.otpEscapeCode) {
      throw new ApiError(503, 'Could not send the code. Please try again shortly.');
    }
  }
  return codeSent(res);
});

// Marks the latest code used if `otp` matches it; throws otherwise.
async function consumeOtp(email: string, otp: string) {
  const pending = await prisma.loginOTP.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!pending || pending.expiresAt <= new Date()) throw ApiError.badRequest('Invalid or expired code');
  if (pending.failedAttempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Too many invalid attempts. Please request a new code.');
  }

  if (!(await bcrypt.compare(otp, pending.otpHash))) {
    const failedAttempts = pending.failedAttempts + 1;
    await prisma.loginOTP.update({ where: { id: pending.id }, data: { failedAttempts } });
    if (failedAttempts >= OTP_MAX_ATTEMPTS) {
      throw new ApiError(429, 'Too many invalid attempts. Please request a new code.');
    }
    throw ApiError.badRequest('Invalid or expired code');
  }

  await prisma.loginOTP.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } });
}

// POST /api/auth/verify-otp — signs in an existing account, or hands a new
// email a short-lived token for choosing a username.
export const verifyOtp = asyncHandler(async (req, res) => {
  const email = parseEmail(req.body?.email);
  const otp = String(req.body?.otp ?? '').trim();
  if (!otp) throw ApiError.badRequest('Invalid or expired code');

  if (isEscapeCode(otp)) {
    console.warn(`[auth] escape code used for ${email} from ${req.ip}`);
  } else {
    await consumeOtp(email, otp);
  }

  const user = await findUserByEmail(email);
  if (user) {
    if (!user.isActive) throw new ApiError(403, 'This account has been disabled.');
    return startSession(res, user);
  }

  return res.json({
    message: 'Code verified',
    needs_username: true,
    signup_token: signupToken(email),
    suggested_username: await suggestUsername(email),
  });
});

/** A free username based on their name or email, so most people can just accept it. */
async function suggestUsername(email: string, name?: string): Promise<string> {
  const base =
    (name || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '')
      .replace(/^[._]+|[._]+$/g, '')
      .slice(0, 24) || 'moviefan';
  const stem = base.length >= 3 ? base : `${base}fan`;
  for (let i = 0; i < 20; i += 1) {
    const candidate = i === 0 ? stem : `${stem}${crypto.randomInt(10, 9999)}`;
    if (!(await prisma.user.findUnique({ where: { username: candidate } }))) return candidate;
  }
  return `${stem}${crypto.randomInt(10000, 99999)}`;
}

interface GoogleIdentity {
  sub?: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
}

/**
 * Android OAuth clients get an access token rather than an ID token. Google's
 * tokeninfo says who it was issued to, and checking that against our own client
 * ids stops a token issued to some other app being replayed here.
 */
async function verifyGoogleToken(body: { id_token?: unknown; access_token?: unknown }): Promise<GoogleIdentity> {
  if (body.id_token) {
    const ticket = await googleClient.verifyIdToken({ idToken: String(body.id_token), audience: env.google.clientIds });
    const payload = ticket.getPayload();
    return { sub: payload?.sub, email: payload?.email, emailVerified: !!payload?.email_verified, name: payload?.name };
  }
  const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { access_token: String(body.access_token) },
    timeout: 10_000,
  });
  if (!env.google.clientIds.includes(data.aud)) throw new Error('token issued to another app');
  return { sub: data.sub, email: data.email, emailVerified: data.email_verified === 'true' || data.email_verified === true };
}

// POST /api/auth/google — signs in with a token from the Google sign-in SDK.
export const googleSignIn = asyncHandler(async (req, res) => {
  if (!env.google.clientIds.length) throw new ApiError(503, 'Google sign-in is not available.');
  if (!req.body?.id_token && !req.body?.access_token) throw ApiError.badRequest('A Google token is required');

  let identity: GoogleIdentity;
  try {
    identity = await verifyGoogleToken(req.body);
  } catch {
    throw ApiError.unauthorized('Could not verify your Google account.');
  }
  // An unverified address could belong to someone else's MovieVerse account.
  if (!identity.sub || !identity.email || !identity.emailVerified) {
    throw ApiError.unauthorized('Your Google account has no verified email.');
  }
  const email = identity.email.toLowerCase();

  let user = await prisma.user.findUnique({ where: { googleId: identity.sub } });
  if (!user) {
    const byEmail = await findUserByEmail(email);
    if (byEmail) user = await prisma.user.update({ where: { id: byEmail.id }, data: { googleId: identity.sub } });
  }
  if (user) {
    if (!user.isActive) throw new ApiError(403, 'This account has been disabled.');
    return startSession(res, user);
  }
  return res.json({
    message: 'Verified',
    needs_username: true,
    signup_token: signupToken(email, identity.sub),
    suggested_username: await suggestUsername(email, identity.name),
  });
});

// POST /api/auth/complete-signup — creates the account for a verified email.
export const completeSignup = asyncHandler(async (req, res) => {
  const parsedUsername = usernameSchema.safeParse(req.body?.username);
  if (!parsedUsername.success) {
    throw ApiError.badRequest('Usernames are 3-30 letters, numbers, dots or underscores.');
  }
  const username = parsedUsername.data;

  let email: string;
  let googleId: string | undefined;
  try {
    const payload = jwt.verify(String(req.body?.signup_token ?? ''), signupSecret()) as { email: string; googleId?: string };
    email = payload.email;
    googleId = payload.googleId;
  } catch {
    throw ApiError.badRequest('Your sign-up session has expired. Please start again.');
  }

  if (await findUserByEmail(email)) throw ApiError.badRequest('This email already has an account.');
  if (await prisma.user.findUnique({ where: { username } })) {
    throw ApiError.badRequest('Username already exists.');
  }

  const user = await prisma.user.create({ data: { username, email, googleId } });
  res.status(201);
  startSession(res, user);
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
