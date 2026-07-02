import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const usuario = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      properties: {
        include: { photos: true, _count: { select: { favorites: true, conversations: true } } },
      },
      invoices: { include: { payments: true } },
      subscription: true,
      reviewsGiven: { include: { property: { select: { title: true } } } },
      reviewsReceived: { include: { property: { select: { title: true } } } },
      notifications: { where: { readAt: { not: null } }, orderBy: { createdAt: "desc" }, take: 100 },
    },
  });

  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });

  // Remove hash de senha e dados sensíveis internos antes de exportar
  const { ...dados } = usuario as Record<string, unknown>;
  delete dados.passwordHash;

  const json = JSON.stringify(dados, null, 2);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="alugaja-meus-dados-${Date.now()}.json"`,
    },
  });
}
