import { HTTPException } from "hono/http-exception";

export function parseId(param: string | undefined): number {
  const id = Number(param);
  if (isNaN(id)) {
    throw new HTTPException(400, { message: "Invalid id" });
  }
  return id;
}