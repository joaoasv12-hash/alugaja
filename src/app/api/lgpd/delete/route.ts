import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { signOut } from "next-auth/react";

export async function DELETE(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const userId = session.user.id;

  // Verifica se há contratos ativos — não pode deletar com contrato vigente
  const contratoAtivo = await db.contract.findFirst({
    where: {
      OR: [{ landlordId: userId }, { tenantId: userId }],
      status: "ACTIVE",
    },
  });
  if (contratoAtivo) {
    return NextResponse.json(
      { erro: "Não é possível excluir sua conta com um contrato ativo. Aguarde o término do contrato." },
      { status: 409 }
    );
  }

  // Anonimiza: mantém registros financeiros mas remove dados pessoais
  const anonEmail = `deleted_${userId}@anonimizado.alugaja`;

  await db.$transaction([
    // Remove perfil
    db.profile.deleteMany({ where: { userId } }),
    // Remove documentos
    db.document.deleteMany({ where: { userId } }),
    // Remove notificações
    db.notification.deleteMany({ where: { userId } }),
    // Anonimiza o usuário
    db.user.update({
      where: { id: userId },
      data: {
        email: anonEmail,
        passwordHash: null,
        phone: null,
        status: "BANNED",
      },
    }),
    // Remove sessões e contas OAuth
    db.session.deleteMany({ where: { userId } }),
    db.account.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
