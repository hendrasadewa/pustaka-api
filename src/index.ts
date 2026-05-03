import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { Env } from "./configs/environments";
import { fail } from "./utils/response";
import bookApp from "./routes/books";
import bookCoversApp from "./routes/book-covers";
import userApp from "./routes/users";
import loanApp from "./routes/loans";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use(cors({ origin: "*" }));

app.onError((err, ctx) => {
  if (err instanceof HTTPException) {
    return ctx.json(fail(err.message), err.status);
  }
  console.error(err);
  return ctx.json(fail("Internal server error", err.message), 500);
});

app.route("/books/covers", bookCoversApp);
app.route("/books", bookApp);
app.route("/users", userApp);
app.route("/loans", loanApp);

export default app;
