# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                        # Start local dev server (wrangler dev)
pnpm deploy                     # Deploy to Cloudflare Workers

pnpm db:generate                # Generate migrations from schema changes
pnpm db:migrate:local           # Apply migrations to local D1
pnpm db:migrate:remote          # Apply migrations to remote Cloudflare D1

pnpm cf-typegen                 # Regenerate Cloudflare binding types

pnpm exec wrangler deploy --dry-run  # Type-check / build check (tsc not installed directly)
```

No test framework or linter is configured.

### Local secrets

Create `.dev.vars` (gitignored) for local dev:
```
JWT_SECRET=any-local-secret-string
```

In production, set via `wrangler secret put JWT_SECRET`.

## Architecture

**Pustaka** is a library management REST API running on Cloudflare Workers. Stack: Hono + Drizzle ORM + Cloudflare D1 (SQLite) + Zod.

### Request lifecycle

```plaintext
src/index.ts          → mounts subrouters, global error handler
routes/{resource}/
  index.ts            → Hono route handlers, input validation via zValidator
  dto.ts              → Zod schemas for request bodies
  entity.ts           → TypeScript type, DB record → entity mapper, domain helpers
database/
  connection.ts       → drizzle(d1) factory, called per-request with ctx.env.DB
  schema.ts           → single source of truth for all table definitions
  queries/{resource}-queries.ts → Drizzle query functions (receive D1Database as first arg)
```

### Key conventions

- **Response shape**: always use `ok()`, `fail()`, or `okList()` from `utils/response.ts`. Never return raw objects.
- **Pagination**: call `parsePagination(ctx)` to extract `{ page, limit }` from query params (defaults: page=1, limit=10, max=100).
- **DB access**: query functions take `d1: D1Database` as their first argument and call `db(d1)` internally. Never import a singleton DB client.
- **Types**: use `typeof table.$inferSelect` / `$inferInsert` for DB types; define a separate `*Entity` type for API responses and map via `to*Entity()`.
- **Validation guard** in borrow/return routes: pre-fetch the book and check domain invariants (via `isAvailable()`, copy counts) before the mutating query.
- **JWT auth**: applied inline per route as `(ctx, next) => jwt({ secret: ctx.env.JWT_SECRET })(ctx, next)` (can't use a static middleware because the secret is a runtime binding). Payload available via `ctx.get("jwtPayload")`.
- **Password hashing**: uses `crypto.subtle` PBKDF2-SHA256 via `src/utils/crypto.ts` — no external library needed in CF Workers.
- **Sensitive fields** (`password`, `resetToken`, `resetTokenExpiresAt`) are stripped in `toUserEntity()` and never appear in API responses.

### Database

Schema lives in `src/database/schema.ts`. After editing it:

1. Run `pnpm db:generate` to produce a migration file in `drizzle/`.
2. Run `pnpm db:migrate:local` to apply locally.

Remote migrations require env vars `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN`.

Timestamps (`createdAt`, `updatedAt`) are Unix epoch seconds set by `DEFAULT (unixepoch())` — they are **not** auto-updated on `UPDATE`, so set them explicitly in mutation queries when needed.

### Adding a new resource

1. Add table to `src/database/schema.ts`, generate + apply migration.
2. Create `src/routes/{resource}/entity.ts`, `dto.ts`, `index.ts`.
3. Create `src/database/queries/{resource}-queries.ts`.
4. Register with `app.route("/{resource}", resourceApp)` in `src/index.ts`.

Users resource is fully implemented at `/users`.
