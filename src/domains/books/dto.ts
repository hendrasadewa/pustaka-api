import { z } from "zod";

export const BookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().regex(/^\d{10}$|^\d{13}$/, "ISBN must be 10 or 13 digits").optional(),
  publisher: z.string().min(1).optional(),
  language: z.string().optional(),
  genre: z.string().min(1).optional(),
  description: z.string().optional(),
  shelfCode: z.string().min(1).optional(),
  totalCopies: z.number().int().positive().optional(),
});

export const BookUpdateSchema = BookCreateSchema.partial();

export const BookChangeStatusSchema = z.object({
  status: z.enum(["active", "archived"]),
});

export type BookCreatePayload = z.infer<typeof BookCreateSchema>;
export type BookUpdatePayload = z.infer<typeof BookUpdateSchema>;
export type BookChangeStatusPayload = z.infer<typeof BookChangeStatusSchema>;


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

export const ALLOWED_IMAGE_MIMETYPE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIMETYPE)[number];