import { Hono } from "hono";

import { Env } from "./configs/environments";
import bookApp from "./routes/books";
import bookCoversApp from "./routes/admin/book-covers";
import userApp from "./routes/users";
import loanApp from "./routes/admin/loans";
import adminBookRoute from "./routes/admin/books";
import { APIConfig } from "./configs";
import { jwtGuardMiddleware } from "./middlewares";
import { corsMiddleware } from "./middlewares/cors-middleware";
import { errorMiddleware } from "./middlewares/error-middleware";
import { userMiddleware } from "./middlewares/user-middleware";
import { trailMiddleware } from "./middlewares/trail-middleware";

const app = new Hono<APIConfig>();

// Apply Middlewares
app.use(corsMiddleware());
app.onError(errorMiddleware);

app.route("/books", bookApp);
app.route("/users", userApp);

app
  .use(jwtGuardMiddleware)
  .use(userMiddleware)
  .use(trailMiddleware)
  .route("/admin/books", adminBookRoute)
  .route("/admin/book-covers", bookCoversApp)
  .route("/admin/loans", loanApp);

export default app;
