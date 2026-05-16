import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import {
  getBooks,
  getBookById,
  getBookByIsbn,
} from "../database/queries/book-queries";
import { ok, okList } from "../utils/response";
import { parsePagination } from "../utils/requests";
import { parseId } from "../utils/requests";

import { type BookEntity } from "../domains/books/entity";
import { APIConfig } from "../configs/api";

const bookApp = new Hono<APIConfig>();

bookApp.get("/", async (ctx) => {
  const { page, limit } = parsePagination(ctx);
  const { books, total } = await getBooks(ctx.env.DB, { page, limit });

  return ctx.json(okList<BookEntity>(books, { page, limit }, total));
});

bookApp.get("/isbn/:isbn", async (ctx) => {
  const isbn = ctx.req.param("isbn");
  const book = await getBookByIsbn(ctx.env.DB, isbn);
  if (!book) {
    throw new HTTPException(404, {
      message: `Book with isbn ${isbn} is not found in our record`,
    });
  }

  return ctx.json(ok(book));
});

bookApp.get("/:id", async (ctx) => {
  const id = parseId(ctx.req.param("id"));
  const book = await getBookById(ctx.env.DB, id);
  if (!book) {
    throw new HTTPException(404, {
      message: `Book with id ${id} is not found in our record`,
    });
  }

  return ctx.json(ok(book));
});

export default bookApp;
