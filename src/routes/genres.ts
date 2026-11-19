import express from "express";

import { createGenre, deleteGenre, findGenre, listGenres, updateGenre } from "../data/catalog.js";
import { ApiError, genreCreateSchema, genreUpdateSchema, validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json(listGenres());
});

router.get("/:id", (req, res, next) => {
  const genre = findGenre(req.params.id);
  if (!genre) {
    next(new ApiError(404, "Genre not found"));
    return;
  }
  res.status(200).json(genre);
});

router.post("/", validate(genreCreateSchema), (req, res) => {
  res.status(201).json(createGenre(req.body));
});

router.put("/:id", validate(genreUpdateSchema), (req, res, next) => {
  const genre = updateGenre(req.params.id, req.body);
  if (!genre) {
    next(new ApiError(404, "Genre not found"));
    return;
  }
  res.status(200).json(genre);
});

router.delete("/:id", (req, res, next) => {
  try {
    if (!deleteGenre(req.params.id)) {
      next(new ApiError(404, "Genre not found"));
      return;
    }
    res.status(204).end();
  }
  catch (error) {
    next(error);
  }
});

export default router;
