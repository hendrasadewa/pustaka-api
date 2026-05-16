import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

import { APIConfig } from "../configs";

export async function trailMiddleware(ctx: Context<APIConfig>, next: Next) {
  const user = ctx.get("user");
  if (!user) {
    ctx.set("user", undefined);
    throw new HTTPException(401, {
      message: "failed to trail the user, missing user account from context",
    });
  }

  const payload: Record<string, string> = {
    "Time": new Date().toISOString() || "unknown",
    "User-ID": String(user.id),
    "Method": ctx.req.method || "unknown",
    "Path": ctx.req.path || "unknown",
    "User-Agent": ctx.req.header("User-Agent") || "unknown",
    "Content-Type": ctx.req.header("Content-Type") || "unknown"
  }

  const message = Object.keys(payload).reduce(
    (prev, current) => {
      return `${prev} ${current}:${payload[current]}`
    }, ""
  )

  console.log(message);

  return next();
}
