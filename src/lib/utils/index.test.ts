import { describe, it, expect } from "vitest";
import { calcularSuccessFee, precoImpulsionamento, formatarMoeda, gerarSlug } from "./index";

describe("calcularSuccessFee", () => {
  it("retorna 50% do aluguel", () => {
    expect(calcularSuccessFee(500)).toBe(250);
  });

  it("respeita o piso de R$150", () => {
    expect(calcularSuccessFee(100)).toBe(150);
  });

  it("respeita o teto de R$1.500", () => {
    expect(calcularSuccessFee(5000)).toBe(1500);
  });

  it("calcula corretamente aluguel de R$2.000", () => {
    expect(calcularSuccessFee(2000)).toBe(1000);
  });

  it("aplica teto para aluguel acima de R$3.000", () => {
    expect(calcularSuccessFee(3000)).toBe(1500);
  });
});

describe("precoImpulsionamento", () => {
  it("retorna R$19,90 para 7 dias", () => {
    expect(precoImpulsionamento(7)).toBe(19.9);
  });

  it("retorna R$34,90 para 15 dias", () => {
    expect(precoImpulsionamento(15)).toBe(34.9);
  });

  it("retorna R$59,90 para 30 dias", () => {
    expect(precoImpulsionamento(30)).toBe(59.9);
  });
});

describe("formatarMoeda", () => {
  it("formata valores em BRL", () => {
    expect(formatarMoeda(1500)).toMatch(/1\.500/);
    expect(formatarMoeda(1500)).toMatch(/R\$/);
  });

  it("aceita string numérica", () => {
    expect(formatarMoeda("299.90")).toMatch(/299/);
  });

  it("formata zero", () => {
    expect(formatarMoeda(0)).toMatch(/0/);
  });
});

describe("gerarSlug", () => {
  it("converte para minúsculas e remove acentos", () => {
    const slug = gerarSlug("Apartamento Ótimo", "São Paulo", "cuid1234");
    expect(slug).not.toMatch(/[A-Z]/);
    expect(slug).not.toMatch(/[ÁáÉéÍíÓóÚúÃãÕõÂâÊêÔô]/);
  });

  it("substitui espaços por hífens", () => {
    const slug = gerarSlug("Casa Grande", "Rio", "abc12345");
    expect(slug).toMatch(/casa-grande/);
  });

  it("inclui os últimos 4 caracteres do id", () => {
    const slug = gerarSlug("Studio", "Curitiba", "abcdef1234");
    expect(slug).toMatch(/1234$/);
  });
});
