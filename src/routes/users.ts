import { Hono } from "hono";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import {
  ok,
  fail,
  parseId,
  hashPassword,
  verifyPassword,
  generateToken,
} from "../utils";
import {
  getUserById,
  getUserByEmail,
  getUserAuthByEmail,
  getUserForPasswordReset,
  createUser,
  updateUser,
} from "../database/queries";
import {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  assertUserExists,
  assertUserActive,
  type UserEntity,
} from "../domains/users";
import { jwtGuardMiddleware } from "../middlewares";
import { currentTimestamp, generateExpiryTime } from "../utils";
import { APIConfig, RESET_TOKEN_TTL, SESSION_TOKEN_TTL } from "../configs";

const userApp = new Hono<APIConfig>();

userApp.get("/me", jwtGuardMiddleware, async (ctx) => {
  const payload = ctx.get("jwtPayload") as { sub: number };
  const user = await getUserById(ctx.env.DB, payload.sub);
  if (!user) {
    ctx.json(fail("user is not found"), 404);
  }
  return ctx.json(ok(user));
});

userApp.post("/register", zValidator("json", RegisterSchema), async (ctx) => {
  const { displayName, email, password } = ctx.req.valid("json");

  const existing = await getUserByEmail(ctx.env.DB, email);
  if (existing) {
    return ctx.json(fail("Email already registered"), 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(ctx.env.DB, {
    displayName,
    email,
    password: passwordHash,
  });

  return ctx.json(ok<UserEntity | undefined>(user, "Registered"), 201);
});

userApp.post("/login", zValidator("json", LoginSchema), async (ctx) => {
  const { email, password } = ctx.req.valid("json");

  const authData = await getUserAuthByEmail(ctx.env.DB, email);
  if (!authData) {
    return ctx.json(fail("Invalid email or password"), 400);
  }
  if (authData.status !== "active") {
    return ctx.json(fail("Account is deactivated"), 403);
  }

  const valid = await verifyPassword(password, authData.passwordHash);
  if (!valid) {
    return ctx.json(fail("Invalid email or password"), 400);
  }

  const token = await sign(
    {
      sub: authData.id,
      exp: generateExpiryTime(SESSION_TOKEN_TTL),
    },
    ctx.env.JWT_SECRET,
  );

  return ctx.json(ok({ token }, "Login successful"));
});

userApp.post(
  "/forgot-password",
  zValidator("json", ForgotPasswordSchema),
  async (ctx) => {
    const { email } = ctx.req.valid("json");

    const user = await getUserByEmail(ctx.env.DB, email);
    if (!user) {
      return ctx.json(
        ok(null, "If that email exists, a reset token has been issued"),
      );
    }

    const token = generateToken();
    const expiresAt = generateExpiryTime(RESET_TOKEN_TTL);

    await updateUser(ctx.env.DB, user.id, {
      resetToken: token,
      resetTokenExpiresAt: expiresAt,
      updatedAt: currentTimestamp(),
    });

    // In production: send token via email. Returned here for development.
    return ctx.json(ok({ resetToken: token }, "Reset token issued"));
  },
);

userApp.post(
  "/reset-password",
  zValidator("json", ResetPasswordSchema),
  async (ctx) => {
    const { token, newPassword } = ctx.req.valid("json");

    const result = await getUserForPasswordReset(ctx.env.DB, token);
    if (!result) {
      return ctx.json(fail("Invalid or expired reset token"), 400);
    }

    const now = currentTimestamp();
    if (result.expiresAt < now) {
      return ctx.json(fail("Invalid or expired reset token"), 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await updateUser(ctx.env.DB, result.user.id, {
      password: passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
      updatedAt: now,
    });

    return ctx.json(ok(null, "Password reset successfully"));
  },
);

userApp.patch(
  "/:id/password",
  jwtGuardMiddleware,
  zValidator("json", ChangePasswordSchema),
  async (ctx) => {
    const id = parseId(ctx.req.param("id"));
    const payload = ctx.get("jwtPayload") as { sub: number };

    if (payload.sub !== id) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    const { oldPassword, newPassword } = ctx.req.valid("json");

    const user = await getUserById(ctx.env.DB, id);
    assertUserExists(user);
    assertUserActive(user);

    const authData = await getUserAuthByEmail(ctx.env.DB, user.email);
    if (!authData) {
      throw new HTTPException(500, { message: "Internal server error" });
    }

    const valid = await verifyPassword(oldPassword, authData.passwordHash);
    if (!valid) {
      return ctx.json(fail("Old password is incorrect"), 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await updateUser(ctx.env.DB, id, {
      password: passwordHash,
      updatedAt: currentTimestamp(),
    });

    return ctx.json(ok(null, "Password changed successfully"));
  },
);

userApp.patch("/:id/deactivate", jwtGuardMiddleware, async (ctx) => {
  const id = parseId(ctx.req.param("id"));
  const payload = ctx.get("jwtPayload") as { sub: number };

  if (payload.sub !== id) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const user = await getUserById(ctx.env.DB, id);
  assertUserExists(user);
  assertUserActive(user);

  const updated = await updateUser(ctx.env.DB, id, {
    status: "inactive",
    updatedAt: currentTimestamp(),
  });

  return ctx.json(ok(updated, "Account deactivated"));
});

export default userApp;
