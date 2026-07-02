import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carregarDadosContrato } from "@/lib/services/contract-service";
import { db } from "@/lib/db";
import { ContractStatus, ContractType } from "@/generated/prisma/enums";
import { gerarHashDocumento } from "@/lib/services/contract-service";
import { Role } from "@/generated/prisma/enums";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const contrato = await carregarDadosContrato(id);
  if (!contrato) return NextResponse.json({ erro: "Contrato não encontrado" }, { status: 404 });

  const userId = session.user.id;
  const isAdmin = session.user.roles.includes(Role.SUPER_ADMIN);
  if (contrato.landlordId !== userId && contrato.tenantId !== userId && !isAdmin) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  return NextResponse.json(contrato);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const contrato = await db.contract.findUnique({ where: { id } });
  if (!contrato) return NextResponse.json({ erro: "Contrato não encontrado" }, { status: 404 });

  if (contrato.landlordId !== session.user.id) {
    return NextResponse.json({ erro: "Apenas o locador pode editar o contrato" }, { status: 403 });
  }

  if (contrato.status !== ContractStatus.DRAFT) {
    return NextResponse.json({ erro: "Contrato já publicado" }, { status: 409 });
  }

  const body = await request.json();

  // Permite locador ajustar: templateType, adjustmentIndex e publicar (PENDING_SIGNATURES)
  const updates: Record<string, unknown> = {};
  if (body.templateType && Object.values(ContractType).includes(body.templateType)) {
    updates.templateType = body.templateType;
  }
  if (body.adjustmentIndex) updates.adjustmentIndex = body.adjustmentIndex;

  if (body.publish) {
    // Gera hash antes de publicar
    const hash = gerarHashDocumento({
      propertyId: contrato.propertyId,
      tenantId: contrato.tenantId,
      landlordId: contrato.landlordId,
      rentValue: String(contrato.rentValue),
      startDate: contrato.startDate,
      durationMonths: contrato.durationMonths,
      guarantee: contrato.guarantee,
      templateType: (updates.templateType as ContractType) ?? contrato.templateType,
    });
    updates.documentHash = hash;
    updates.status = ContractStatus.PENDING_SIGNATURES;
  }

  const atualizado = await db.contract.update({ where: { id }, data: updates });
  return NextResponse.json(atualizado);
}
