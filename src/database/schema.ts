import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";


export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  displayName: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  status: text({ enum: ["active", "inactive"] }).notNull().default("active"),
  resetToken: text(),
  resetTokenExpiresAt: int(),
  createdAt: int().notNull().default(sql`(unixepoch())`),
  updatedAt: int().notNull().default(sql`(unixepoch())`),
});

export const booksTable = sqliteTable("books", {
  id: int().primaryKey({ autoIncrement: true }),

  // Core identity
  title: text().notNull(),
  author: text().notNull(),       // primary author; extend to authors table if multi-author filtering is needed
  isbn: text().unique(),          // ISBN-10 or ISBN-13

  // Publication info
  publisher: text(),
  language: text().default("id"), // BCP-47 language code

  // Content
  genre: text(),
  description: text(),
  coverUrl: text(),

  // Library stock
  shelfCode: text(),              // physical location, e.g. "B-03-2"
  totalCopies: int().notNull().default(1),
  availableCopies: int().notNull().default(1),

  // Status
  status: text({ enum: ["active", "archived"] }).notNull().default("active"),

  // Timestamps (Unix epoch seconds)
  createdAt: int().notNull().default(sql`(unixepoch())`),
  updatedAt: int().notNull().default(sql`(unixepoch())`),
});

export const bookLoansTable = sqliteTable("book_loans", {
  id: int().primaryKey({ autoIncrement: true }),
  bookId: int().notNull().references(() => booksTable.id),
  userId: int().notNull().references(() => usersTable.id),
  borrowedAt: int().notNull().default(sql`(unixepoch())`),
  returnedAt: int(),  // null = currently borrowed
  createdAt: int().notNull().default(sql`(unixepoch())`),
  updatedAt: int().notNull().default(sql`(unixepoch())`),
});

export const coverUploadTokensTable = sqliteTable("cover_upload_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  token: text().notNull().unique(),
  expiresAt: int().notNull(),
  usedAt: int(),
  createdAt: int().notNull().default(sql`(unixepoch())`),
});
