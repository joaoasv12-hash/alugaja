import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "DRAFT"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const imovel = await db.property.findUnique({ where: { id } });
  if (!imovel) return NextResponse.json({ erro: "Não encontrado." }, { status: 404 });
  if (imovel.landlordId !== session.user.id && !session.user.roles.includes("SUPER_ADMIN")) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json();
  const { status } = schema.parse(body);

  await db.property.update({ where: { id }, data: { status } });
  return NextResponse.json({ mensagem: "Status atualizado." });
}
