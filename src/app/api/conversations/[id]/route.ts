import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const conversa = await db.conversation.findUnique({
    where: { id },
    include: {
      property: {
        include: { photos: { orderBy: { order: "asc" }, take: 1 } },
      },
      tenant: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
      landlord: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { include: { profile: { select: { name: true, avatarUrl: true } } } } },
      },
      visits: {
        orderBy: { createdAt: "desc" },
        include: { tenant: { include: { profile: { select: { name: true } } } } },
      },
    },
  });

  if (!conversa) return NextResponse.json({ erro: "Conversa não encontrada" }, { status: 404 });

  const userId = session.user.id;
  if (conversa.tenantId !== userId && conversa.landlordId !== userId) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  // Busca propostas desta negociação
  const propostas = await db.proposal.findMany({
    where: { propertyId: conversa.propertyId, tenantId: conversa.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      counterOffers: {
        orderBy: { createdAt: "asc" },
        include: { fromUser: { include: { profile: { select: { name: true } } } } },
      },
    },
  });

  // Marca mensagens como lidas
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ...conversa, propostas });
}
