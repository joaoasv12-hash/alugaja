import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, registrarAudit } from "@/lib/admin";
import { db } from "@/lib/db";
import { PropertyStatus } from "@/generated/prisma/enums";
import { criarNotificacao } from "@/lib/services/notification-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  const { id } = await params;
  const { acao, motivo } = await request.json();

  if (!["aprovar", "rejeitar"].includes(acao)) {
    return NextResponse.json({ erro: "Ação inválida. Use aprovar ou rejeitar." }, { status: 400 });
  }

  const imovel = await db.property.findUnique({
    where: { id },
    select: { id: true, title: true, landlordId: true, status: true },
  });
  if (!imovel) return NextResponse.json({ erro: "Imóvel não encontrado" }, { status: 404 });

  const novoStatus = acao === "aprovar" ? PropertyStatus.ACTIVE : PropertyStatus.DRAFT;

  await db.property.update({ where: { id }, data: { status: novoStatus } });

  await registrarAudit({
    adminId: session.user.id,
    action: acao === "aprovar" ? "PROPERTY_APPROVED" : "PROPERTY_REJECTED",
    targetType: "Property",
    targetId: id,
    details: { titulo: imovel.title, motivo },
  });

  await criarNotificacao({
    userId: imovel.landlordId,
    type: acao === "aprovar" ? "PROPERTY_APPROVED" : "PROPERTY_REJECTED",
    title: acao === "aprovar" ? "Imóvel aprovado!" : "Imóvel reprovado",
    body:
      acao === "aprovar"
        ? `Seu imóvel "${imovel.title}" foi aprovado e está visível na plataforma.`
        : `Seu imóvel "${imovel.title}" foi reprovado. ${motivo ? `Motivo: ${motivo}` : ""}`,
  });

  return NextResponse.json({ ok: true, status: novoStatus });
}
