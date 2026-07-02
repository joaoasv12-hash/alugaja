import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const apenasNaoLidas = searchParams.get("naoLidas") === "true";

  const notificacoes = await db.notification.findMany({
    where: {
      userId: session.user.id,
      ...(apenasNaoLidas && { readAt: null }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalNaoLidas = await db.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return NextResponse.json({ notificacoes, totalNaoLidas });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { ids } = await request.json();
  const agora = new Date();

  if (ids === "all") {
    await db.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: agora },
    });
  } else if (Array.isArray(ids)) {
    await db.notification.updateMany({
      where: { userId: session.user.id, id: { in: ids } },
      data: { readAt: agora },
    });
  }

  return NextResponse.json({ ok: true });
}
