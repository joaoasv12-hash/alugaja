import { describe, it, expect } from "vitest";
import { gerarHashDocumento } from "./contract-service";

describe("gerarHashDocumento", () => {
  const dadosBase = {
    propertyId: "imovel-xyz",
    landlordId: "locador-1",
    tenantId: "locatario-1",
    rentValue: 2500,
    startDate: new Date("2025-01-01"),
    durationMonths: 12,
    guarantee: "DEPOSIT",
    templateType: "RESIDENTIAL_LONG" as const,
  };

  it("retorna uma string hex de 64 caracteres (SHA-256)", () => {
    const hash = gerarHashDocumento(dadosBase);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("é determinístico para os mesmos dados", () => {
    const h1 = gerarHashDocumento(dadosBase);
    const h2 = gerarHashDocumento(dadosBase);
    expect(h1).toBe(h2);
  });

  it("produz hashes diferentes para dados diferentes", () => {
    const h1 = gerarHashDocumento(dadosBase);
    const h2 = gerarHashDocumento({ ...dadosBase, rentValue: 3000 });
    expect(h1).not.toBe(h2);
  });

  it("é sensível a qualquer campo", () => {
    const h1 = gerarHashDocumento(dadosBase);
    const h2 = gerarHashDocumento({ ...dadosBase, tenantId: "locatario-2" });
    expect(h1).not.toBe(h2);
  });
});
