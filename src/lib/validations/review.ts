import { z } from "zod";

export const avaliacaoSchema = z.object({
  contractId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;
