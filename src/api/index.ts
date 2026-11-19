import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import auth from "../routes/auth.js";
import books from "../routes/books.js";
import genres from "../routes/genres.js";
import users from "../routes/users.js";
import "../seed-user.js";
import emojis from "./emojis.js";

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/emojis", emojis);
router.use("/auth", auth);
router.use("/users", users);
router.use("/genres", genres);
router.use("/books", books);

export default router;
