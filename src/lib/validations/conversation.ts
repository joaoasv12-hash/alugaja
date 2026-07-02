import { z } from "zod";

export const mensagemSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const visitaSchema = z.object({
  proposedTimes: z
    .array(z.string().datetime())
    .min(1, "Proponha ao menos 1 horário")
    .max(3, "Máximo 3 horários"),
  notes: z.string().max(500).optional(),
});

export const confirmarVisitaSchema = z.object({
  action: z.enum(["CONFIRM", "CANCEL"]),
  confirmedTime: z.string().datetime().optional(),
});

export const propostaSchema = z.object({
  propertyId: z.string().cuid(),
  landlordId: z.string().cuid(),
  rentValue: z.coerce.number().positive("Valor deve ser positivo"),
  entryDate: z.string().datetime(),
  durationMonths: z.coerce.number().int().min(1).max(60),
  guarantee: z.enum(["DEPOSIT", "GUARANTOR", "INSURANCE"]),
  guaranteeDetails: z.record(z.string(), z.unknown()).optional(),
});

export const respostaPropostaSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "COUNTER"]),
  rentValue: z.coerce.number().positive().optional(),
  entryDate: z.string().datetime().optional(),
  durationMonths: z.coerce.number().int().min(1).optional(),
  message: z.string().max(1000).optional(),
});

export type MensagemInput = z.infer<typeof mensagemSchema>;
export type VisitaInput = z.infer<typeof visitaSchema>;
export type PropostaInput = z.infer<typeof propostaSchema>;
export type RespostaPropostaInput = z.infer<typeof respostaPropostaSchema>;
