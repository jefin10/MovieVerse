import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export interface AuthUser {
  id: number;
  username: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Reads JWT from cookie or Authorization: Bearer header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.replace('Bearer ', '');
  const token = req.cookies?.token ?? bearer;
  if (!token) return next(ApiError.unauthorized());
  try {
    req.user = jwt.verify(token, env.jwt.secret) as AuthUser;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
