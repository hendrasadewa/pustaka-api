import { cors } from "hono/cors";

export function corsMiddleware() {
  return cors({
    allowHeaders: ["Content-Type", "Authorization", "User-Agent", "Origin"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 600,
    origin: ["http://localhost:5173", "https://pustaka.hendrasadewa.com"],
  });
}
