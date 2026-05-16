import { eq } from "drizzle-orm";
import { db } from "../connection";
import { usersTable } from "../schema";
import { toUserEntity, type UserEntity } from "../../domains/users/entity";

type UserInsert = typeof usersTable.$inferInsert;
type UserUpdate = Partial<Omit<UserInsert, "id" | "createdAt">>;

export type UserAuthData = {
  id: number;
  status: "active" | "inactive";
  passwordHash: string;
};

export async function getUserById(
  d1: D1Database,
  id: number,
): Promise<UserEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .get();
  return record ? toUserEntity(record) : undefined;
}

export async function getUserByEmail(
  d1: D1Database,
  email: string,
): Promise<UserEntity | undefined> {
  const record = await db(d1)
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();
  return record ? toUserEntity(record) : undefined;
}

export async function getUserAuthByEmail(
  d1: D1Database,
  email: string,
): Promise<UserAuthData | undefined> {
  const record = await db(d1)
    .select({
      id: usersTable.id,
      status: usersTable.status,
      passwordHash: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .get();
  return record ?? undefined;
}

export async function getUserForPasswordReset(
  d1: D1Database,
  token: string,
): Promise<{ user: UserEntity; expiresAt: number } | undefined> {
  const record = await db(d1)
    .select()
    .from(usersTable)
    .where(eq(usersTable.resetToken, token))
    .get();

  if (!record || record.resetTokenExpiresAt == null) {
    return undefined;
  }

  return { user: toUserEntity(record), expiresAt: record.resetTokenExpiresAt };
}

export async function createUser(
  d1: D1Database,
  data: Omit<UserInsert, "id" | "createdAt" | "updatedAt">,
): Promise<UserEntity | undefined> {
  const record = await db(d1).insert(usersTable).values(data).returning().get();
  return record ? toUserEntity(record) : undefined;
}

export async function updateUser(
  d1: D1Database,
  id: number,
  data: UserUpdate,
): Promise<UserEntity | undefined> {
  const record = await db(d1)
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning()
    .get();
  return record ? toUserEntity(record) : undefined;
}
