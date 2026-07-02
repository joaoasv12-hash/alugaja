import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const userId = session.user.id;

  const conversas = await db.conversation.findMany({
    where: {
      OR: [{ tenantId: userId }, { landlordId: userId }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          photos: { orderBy: { order: "asc" }, take: 1 },
        },
      },
      tenant: { include: { profile: { select: { name: true, avatarUrl: true } } } },
      landlord: { include: { profile: { select: { name: true, avatarUrl: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: { where: { readAt: null, senderId: { not: userId } } } },
      },
    },
  });

  return NextResponse.json(conversas);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { propertyId } = await request.json();
  if (!propertyId) return NextResponse.json({ erro: "propertyId obrigatório" }, { status: 400 });

  const imovel = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, landlordId: true, status: true },
  });

  if (!imovel || imovel.status !== "ACTIVE") {
    return NextResponse.json({ erro: "Imóvel não encontrado ou inativo" }, { status: 404 });
  }

  if (imovel.landlordId === session.user.id) {
    return NextResponse.json({ erro: "Você não pode contatar o seu próprio imóvel" }, { status: 400 });
  }

  const conversa = await db.conversation.upsert({
    where: { propertyId_tenantId: { propertyId, tenantId: session.user.id } },
    create: {
      propertyId,
      tenantId: session.user.id,
      landlordId: imovel.landlordId,
    },
    update: {},
  });

  return NextResponse.json(conversa, { status: 201 });
}
