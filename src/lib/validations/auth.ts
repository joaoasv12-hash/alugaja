import { z } from "zod";
import { validarCPFouCNPJ } from "@/lib/utils/cpf";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const cadastroSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string(),
    roles: z
      .array(z.enum(["TENANT", "LANDLORD"]))
      .min(1, "Selecione ao menos um papel"),
    aceitouTermos: z.boolean().refine((v) => v === true, {
      message: "Você deve aceitar os termos para continuar",
    }),
    aceitouLGPD: z.boolean().refine((v) => v === true, {
      message: "Você deve aceitar a política de privacidade",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const perfilSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  cpfCnpj: z
    .string()
    .optional()
    .refine((v) => !v || validarCPFouCNPJ(v), { message: "CPF ou CNPJ inválido" }),
  birthDate: z.string().optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  phone: z.string().optional(),
});

export const recuperarSenhaSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const novaSenhaSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type CadastroInput = z.infer<typeof cadastroSchema>;
export type PerfilInput = z.infer<typeof perfilSchema>;
