import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Faça login para favoritar." }, { status: 401 });

  const { id: propertyId } = await params;

  const existente = await db.favorite.findUnique({
    where: { userId_propertyId: { userId: session.user.id, propertyId } },
  });

  if (existente) {
    await db.favorite.delete({ where: { id: existente.id } });
    // Decrementa contador
    await db.property.update({ where: { id: propertyId }, data: { favoriteCount: { decrement: 1 } } }).catch(() => {});
    return NextResponse.json({ favoritado: false });
  }

  await db.favorite.create({ data: { userId: session.user.id, propertyId } });
  await db.property.update({ where: { id: propertyId }, data: { favoriteCount: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ favoritado: true });
}
