import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { Env } from "../../configs/environments";
import {
  getBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
  changeBookStatus,
} from "../../database/queries/book-queries";
import { ok, okList } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";
import { parseId } from "../../utils/requests";

import { type BookEntity, assertBookExists } from "./entity";
import {
  BookCreateSchema,
  BookUpdateSchema,
  BookChangeStatusSchema,
} from "./dto";
import { jwtGuardMiddleware } from "../../middlewares/jwt-guard";
import { HTTPException } from "hono/http-exception";

const bookApp = new Hono<{ Bindings: Env }>();

bookApp
  .get("/", async (ctx) => {
    const { page, limit } = parsePagination(ctx);
    const { books, total } = await getBooks(ctx.env.DB, { page, limit });

    return ctx.json(okList<BookEntity>(books, { page, limit }, total));
  })
  .get("/isbn/:isbn", async (ctx) => {
    const isbn = ctx.req.param("isbn");
    const book = await getBookByIsbn(ctx.env.DB, isbn);
    if (!book) {
      throw new HTTPException(404, {
        message: `Book with isbn ${isbn} is not found in our record`,
      });
    }

    return ctx.json(ok(book));
  })
  .get("/:id", async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const book = await getBookById(ctx.env.DB, id);
    if (!book) {
      throw new HTTPException(404, {
        message: `Book with id ${id} is not found in our record`,
      });
    }

    return ctx.json(ok(book));
  })
  .post(
    "/",
    jwtGuardMiddleware,
    zValidator("json", BookCreateSchema),
    async (ctx) => {
      const body = ctx.req.valid("json");
      const book = await createBook(ctx.env.DB, body);

      return ctx.json(ok(book, "Created"), 201);
    },
  )
  .put(
    "/:id",
    jwtGuardMiddleware,
    zValidator("json", BookUpdateSchema),
    async (ctx) => {
      const id = parseId(ctx.req.param("id"));
      const body = ctx.req.valid("json");
      const book = await updateBook(ctx.env.DB, id, body);
      assertBookExists(book);

      return ctx.json(ok(book, "Updated"));
    },
  )
  .delete("/:id", jwtGuardMiddleware, async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const book = await deleteBook(ctx.env.DB, id);
    assertBookExists(book);

    return ctx.json(ok(book, "Deleted"));
  })
  .patch(
    "/:id/status",
    jwtGuardMiddleware,
    zValidator("json", BookChangeStatusSchema),
    async (ctx) => {
      const id = parseId(ctx.req.param("id"));
      const { status } = ctx.req.valid("json");
      const book = await changeBookStatus(ctx.env.DB, id, status);
      assertBookExists(book);

      return ctx.json(ok(book, "Status updated"));
    },
  );

export default bookApp;
