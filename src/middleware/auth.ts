import type { NextFunction, Request, Response } from "express";

import type { PublicUser, UserRole } from "../models/user.js";

import { getSessionCookie, verifySessionToken } from "../auth/sessions.js";
import { findUserById } from "../data/users.js";
import { toPublicUser } from "../models/user.js";
import { ApiError } from "./validate.js";

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Express {
    // Express Request is extended here so authenticated identity is attached to req.user.
    // eslint-disable-next-line ts/consistent-type-definitions
    interface Request {
      user?: PublicUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getSessionCookie(req.headers.cookie);
  const payload = token ? verifySessionToken(token) : undefined;
  const user = payload ? findUserById(payload.sub) : undefined;
  if (!user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  req.user = toPublicUser(user);
  next();
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }
    if (req.user.role !== role) {
      next(new ApiError(403, "Forbidden"));
      return;
    }
    next();
  };
}
