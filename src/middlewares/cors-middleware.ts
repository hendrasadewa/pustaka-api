import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
}
