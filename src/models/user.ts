export type UserRole = "patron" | "librarian";

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}
