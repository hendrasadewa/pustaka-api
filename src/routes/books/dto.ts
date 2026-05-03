import { z } from "zod";

export const BookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().regex(/^\d{10}$|^\d{13}$/, "ISBN must be 10 or 13 digits").optional(),
  publisher: z.string().min(1).optional(),
  language: z.string().length(2).optional(),
  genre: z.string().min(1).optional(),
  description: z.string().optional(),
  coverUrl: z.url().optional(),
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
