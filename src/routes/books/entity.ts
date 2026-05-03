import { HTTPException } from "hono/http-exception";
import { booksTable } from "../../database/schema";

type BookRecord = typeof booksTable.$inferSelect;
type BookStatus = "active" | "archived";

export interface BookEntity {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  language: string | null;
  genre: string | null;
  description: string | null;
  coverUrl: string | null;
  shelfCode: string | null;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  createdAt: number;
  updatedAt: number;
}

export function toBookEntity(record: BookRecord): BookEntity {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    isbn: record.isbn ?? null,
    publisher: record.publisher ?? null,
    language: record.language ?? null,
    genre: record.genre ?? null,
    description: record.description ?? null,
    coverUrl: record.coverUrl ?? null,
    shelfCode: record.shelfCode ?? null,
    totalCopies: record.totalCopies,
    availableCopies: record.availableCopies,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function assertBookExists(book: BookEntity | undefined): asserts book is BookEntity {
  if (!book) {
    throw new HTTPException(404, { message: "Book not found" });
  }
}

export function changeStatus(book: BookEntity, status: BookStatus): BookEntity {
  return { ...book, status };
}

