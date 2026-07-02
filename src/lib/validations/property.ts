import { z } from "zod";

export const imovelSchema = z.object({
  title: z.string().min(10, "Título deve ter ao menos 10 caracteres").max(120),
  description: z.string().min(30, "Descrição deve ter ao menos 30 caracteres").max(3000),
  type: z.enum(["HOUSE", "APARTMENT", "STUDIO", "ROOM", "COMMERCIAL"]),
  rentPrice: z.coerce.number().positive("Valor do aluguel deve ser positivo"),
  condoFee: z.coerce.number().min(0).optional().nullable(),
  iptu: z.coerce.number().min(0).optional().nullable(),
  area: z.coerce.number().positive("Área deve ser positiva"),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(1, "Deve ter ao menos 1 banheiro").max(20),
  parkingSpots: z.coerce.number().int().min(0).max(20),
  isFurnished: z.boolean().default(false),
  acceptsPets: z.boolean().default(false),
  zipCode: z.string().min(8, "CEP inválido").max(9),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 letras"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  photos: z.array(z.string().url()).min(3, "Envie ao menos 3 fotos").max(20, "Máximo 20 fotos"),
});

export const buscaSchema = z.object({
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  tipo: z.enum(["HOUSE", "APARTMENT", "STUDIO", "ROOM", "COMMERCIAL"]).optional(),
  precoMin: z.coerce.number().optional(),
  precoMax: z.coerce.number().optional(),
  quartos: z.coerce.number().int().min(0).optional(),
  aceitaPets: z.coerce.boolean().optional(),
  mobiliado: z.coerce.boolean().optional(),
  ordenar: z.enum(["preco_asc", "preco_desc", "recente", "visualizacoes"]).default("recente"),
  pagina: z.coerce.number().int().min(1).default(1),
});

export type ImovelInput = z.infer<typeof imovelSchema>;
export type BuscaInput = z.infer<typeof buscaSchema>;
