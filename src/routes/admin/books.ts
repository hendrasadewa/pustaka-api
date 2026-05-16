import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { type BookEntity, assertBookExists } from "../../domains/books/entity";
import {
  BookCreateSchema,
  BookUpdateSchema,
  BookChangeStatusSchema,
} from "../../domains/books/dto";
import { ok } from "../../utils/response";
import { parseId } from "../../utils/requests";
import {
  changeBookStatus,
  createBook,
  deleteBook,
  updateBook,
} from "../../database/queries/book-queries";

const adminBookRoute = new Hono<{ Bindings: Env }>();

adminBookRoute
  .post("/", zValidator("json", BookCreateSchema), async (ctx) => {
    const body = ctx.req.valid("json");
    const book = await createBook(ctx.env.DB, body);

    return ctx.json(ok(book, "Created"), 201);
  })
  .put("/:id", zValidator("json", BookUpdateSchema), async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const body = ctx.req.valid("json");
    const book = await updateBook(ctx.env.DB, id, body);
    assertBookExists(book);

    return ctx.json(ok(book, "Updated"));
  })
  .delete("/:id", async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const book = await deleteBook(ctx.env.DB, id);
    assertBookExists(book);

    return ctx.json(ok(book, "Deleted"));
  })
  .patch(
    "/:id/status",
    zValidator("json", BookChangeStatusSchema),
    async (ctx) => {
      const id = parseId(ctx.req.param("id"));
      const { status } = ctx.req.valid("json");
      const book = await changeBookStatus(ctx.env.DB, id, status);
      assertBookExists(book);

      return ctx.json(ok(book, "Status updated"));
    },
  );

export default adminBookRoute;
