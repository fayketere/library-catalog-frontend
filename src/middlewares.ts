import type { NextFunction, Request, Response } from "express";

import { ApiError } from "./middleware/validate.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  next(new ApiError(404, `Not found: ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  if (isMalformedJson(err)) {
    res.status(400).json({
      message: "Invalid JSON request body",
      errors: [{ field: "body", message: "Request body must be valid JSON" }],
    });
    return;
  }

  console.error("Unhandled request error:", err);
  res.status(500).json({ message: "Internal server error" });
}

function isMalformedJson(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "type" in error
    && error.type === "entity.parse.failed";
}
