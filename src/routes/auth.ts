import express from "express";
import { z } from "zod/v4";

import { clearSessionCookie, createSession, getSessionCookie, revokeSessionToken, setSessionCookie } from "../auth/sessions.js";
import { createUser, findUserByIdentifier, userExists, verifyPassword } from "../data/users.js";
import { env } from "../env.js";
import { ApiError, validate } from "../middleware/validate.js";
import { toPublicUser } from "../models/user.js";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.email().trim().max(254),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.email().optional(),
  username: z.string().trim().min(1).optional(),
  identifier: z.string().trim().min(1).optional(),
  password: z.string().min(1).max(128),
}).refine(input => Boolean(input.email || input.username || input.identifier), {
  message: "Email, username, or identifier is required",
  path: ["email"],
});

const router = express.Router();
const secureCookie = env.NODE_ENV === "production";

router.post("/register", validate(registerSchema), (req, res, next) => {
  const { username, email, password } = req.body as z.infer<typeof registerSchema>;
  if (userExists(username, email)) {
    next(new ApiError(409, "Username or email is already registered"));
    return;
  }

  const user = createUser({ username, email, password });
  res.status(201).json({ user: toPublicUser(user) });
});

router.post("/login", validate(loginSchema), (req, res, next) => {
  const { email, username, identifier, password } = req.body as z.infer<typeof loginSchema>;
  const user = findUserByIdentifier(identifier ?? email ?? username ?? "");
  if (!verifyPassword(user, password)) {
    next(new ApiError(401, "Invalid email/username or password"));
    return;
  }

  const token = createSession(user.id);
  res.setHeader("Set-Cookie", setSessionCookie(token, secureCookie));
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ user: toPublicUser(user) });
});

router.post("/logout", (req, res) => {
  revokeSessionToken(getSessionCookie(req.headers.cookie));
  res.setHeader("Set-Cookie", clearSessionCookie(secureCookie));
  res.status(204).end();
});

export default router;
