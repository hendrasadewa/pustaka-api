import { HTTPException } from "hono/http-exception";
import { bookLoansTable } from "../../database/schema";

type BookLoanRecord = typeof bookLoansTable.$inferSelect;

export interface BookLoanEntity {
  id: number;
  bookId: number;
  userId: number;
  borrowedAt: number;
  returnedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export function toBookLoanEntity(record: BookLoanRecord): BookLoanEntity {
  return {
    id: record.id,
    bookId: record.bookId,
    userId: record.userId,
    borrowedAt: record.borrowedAt,
    returnedAt: record.returnedAt ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function assertLoanExists(loan: BookLoanEntity | undefined): asserts loan is BookLoanEntity {
  if (!loan) {
    throw new HTTPException(404, { message: "Loan not found" });
  }
}

export function assertNotReturned(loan: BookLoanEntity): void {
  if (loan.returnedAt !== null) {
    throw new HTTPException(422, { message: "Book has already been returned" });
  }
}
