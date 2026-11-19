import { randomUUID } from "node:crypto";

import { ApiError } from "../middleware/validate.js";

export type Genre = {
  id: string;
  name: string;
  description?: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
};

export type GenreInput = Omit<Genre, "id">;
export type BookInput = Omit<Book, "id">;

const genres = new Map<string, Genre>();
const books = new Map<string, Book>();

export function listGenres(): Genre[] {
  return [...genres.values()];
}

export function findGenre(id: string): Genre | undefined {
  return genres.get(id);
}

export function createGenre(input: GenreInput): Genre {
  const genre = { id: randomUUID(), ...input };
  genres.set(genre.id, genre);
  return genre;
}

export function updateGenre(id: string, input: GenreInput): Genre | undefined {
  if (!genres.has(id)) {
    return undefined;
  }

  const genre = { id, ...input };
  genres.set(id, genre);
  return genre;
}

export function deleteGenre(id: string): boolean {
  if (!genres.has(id)) {
    return false;
  }

  if ([...books.values()].some(book => book.genre === id)) {
    throw new ApiError(409, "Genre cannot be deleted while books reference it");
  }

  return genres.delete(id);
}

export function listBooks(input: { genre?: string; search?: string; page: number; limit: number }) {
  const search = input.search?.toLocaleLowerCase();
  const filtered = [...books.values()].filter((book) => {
    const matchesGenre = !input.genre || book.genre === input.genre;
    const matchesSearch = !search
      || book.title.toLocaleLowerCase().includes(search)
      || book.author.toLocaleLowerCase().includes(search);
    return matchesGenre && matchesSearch;
  });
  const total = filtered.length;
  const start = (input.page - 1) * input.limit;

  return {
    data: filtered.slice(start, start + input.limit),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
}

export function findBook(id: string): Book | undefined {
  return books.get(id);
}

export function createBook(input: BookInput): Book {
  assertGenreExists(input.genre);
  const book = { id: randomUUID(), ...input };
  books.set(book.id, book);
  return book;
}

export function updateBook(id: string, input: BookInput): Book | undefined {
  if (!books.has(id)) {
    return undefined;
  }

  assertGenreExists(input.genre);
  const book = { id, ...input };
  books.set(id, book);
  return book;
}

export function deleteBook(id: string): boolean {
  return books.delete(id);
}

function assertGenreExists(id: string): void {
  if (!genres.has(id)) {
    throw new ApiError(400, "Validation failed", [{
      field: "genre",
      message: "Genre id does not exist",
    }]);
  }
}
