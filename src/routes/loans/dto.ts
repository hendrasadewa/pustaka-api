import { z } from "zod";

export const LoanCreateSchema = z.object({
  bookId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export type LoanCreatePayload = z.infer<typeof LoanCreateSchema>;
