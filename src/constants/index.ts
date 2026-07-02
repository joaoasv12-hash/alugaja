export const TIPOS_IMOVEL = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  STUDIO: "Kitnet/Studio",
  ROOM: "Quarto",
  COMMERCIAL: "Comercial",
} as const;

export const STATUS_IMOVEL = {
  DRAFT: "Rascunho",
  UNDER_REVIEW: "Em análise",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  RENTED: "Alugado",
  EXPIRED: "Expirado",
} as const;

export const GARANTIAS = {
  DEPOSIT: "Caução (até 3 meses)",
  GUARANTOR: "Fiador",
  INSURANCE: "Seguro-fiança",
} as const;

export const INDICES_REAJUSTE = {
  IGPM: "IGP-M",
  IPCA: "IPCA",
  OTHER: "Outro acordado",
} as const;

export const TIPOS_CONTRATO = {
  RESIDENTIAL_LONG: "Residencial padrão (30+ meses)",
  RESIDENTIAL_SHORT: "Residencial curto prazo (< 30 meses)",
  SEASONAL: "Temporada (até 90 dias)",
  ROOM_SHARING: "Quarto compartilhado",
  COMMERCIAL: "Comercial/não residencial",
  RENEWAL_ADDENDUM: "Aditivo de renovação/reajuste",
} as const;

export const PLANOS_IMPULSIONAMENTO = [
  { dias: 7, preco: 19.9, label: "7 dias — R$ 19,90" },
  { dias: 15, preco: 34.9, label: "15 dias — R$ 34,90" },
  { dias: 30, preco: 59.9, label: "30 dias — R$ 59,90" },
] as const;

export const PRECO_PRO = 49.9;
export const SUCCESS_FEE_PERCENTUAL = 0.5;
export const SUCCESS_FEE_PISO = 150;
export const SUCCESS_FEE_TETO = 1500;

export const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const PAPEIS_LABELS = {
  TENANT: "Locatário",
  LANDLORD: "Locador",
  SUPER_ADMIN: "Administrador",
} as const;
