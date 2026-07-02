import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarMoeda(valor: number | string): string {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function gerarSlug(titulo: string, cidade: string, id: string): string {
  const base = `${titulo} ${cidade}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${base}-${id.slice(-4)}`;
}

export function calcularSuccessFee(aluguel: number): number {
  const taxa = aluguel * 0.5;
  const PISO = 150;
  const TETO = 1500;
  return Math.min(Math.max(taxa, PISO), TETO);
}

export function precoImpulsionamento(dias: 7 | 15 | 30): number {
  const tabela = { 7: 19.9, 15: 34.9, 30: 59.9 };
  return tabela[dias];
}
