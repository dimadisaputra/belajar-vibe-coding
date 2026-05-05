import { db } from "../db";
import { users, sessions } from "../schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export type CreateUser = typeof users.$inferInsert;

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
