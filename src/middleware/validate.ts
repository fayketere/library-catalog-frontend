import type { NextFunction, Request, RequestHandler, Response } from "express";

import { z } from "zod/v4";

export type FieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const genreCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
});

export const genreUpdateSchema = genreCreateSchema;

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author is required"),
  genre: z.string().trim().min(1, "Genre is required"),
});

export const bookUpdateSchema = bookCreateSchema;

export const bookListQuerySchema = z.object({
  genre: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export function validationError(error: z.ZodError): ApiError {
  const errors = error.issues.map(issue => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
  return new ApiError(400, "Validation failed", errors);
}

export function validate(schema: z.ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(validationError(result.error));
      return;
    }

    req.body = result.data;
    next();
  };
}

export function parseQuery<T extends z.ZodType>(schema: T, query: unknown): z.output<T> {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw validationError(result.error);
  }
  return result.data;
}
