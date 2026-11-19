import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";

describe("authentication and authorization", () => {
  it("registers patrons, scopes profiles to the session, and revokes sessions on logout", async () => {
    const patron = request.agent(app);
    const registration = await patron
      .post("/api/auth/register")
      .send({ username: "reader-test", email: "reader-test@library.test", password: "ReaderPass123!" })
      .expect(201);

    expect(registration.body.user).toMatchObject({
      username: "reader-test",
      email: "reader-test@library.test",
      role: "patron",
    });
    expect(registration.body.user).not.toHaveProperty("password");
    expect(registration.body.user).not.toHaveProperty("passwordHash");

    const genre = await request(app)
      .post("/api/v1/genres")
      .send({ name: "Auth test genre" })
      .expect(201);
    const bookPayload = { title: "Restricted", author: "Author", genre: genre.body.id as string };

    await request(app).post("/api/v1/books").send(bookPayload).expect(401);
    await request(app).put("/api/v1/books/not-a-book").send(bookPayload).expect(401);
    await request(app).delete("/api/v1/books/not-a-book").expect(401);
    const login = await patron
      .post("/api/auth/login")
      .send({ email: "reader-test@library.test", password: "ReaderPass123!" })
      .expect(200);
    const sessionCookie = String(login.headers["set-cookie"]).split(";")[0];
    await patron.post("/api/v1/books").send(bookPayload).expect(403);
    await patron.put("/api/v1/books/not-a-book").send(bookPayload).expect(403);
    await patron.delete("/api/v1/books/not-a-book").expect(403);

    const profile = await patron
      .get("/api/users/profile")
      .query({ id: "someone-else" })
      .expect(200);
    expect(profile.body).toMatchObject({
      id: registration.body.user.id,
      username: "reader-test",
      email: "reader-test@library.test",
      role: "patron",
    });
    expect(profile.body).not.toHaveProperty("passwordHash");

    await patron.post("/api/auth/logout").expect(204);
    await patron.get("/api/users/profile").expect(401);
    await request(app).get("/api/users/profile").set("Cookie", sessionCookie).expect(401);
    await patron.post("/api/v1/books").send(bookPayload).expect(401);
  });

  it("allows the seeded librarian to mutate books and rejects attempts to register as a librarian", async () => {
    const registration = await request(app)
      .post("/api/auth/register")
      .send({
        username: "not-a-librarian",
        email: "not-a-librarian@library.test",
        password: "ReaderPass123!",
        role: "librarian",
      })
      .expect(201);
    expect(registration.body.user.role).toBe("patron");

    const librarian = request.agent(app);
    await librarian
      .post("/api/auth/login")
      .send({ username: "librarian", password: "LibraryAdmin123!" })
      .expect(200);
    const genre = await request(app)
      .post("/api/v1/genres")
      .send({ name: "Librarian test genre" })
      .expect(201);
    const book = await librarian
      .post("/api/v1/books")
      .send({ title: "Allowed", author: "Librarian", genre: genre.body.id as string })
      .expect(201);

    await librarian
      .put(`/api/v1/books/${book.body.id}`)
      .send({ title: "Updated", author: "Librarian", genre: genre.body.id as string })
      .expect(200);
    await librarian.delete(`/api/v1/books/${book.body.id}`).expect(204);
  });
});
