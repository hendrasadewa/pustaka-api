import { eq } from "drizzle-orm";
import { db } from "../connection";
import { coverUploadTokensTable } from "../schema";

type TokenInsert = typeof coverUploadTokensTable.$inferInsert;

export interface CoverUploadTokenEntity {
  id: number;
  token: string;
  expiresAt: number;
  usedAt: number | null;
  createdAt: number;
}

function toEntity(
  record: typeof coverUploadTokensTable.$inferSelect,
): CoverUploadTokenEntity {
  return {
    id: record.id,
    token: record.token,
    expiresAt: record.expiresAt,
    usedAt: record.usedAt ?? null,
    createdAt: record.createdAt,
  };
}

export async function createUploadToken(
  d1: D1Database,
  data: Pick<TokenInsert, "token" | "expiresAt">,
): Promise<CoverUploadTokenEntity | undefined> {
  const record = await db(d1)
    .insert(coverUploadTokensTable)
    .values(data)
    .returning()
    .get();
  return record ? toEntity(record) : undefined;
}

export async function getUploadTokenByValue(
  d1: D1Database,
  token: string,
): Promise<CoverUploadTokenEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(coverUploadTokensTable)
    .where(eq(coverUploadTokensTable.token, token))
    .get();
  return record ? toEntity(record) : undefined;
}

export async function markTokenUsed(
  d1: D1Database,
  id: number,
  usedAt: number,
): Promise<CoverUploadTokenEntity | undefined> {
  const record = await db(d1)
    .update(coverUploadTokensTable)
    .set({ usedAt })
    .where(eq(coverUploadTokensTable.id, id))
    .returning()
    .get();
  return record ? toEntity(record) : undefined;
}
