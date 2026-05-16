import { count, eq } from "drizzle-orm";
import { db } from "../connection";
import { booksTable } from "../schema";
import { toBookEntity, type BookEntity } from "../../domains/books/entity";
import type { PaginationParams } from "../../types/API";

type BookInsert = typeof booksTable.$inferInsert;

export async function getBooks(
  d1: D1Database,
  { page, limit }: PaginationParams,
) {
  const offset = (page - 1) * limit;
  const [records, [{ total }]] = await Promise.all([
    db(d1).select().from(booksTable).limit(limit).offset(offset).all(),
    db(d1).select({ total: count() }).from(booksTable).all(),
  ]);
  return { books: records.map(toBookEntity), total };
}

export async function getBookById(
  d1: D1Database,
  id: number,
): Promise<BookEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .get();
  return record ? toBookEntity(record) : undefined;
}

export async function getBookByIsbn(
  d1: D1Database,
  isbn: string,
): Promise<BookEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(booksTable)
    .where(eq(booksTable.isbn, isbn))
    .get();
  return record ? toBookEntity(record) : undefined;
}

export async function createBook(
  d1: D1Database,
  data: Omit<BookInsert, "id" | "createdAt" | "updatedAt">,
): Promise<BookEntity | undefined> {
  const record = await db(d1).insert(booksTable).values(data).returning().get();
  return record ? toBookEntity(record) : undefined;
}

export async function updateBook(
  d1: D1Database,
  id: number,
  data: Partial<Omit<BookInsert, "id" | "createdAt">>,
): Promise<BookEntity | undefined> {
  const record = await db(d1)
    .update(booksTable)
    .set(data)
    .where(eq(booksTable.id, id))
    .returning()
    .get();
  return record ? toBookEntity(record) : undefined;
}

export async function deleteBook(
  d1: D1Database,
  id: number,
): Promise<BookEntity | undefined> {
  const record = await db(d1)
    .delete(booksTable)
    .where(eq(booksTable.id, id))
    .returning()
    .get();
  return record ? toBookEntity(record) : undefined;
}

export async function changeBookStatus(
  d1: D1Database,
  id: number,
  status: "active" | "archived",
): Promise<BookEntity | undefined> {
  const record = await db(d1)
    .update(booksTable)
    .set({ status })
    .where(eq(booksTable.id, id))
    .returning()
    .get();
  return record ? toBookEntity(record) : undefined;
}

