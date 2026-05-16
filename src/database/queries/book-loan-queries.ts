import { count, eq, isNull, isNotNull } from "drizzle-orm";
import { db } from "../connection";
import { bookLoansTable } from "../schema";
import {
  toBookLoanEntity,
  type BookLoanEntity,
} from "../../domains/loans/entity";
import type { PaginationParams } from "../../types/API";

type BookLoanInsert = typeof bookLoansTable.$inferInsert;
type LoanStatus = "active" | "returned";

export async function getLoans(
  d1: D1Database,
  { page, limit }: PaginationParams,
  status?: LoanStatus,
) {
  const offset = (page - 1) * limit;

  const baseSelect = db(d1).select().from(bookLoansTable);
  const baseCount = db(d1).select({ total: count() }).from(bookLoansTable);

  const [records, [{ total }]] = await Promise.all([
    status === "active"
      ? baseSelect
          .where(isNull(bookLoansTable.returnedAt))
          .limit(limit)
          .offset(offset)
          .all()
      : status === "returned"
        ? baseSelect
            .where(isNotNull(bookLoansTable.returnedAt))
            .limit(limit)
            .offset(offset)
            .all()
        : baseSelect.limit(limit).offset(offset).all(),
    status === "active"
      ? baseCount.where(isNull(bookLoansTable.returnedAt)).all()
      : status === "returned"
        ? baseCount.where(isNotNull(bookLoansTable.returnedAt)).all()
        : baseCount.all(),
  ]);

  return { loans: records.map(toBookLoanEntity), total };
}

export async function getLoanById(
  d1: D1Database,
  id: number,
): Promise<BookLoanEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(bookLoansTable)
    .where(eq(bookLoansTable.id, id))
    .get();
  return record ? toBookLoanEntity(record) : undefined;
}

export async function createLoan(
  d1: D1Database,
  data: Pick<BookLoanInsert, "bookId" | "userId">,
): Promise<BookLoanEntity | undefined> {
  const record = await db(d1)
    .insert(bookLoansTable)
    .values(data)
    .returning()
    .get();
  return record ? toBookLoanEntity(record) : undefined;
}

export async function returnLoan(
  d1: D1Database,
  id: number,
): Promise<BookLoanEntity | undefined> {
  const now = Math.floor(Date.now() / 1000);
  const record = await db(d1)
    .update(bookLoansTable)
    .set({ returnedAt: now, updatedAt: now })
    .where(eq(bookLoansTable.id, id))
    .returning()
    .get();
  return record ? toBookLoanEntity(record) : undefined;
}
