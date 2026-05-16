import { Context, Next } from "hono";

import { APIConfig } from "../configs";
import { getUserById } from "../database/queries";
import { HTTPException } from "hono/http-exception";

export async function userMiddleware(ctx: Context<APIConfig>, next: Next) {
  const payload = ctx.get("jwtPayload") as { sub: number };
  if (!payload) {
    ctx.set("user", undefined);
    throw new HTTPException(401, { message: "unauthorized access"});
  }
  
  const user = await getUserById(ctx.env.DB, payload.sub);
  if (!user) {
    ctx.set("user", undefined);
    throw new HTTPException(401, { message: "failed to get user from the token"});
  }

  ctx.set("user", user);

  return next();
}
