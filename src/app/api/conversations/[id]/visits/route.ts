import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { visitaSchema } from "@/lib/validations/conversation";
import { criarNotificacao } from "@/lib/services/notification-service";
import { NotificationType } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const conversa = await db.conversation.findUnique({ where: { id } });
  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });

  if (conversa.tenantId !== session.user.id) {
    return NextResponse.json({ erro: "Apenas o locatário pode solicitar visitas" }, { status: 403 });
  }

  const body = await request.json();
  const parse = visitaSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.issues[0].message }, { status: 400 });
  }

  const visita = await db.visitSchedule.create({
    data: {
      conversationId: id,
      tenantId: session.user.id,
      propertyId: conversa.propertyId,
      proposedTimes: parse.data.proposedTimes.map((t) => new Date(t)),
      notes: parse.data.notes,
    },
  });

  // Mensagem automática no chat
  await db.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id,
      content: `📅 Visita solicitada para ${parse.data.proposedTimes.length === 1 ? "o horário" : "um dos horários"} propostos.`,
    },
  });

  criarNotificacao({
    userId: conversa.landlordId,
    type: NotificationType.VISIT_CONFIRMED,
    title: "Visita solicitada",
    body: "Um locatário quer visitar seu imóvel.",
    data: { conversationId: id, visitId: visita.id },
  });

  return NextResponse.json(visita, { status: 201 });
}
