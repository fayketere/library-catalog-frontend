import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("library catalog API", () => {
  it("validates payloads and supports genre and book CRUD with combined filtering", async () => {
    const librarian = request.agent(app);
    await librarian
      .post("/api/auth/login")
      .send({ username: "librarian", password: "LibraryAdmin123!" })
      .expect(200);

    const invalidGenre = await request(app)
      .post("/api/v1/genres")
      .send({});
    expect(invalidGenre.status).toBe(400);
    expect(invalidGenre.body.errors).toContainEqual(expect.objectContaining({ field: "name" }));

    const invalidBook = await librarian
      .post("/api/v1/books")
      .send({});
    expect(invalidBook.status).toBe(400);
    expect(invalidBook.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "title" }),
      expect.objectContaining({ field: "author" }),
      expect.objectContaining({ field: "genre" }),
    ]));
    expect(invalidBook.body).not.toHaveProperty("stack");

    const genreResponse = await request(app)
      .post("/api/v1/genres")
      .send({ name: "Science Fiction", description: "Speculative fiction" });
    expect(genreResponse.status).toBe(201);
    const genreId = genreResponse.body.id as string;

    expect((await request(app).get("/api/v1/genres")).status).toBe(200);
    expect((await request(app).get(`/api/v1/genres/${genreId}`)).body.name).toBe("Science Fiction");
    expect((await request(app).put(`/api/v1/genres/${genreId}`).send({ name: "Sci-Fi" })).status).toBe(200);

    const nonexistentGenreBook = await librarian
      .post("/api/v1/books")
      .send({ title: "Unlinked", author: "Writer", genre: "missing-genre" });
    expect(nonexistentGenreBook.status).toBe(400);
    expect(nonexistentGenreBook.body.errors).toContainEqual(expect.objectContaining({ field: "genre" }));

    const firstBook = await librarian
      .post("/api/v1/books")
      .send({ title: "Dune", author: "Frank Herbert", genre: genreId });
    const secondBook = await librarian
      .post("/api/v1/books")
      .send({ title: "Dune Messiah", author: "Frank Herbert", genre: genreId });
    await librarian
      .post("/api/v1/books")
      .send({ title: "Ancillary Justice", author: "Ann Leckie", genre: genreId });
    expect(firstBook.status).toBe(201);
    expect(secondBook.status).toBe(201);

    const paged = await request(app)
      .get("/api/v1/books")
      .query({ genre: genreId, search: "dune", page: 2, limit: 1 });
    expect(paged.status).toBe(200);
    expect(paged.body.data).toHaveLength(1);
    expect(paged.body.data[0].title).toBe("Dune Messiah");
    expect(paged.body.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    const byAuthor = await request(app)
      .get("/api/v1/books")
      .query({ search: "frank herbert", limit: 10 });
    expect(byAuthor.body.data).toHaveLength(2);
    expect((await request(app).get(`/api/v1/books/${firstBook.body.id}`)).status).toBe(200);

    const updatedBook = await librarian
      .put(`/api/v1/books/${firstBook.body.id}`)
      .send({ title: "Dune Updated", author: "Frank Herbert", genre: genreId });
    expect(updatedBook.status).toBe(200);
    expect(updatedBook.body.title).toBe("Dune Updated");

    expect((await request(app).delete(`/api/v1/genres/${genreId}`)).status).toBe(409);
    expect((await librarian.delete(`/api/v1/books/${firstBook.body.id}`)).status).toBe(204);
    expect((await librarian.delete(`/api/v1/books/${secondBook.body.id}`)).status).toBe(204);
    const remainingBooks = (await request(app).get("/api/v1/books")).body.data as Array<{ id: string }>;
    for (const book of remainingBooks) {
      await librarian.delete(`/api/v1/books/${book.id}`).expect(204);
    }

    expect((await request(app).delete(`/api/v1/genres/${genreId}`)).status).toBe(204);
    expect((await request(app).get(`/api/v1/genres/${genreId}`)).status).toBe(404);
  });

  it("rejects invalid pagination and unknown resources with JSON errors", async () => {
    expect((await request(app).get("/api/v1/books?page=0")).status).toBe(400);
    expect((await request(app).get("/api/v1/books/unknown")).body).toEqual({ message: "Book not found" });
    const librarian = request.agent(app);
    await librarian.post("/api/auth/login").send({ email: "librarian@library.test", password: "LibraryAdmin123!" }).expect(200);
    expect((await librarian.put("/api/v1/books/unknown").send({})).status).toBe(400);

    const malformedJson = await librarian
      .post("/api/v1/books")
      .set("Content-Type", "application/json")
      .send("{");
    expect(malformedJson.status).toBe(400);
    expect(malformedJson.body).toEqual({
      message: "Invalid JSON request body",
      errors: [{ field: "body", message: "Request body must be valid JSON" }],
    });
  });
});
