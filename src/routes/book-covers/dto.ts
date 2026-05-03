import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const CoverCommitSchema = z
  .object({
    bookId: z.number().int().positive().optional(),
    isbn: z.string().optional(),
    coverKey: z.string().min(1),
  })
  .refine((v) => v.bookId !== undefined || v.isbn !== undefined, {
    message: "Either bookId or isbn must be provided",
  });

export type CoverCommitPayload = z.infer<typeof CoverCommitSchema>;
