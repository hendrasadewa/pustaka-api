import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { AllowedImageMimeType } from "../domains/book-covers/dto";
import { PaginationParams } from "../types/API";

export function parseId(param: string | undefined): number {
  const id = Number(param);
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid id" });
  }
  return id;
}

export function parsePagination(ctx: Context): PaginationParams {
  const page = Math.max(1, Number(ctx.req.query("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(ctx.req.query("limit") ?? "10")));
  return { page, limit };
}

export function extFromMime(mime: AllowedImageMimeType): string {
  const map: Record<AllowedImageMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime];
}
