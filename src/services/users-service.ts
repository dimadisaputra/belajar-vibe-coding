import { db } from "../db";
import { users, sessions } from "../schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export type CreateUser = typeof users.$inferInsert;

/**
 * Registers a new user.
 * 
 * @param data - The user creation data containing name, email, and password.
 * @returns A confirmation string "OK".
 * @throws Error if the email is already registered.
 */
export const registerUser = async (data: CreateUser) => {
  const { name, email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return "OK";
};

/**
 * Authenticates a user and creates a new session.
 * 
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns The generated session token.
 * @throws Error if the email or password is incorrect.
 */
export const loginUser = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  const token = randomUUID();

  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};

/**
 * Retrieves the currently authenticated user based on their session token.
 * 
 * @param token - The session token.
 * @returns The user data excluding the password.
 * @throws Error if the token is invalid or the user is not found.
 */
export const getCurrentUser = async (token: string) => {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    throw new Error("Unauthorized or invalid token");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      created_at: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    throw new Error("Unauthorized or invalid token");
  }

  return user;
};

/**
 * Logs out a user by deleting their session.
 * 
 * @param token - The session token to invalidate.
 * @returns A confirmation string "OK".
 * @throws Error if the token is invalid.
 */
export const logoutUser = async (token: string) => {
  const result = await db.delete(sessions).where(eq(sessions.token, token));

  if (result.rowCount === 0) {
    throw new Error("Unauthorized or invalid token");
  }

  return "OK";
};
