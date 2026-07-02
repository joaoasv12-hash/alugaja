import crypto from "crypto";
import { db } from "@/lib/db";
import { ContractType, ContractStatus, SignerRole } from "@/generated/prisma/enums";

export function gerarHashDocumento(dados: {
  propertyId: string;
  tenantId: string;
  landlordId: string;
  rentValue: string | number;
  startDate: Date | string;
  durationMonths: number;
  guarantee: string;
  templateType: ContractType;
}): string {
  const payload = JSON.stringify({
    ...dados,
    startDate: new Date(dados.startDate).toISOString(),
    rentValue: String(dados.rentValue),
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function carregarDadosContrato(contratoId: string) {
  return db.contract.findUnique({
    where: { id: contratoId },
    include: {
      property: {
        include: { photos: { orderBy: { order: "asc" }, take: 1 } },
      },
      landlord: { include: { profile: true } },
      tenant: { include: { profile: true } },
      signatures: { orderBy: { signedAt: "asc" } },
      proposal: true,
    },
  });
}

export async function assinarContrato(params: {
  contratoId: string;
  userId: string;
  role: SignerRole;
  ipAddress: string;
  userAgent: string;
}) {
  const { contratoId, userId, role, ipAddress, userAgent } = params;

  const contrato = await db.contract.findUnique({
    where: { id: contratoId },
    include: { signatures: true },
  });
  if (!contrato) throw new Error("Contrato não encontrado");

  if (contrato.status !== ContractStatus.PENDING_SIGNATURES) {
    throw new Error("Contrato não está aguardando assinaturas");
  }

  // Valida que o usuário é o correto para o papel
  if (role === SignerRole.LANDLORD && contrato.landlordId !== userId) {
    throw new Error("Usuário não é o locador deste contrato");
  }
  if (role === SignerRole.TENANT && contrato.tenantId !== userId) {
    throw new Error("Usuário não é o locatário deste contrato");
  }

  // Verifica se já assinou
  const jaAssinou = contrato.signatures.some((s) => s.userId === userId);
  if (jaAssinou) throw new Error("Você já assinou este contrato");

  const assinatura = await db.signature.create({
    data: {
      contractId: contratoId,
      userId,
      role,
      ipAddress,
      userAgent,
      documentHash: contrato.documentHash ?? "",
    },
  });

  // Verifica se ambas as partes assinaram
  const totalAssinaturas = contrato.signatures.length + 1;
  if (totalAssinaturas >= 2) {
    await db.contract.update({
      where: { id: contratoId },
      data: { status: ContractStatus.ACTIVE },
    });
    // Marca o imóvel como alugado
    await db.property.update({
      where: { id: contrato.propertyId },
      data: { status: "RENTED" },
    });
  }

  return assinatura;
}

export function determinarTipoContrato(durationMonths: number, isCommercial = false): ContractType {
  if (isCommercial) return ContractType.COMMERCIAL;
  if (durationMonths < 2) return ContractType.SEASONAL;
  if (durationMonths < 30) return ContractType.RESIDENTIAL_SHORT;
  return ContractType.RESIDENTIAL_LONG;
}
