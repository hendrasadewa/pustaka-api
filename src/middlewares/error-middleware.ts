import { Context, ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";
import { fail } from "../utils/response";

export function errorMiddleware(err:  Error | HTTPResponseError, ctx: Context) {
  if (err instanceof HTTPException) {
    return ctx.json(fail(err.message), err.status);
  }
  console.error(err);
  return ctx.json(fail("Internal server error", err.message), 500);
}