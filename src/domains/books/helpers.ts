import { BookEntity } from "./entity";

export function getBookBorrowedCopies(
  totalCopies: number,
  availableCopies: number,
): number {
  return totalCopies - availableCopies;
}

export function isBookArchived(book: BookEntity): boolean {
  return book.status === "archived";
}

export function isBookAvailable(book: BookEntity): boolean {
  return book.status === "active" && book.availableCopies > 0;
}