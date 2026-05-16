import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

import { APIConfig } from "../configs";

export async function jwtGuardMiddleware(
  ctx: Context<APIConfig>,
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
