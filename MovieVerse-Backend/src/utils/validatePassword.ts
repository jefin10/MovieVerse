import { ApiError } from './apiError.js';

/** Minimal port of Django's default password validators. */
export function validatePassword(password: string): void {
  const errors: string[] = [];
  if (password.length < 8) errors.push('This password is too short. It must contain at least 8 characters.');
  if (/^\d+$/.test(password)) errors.push('This password is entirely numeric.');
  if (errors.length) throw ApiError.badRequest(errors.join(' '), errors);
}
