import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { assinarContrato } from "@/lib/services/contract-service";
import { criarNotificacao } from "@/lib/services/notification-service";
import { SignerRole, NotificationType } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const contrato = await db.contract.findUnique({ where: { id } });
  if (!contrato) return NextResponse.json({ erro: "Contrato não encontrado" }, { status: 404 });

  const userId = session.user.id;
  let role: SignerRole;

  if (contrato.landlordId === userId) {
    role = SignerRole.LANDLORD;
  } else if (contrato.tenantId === userId) {
    role = SignerRole.TENANT;
  } else {
    return NextResponse.json({ erro: "Você não é parte deste contrato" }, { status: 403 });
  }

  // Obtém IP do requisitante
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-real-ip") ??
    "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    const assinatura = await assinarContrato({ contratoId: id, userId, role, ipAddress: ip, userAgent });

    // Notifica o outro participante
    const destinatarioId = role === SignerRole.LANDLORD ? contrato.tenantId : contrato.landlordId;
    criarNotificacao({
      userId: destinatarioId,
      type: NotificationType.CONTRACT_SIGNED,
      title: "Contrato assinado!",
      body: `${role === SignerRole.LANDLORD ? "O locador" : "O locatário"} assinou o contrato.`,
      data: { contractId: id },
    });

    return NextResponse.json(assinatura, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao assinar";
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
