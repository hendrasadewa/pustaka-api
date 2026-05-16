import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

import { APIConfig } from "../../configs";
import { jwtGuardMiddleware } from "../../middlewares/jwt-middleware";
import {
  getBookById,
  getBookByIsbn,
  updateBook,
  createUploadToken,
  getUploadTokenByValue,
  markTokenUsed,
} from "../../database/queries";
import {
  assertBookExists,
  ALLOWED_IMAGE_MIMETYPE,
  type AllowedImageMimeType,
  CoverCommitSchema,
} from "../../domains/books";
import { currentTimestamp, generateExpiryTime, ok, fail, extFromMime } from "../../utils";

const UPLOAD_TOKEN_TTL = 60 * 15; // 15 minutes

const bookCoversApp = new Hono<APIConfig>();

bookCoversApp
  .use(jwtGuardMiddleware)
  .post("/upload-token", async (ctx) => {
    const token = crypto.randomUUID();
    const expiresAt = generateExpiryTime(UPLOAD_TOKEN_TTL);

    const record = await createUploadToken(ctx.env.DB, { token, expiresAt });
    if (!record) {
      throw new HTTPException(500, {
        message: "Failed to create upload token",
      });
    }

    return ctx.json(
      ok(
        { token: record.token, expiresAt: record.expiresAt },
        "Upload token issued",
      ),
      201,
    );
  });

bookCoversApp.post("/upload", async (ctx) => {
  let formData: FormData;
  try {
    formData = await ctx.req.formData();
  } catch {
    return ctx.json(fail("Request must be multipart/form-data"), 400);
  }

  const tokenValue = formData.get("token");
  if (!tokenValue || typeof tokenValue !== "string") {
    return ctx.json(fail("Missing upload token"), 400);
  }

  const tokenRecord = await getUploadTokenByValue(ctx.env.DB, tokenValue);
  if (!tokenRecord) {
    return ctx.json(fail("Invalid upload token"), 401);
  }
  if (tokenRecord.usedAt !== null) {
    return ctx.json(fail("Upload token has already been used"), 401);
  }
  const now = currentTimestamp();
  if (tokenRecord.expiresAt < now) {
    return ctx.json(fail("Upload token has expired"), 401);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return ctx.json(fail("Missing or invalid file field"), 400);
  }

  const mime = file.type as AllowedImageMimeType;
  if (!(ALLOWED_IMAGE_MIMETYPE as readonly string[]).includes(mime)) {
    return ctx.json(
      fail(`Unsupported file type. Allowed: ${ALLOWED_IMAGE_MIMETYPE.join(", ")}`),
      415,
    );
  }

  const ext = extFromMime(mime);
  const key = `covers/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  await ctx.env.COVERS.put(key, arrayBuffer, {
    httpMetadata: { contentType: mime },
  });

  await markTokenUsed(ctx.env.DB, tokenRecord.id, now);

  return ctx.json(ok({ key }, "Cover uploaded"), 201);
});

bookCoversApp.post(
  "/commit",
  zValidator("json", CoverCommitSchema),
  async (ctx) => {
    const { bookId, isbn, coverKey } = ctx.req.valid("json");

    let book;
    if (bookId !== undefined) {
      book = await getBookById(ctx.env.DB, bookId);
    } else {
      book = await getBookByIsbn(ctx.env.DB, isbn!);
    }
    assertBookExists(book);

    const updated = await updateBook(ctx.env.DB, book.id, {
      coverUrl: coverKey,
      updatedAt: currentTimestamp(),
    });
    assertBookExists(updated);

    return ctx.json(ok(updated, "Cover committed"));
  },
);

export default bookCoversApp;
