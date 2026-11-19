import express from "express";

import { findUserById } from "../data/users.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/validate.js";
import { toPublicUser } from "../models/user.js";

const router = express.Router();

router.get("/profile", requireAuth, (req, res, next) => {
  const user = req.user ? findUserById(req.user.id) : undefined;
  if (!user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }
  res.status(200).json(toPublicUser(user));
});

export default router;
