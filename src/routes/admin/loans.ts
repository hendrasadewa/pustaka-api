import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

import { getBookById, updateBook } from "../../database/queries/book-queries";
import { getLoans, getLoanById, createLoan, returnLoan } from "../../database/queries/book-loan-queries";
import { jwtGuardMiddleware } from "../../middlewares/jwt-middleware";
import { isBookAvailable } from "../../domains/books/helpers";
import { assertBookExists } from "../../domains/books/entity";
import { ok, okList } from "../../utils/response";
import { parsePagination } from "../../utils/requests";
import { parseId } from "../../utils/requests";

import { type BookLoanEntity, assertLoanExists, assertNotReturned } from "../../domains/loans/entity";
import { LoanCreateSchema } from "../../domains/loans/dto";
import { APIConfig } from "../../configs/api";

const loanApp = new Hono<APIConfig>();

loanApp
  .get("/", async (ctx) => {
    const { page, limit } = parsePagination(ctx);
    const rawStatus = ctx.req.query("status");
    const status =
      rawStatus === "active" || rawStatus === "returned" ? rawStatus : undefined;

    const { loans, total } = await getLoans(ctx.env.DB, { page, limit }, status);

    return ctx.json(okList<BookLoanEntity>(loans, { page, limit }, total));
  })
  .get("/:id", async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const loan = await getLoanById(ctx.env.DB, id);
    assertLoanExists(loan);

    return ctx.json(ok(loan));
  })
  .post("/", jwtGuardMiddleware, zValidator("json", LoanCreateSchema), async (ctx) => {
    const { bookId, userId } = ctx.req.valid("json");

    const book = await getBookById(ctx.env.DB, bookId);
    assertBookExists(book);

    if (!isBookAvailable(book)) {
      throw new HTTPException(422, { message: "No copies available for borrowing" });
    }

    const loan = await createLoan(ctx.env.DB, { bookId, userId });
    await updateBook(ctx.env.DB, bookId, {
      availableCopies: book.availableCopies - 1,
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return ctx.json(ok(loan, "Borrowed"), 201);
  })
  .patch("/:id/return", jwtGuardMiddleware, async (ctx) => {
    const id = parseId(ctx.req.param("id"));

    const loan = await getLoanById(ctx.env.DB, id);
    assertLoanExists(loan);
    assertNotReturned(loan);

    const updatedLoan = await returnLoan(ctx.env.DB, id);

    const book = await getBookById(ctx.env.DB, loan.bookId);
    assertBookExists(book);
    await updateBook(ctx.env.DB, loan.bookId, {
      availableCopies: book.availableCopies + 1,
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return ctx.json(ok(updatedLoan, "Returned"));
  });

export default loanApp;
