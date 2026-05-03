import { HTTPException } from "hono/http-exception";
import { usersTable } from "../../database/schema";

type UserRecord = typeof usersTable.$inferSelect;
type UserStatus = "active" | "inactive";

export interface UserEntity {
  id: number;
  displayName: string;
  email: string;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
}

export function toUserEntity(record: UserRecord): UserEntity {
  return {
    id: record.id,
    displayName: record.displayName,
    email: record.email,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function assertUserExists(user: UserEntity | undefined): asserts user is UserEntity {
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
}

export function assertUserActive(user: UserEntity): void {
  if (user.status !== "active") {
    throw new HTTPException(403, { message: "Account is deactivated" });
  }
}
