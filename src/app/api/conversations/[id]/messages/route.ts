import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { mensagemSchema } from "@/lib/validations/conversation";
import { criarNotificacao } from "@/lib/services/notification-service";
import { NotificationType } from "@/generated/prisma/enums";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const conversa = await db.conversation.findUnique({ where: { id } });
  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });

  const userId = session.user.id;
  if (conversa.tenantId !== userId && conversa.landlordId !== userId) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  const since = request.nextUrl.searchParams.get("since");

  const mensagens = await db.message.findMany({
    where: {
      conversationId: id,
      ...(since && { createdAt: { gt: new Date(since) } }),
    },
    orderBy: { createdAt: "asc" },
    include: { sender: { include: { profile: { select: { name: true, avatarUrl: true } } } } },
  });

  // Marca como lidas
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(mensagens);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const conversa = await db.conversation.findUnique({ where: { id } });
  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });

  const userId = session.user.id;
  if (conversa.tenantId !== userId && conversa.landlordId !== userId) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const parse = mensagemSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.issues[0].message }, { status: 400 });
  }

  const [mensagem] = await Promise.all([
    db.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: parse.data.content,
      },
      include: { sender: { include: { profile: { select: { name: true, avatarUrl: true } } } } },
    }),
    db.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  // Notifica o outro participante
  const destinatarioId = userId === conversa.tenantId ? conversa.landlordId : conversa.tenantId;
  criarNotificacao({
    userId: destinatarioId,
    type: NotificationType.NEW_MESSAGE,
    title: "Nova mensagem",
    body: parse.data.content.slice(0, 100),
    data: { conversationId: id },
  });

  return NextResponse.json(mensagem, { status: 201 });
}
