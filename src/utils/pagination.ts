import type { Context } from "hono";
import type { PaginationParams } from "../types/API";

export function parsePagination(ctx: Context): PaginationParams {
  const page = Math.max(1, Number(ctx.req.query("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(ctx.req.query("limit") ?? "10")));
  return { page, limit };
}
