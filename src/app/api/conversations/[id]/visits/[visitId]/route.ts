import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmarVisitaSchema } from "@/lib/validations/conversation";
import { criarNotificacao } from "@/lib/services/notification-service";
import { NotificationType, VisitStatus } from "@/generated/prisma/enums";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; visitId: string }> }
) {
  const { id, visitId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const conversa = await db.conversation.findUnique({ where: { id } });
  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });

  const visita = await db.visitSchedule.findUnique({ where: { id: visitId } });
  if (!visita || visita.conversationId !== id) {
    return NextResponse.json({ erro: "Visita não encontrada" }, { status: 404 });
  }

  const userId = session.user.id;
  const isLocador = conversa.landlordId === userId;
  const isLocatario = conversa.tenantId === userId;

  if (!isLocador && !isLocatario) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const parse = confirmarVisitaSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.issues[0].message }, { status: 400 });
  }

  const { action, confirmedTime } = parse.data;

  if (action === "CONFIRM" && !isLocador) {
    return NextResponse.json({ erro: "Apenas o locador pode confirmar visitas" }, { status: 403 });
  }

  if (action === "CONFIRM" && !confirmedTime) {
    return NextResponse.json({ erro: "Horário confirmado obrigatório" }, { status: 400 });
  }

  const atualizado = await db.visitSchedule.update({
    where: { id: visitId },
    data: {
      status: action === "CONFIRM" ? VisitStatus.CONFIRMED : VisitStatus.CANCELLED,
      confirmedTime: action === "CONFIRM" && confirmedTime ? new Date(confirmedTime) : null,
    },
  });

  // Mensagem automática
  const horario = confirmedTime
    ? new Date(confirmedTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "";
  await db.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content:
        action === "CONFIRM"
          ? `✅ Visita confirmada para ${horario}.`
          : `❌ Visita cancelada.`,
    },
  });

  const destinatarioId = isLocador ? conversa.tenantId : conversa.landlordId;
  criarNotificacao({
    userId: destinatarioId,
    type: action === "CONFIRM" ? NotificationType.VISIT_CONFIRMED : NotificationType.VISIT_CANCELLED,
    title: action === "CONFIRM" ? "Visita confirmada!" : "Visita cancelada",
    body: action === "CONFIRM" ? `Visita confirmada para ${horario}.` : "Sua visita foi cancelada.",
    data: { conversationId: id, visitId },
  });

  return NextResponse.json(atualizado);
}
