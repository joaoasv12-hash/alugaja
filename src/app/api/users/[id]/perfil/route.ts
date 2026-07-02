import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { perfilSchema } from "@/lib/validations/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.id !== id) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const resultado = perfilSchema.safeParse(body);

  if (!resultado.success) {
    return NextResponse.json({ erro: "Dados inválidos.", detalhes: resultado.error.flatten() }, { status: 422 });
  }

  const { name, cpfCnpj, birthDate, bio, phone } = resultado.data;

  await db.$transaction([
    db.profile.upsert({
      where: { userId: id },
      create: { userId: id, name, cpfCnpj, bio, birthDate: birthDate ? new Date(birthDate) : null },
      update: { name, cpfCnpj, bio, birthDate: birthDate ? new Date(birthDate) : null },
    }),
    db.user.update({
      where: { id },
      data: { phone: phone ?? null },
    }),
  ]);

  return NextResponse.json({ mensagem: "Perfil atualizado." });
}
