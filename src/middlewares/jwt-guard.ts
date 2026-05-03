import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

import type { Env } from "../configs/environments";

export async function jwtGuardMiddleware(
  ctx: Context<{ Bindings: Env }>,
  next: Next,
) {
  const secret = ctx.env.JWT_SECRET || "";
  if (!secret) {
    throw new HTTPException(500, {
      message: "failed to initiate the jwt config, missing secret",
    });
  }

  return jwt({ secret, alg: "HS256", headerName: "Authorization" })(ctx, next);
}
