import { Buffer } from "node:buffer";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import type { User, UserRole } from "../models/user.js";

const users = new Map<string, User>();
const dummySalt = randomBytes(16).toString("hex");
const dummyHash = scryptSync(randomBytes(32).toString("hex"), dummySalt, 64).toString("hex");

export function createUser(input: {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}): User {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const user: User = {
    id: randomUUID(),
    username,
    email,
    passwordHash: hashPassword(input.password),
    role: input.role ?? "patron",
  };

  users.set(user.id, user);
  return user;
}

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function findUserByIdentifier(identifier: string): User | undefined {
  const normalized = identifier.trim().toLowerCase();
  return [...users.values()].find(user =>
    user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized,
  );
}

export function userExists(username: string, email: string): boolean {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  return [...users.values()].some(user =>
    user.username.toLowerCase() === normalizedUsername || user.email.toLowerCase() === normalizedEmail,
  );
}

export function verifyPassword(user: User | undefined, password: string): user is User {
  const [salt, expectedHash] = user
    ? user.passwordHash.split("$")
    : [dummySalt, dummyHash];
  const suppliedHash = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");
  return suppliedHash.length === expected.length
    && timingSafeEqual(suppliedHash, expected)
    && user !== undefined;
}

export function seedLibrarian(): void {
  if ([...users.values()].some(user => user.role === "librarian")) {
    return;
  }

  createUser({
    username: "librarian",
    email: "librarian@library.test",
    password: "LibraryAdmin123!",
    role: "librarian",
  });
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}$${hash}`;
}
