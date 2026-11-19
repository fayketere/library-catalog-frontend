import express from "express";

import { createBook, deleteBook, findBook, listBooks, updateBook } from "../data/catalog.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  ApiError,
  bookCreateSchema,
  bookListQuerySchema,
  bookUpdateSchema,
  parseQuery,
  validate,
} from "../middleware/validate.js";

const router = express.Router();

router.get("/", (req, res) => {
  const query = parseQuery(bookListQuerySchema, req.query);
  res.status(200).json(listBooks(query));
});

router.get("/:id", (req, res, next) => {
  const book = findBook(req.params.id);
  if (!book) {
    next(new ApiError(404, "Book not found"));
    return;
  }
  res.status(200).json(book);
});

router.post("/", requireAuth, requireRole("librarian"), validate(bookCreateSchema), (req, res) => {
  res.status(201).json(createBook(req.body));
});

router.put("/:id", requireAuth, requireRole("librarian"), validate(bookUpdateSchema), (req, res, next) => {
  const book = updateBook(req.params.id, req.body);
  if (!book) {
    next(new ApiError(404, "Book not found"));
    return;
  }
  res.status(200).json(book);
});

router.delete("/:id", requireAuth, requireRole("librarian"), (req, res, next) => {
  if (!deleteBook(req.params.id)) {
    next(new ApiError(404, "Book not found"));
    return;
  }
  res.status(204).end();
});

export default router;
