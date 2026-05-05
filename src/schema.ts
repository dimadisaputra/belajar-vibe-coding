import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users table schema.
 * Stores user account information.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Sessions table schema.
 * Stores authentication tokens for users.
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Relationships for the users table.
 * A user can have many sessions.
 */
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

/**
 * Relationships for the sessions table.
 * A session belongs to one user.
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
