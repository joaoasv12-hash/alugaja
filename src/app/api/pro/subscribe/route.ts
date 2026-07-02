import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { criarPreferenceCartao } from "@/lib/services/payment-service";

const PRECO_PRO = 49.9;

export async function POST(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  // Verifica se já tem assinatura ativa
  const assinaturaAtiva = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (assinaturaAtiva && assinaturaAtiva.status === "ACTIVE") {
    return NextResponse.json({ erro: "Você já tem uma assinatura Pro ativa" }, { status: 409 });
  }

  const usuario = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });

  const proxFaturamento = new Date();
  proxFaturamento.setMonth(proxFaturamento.getMonth() + 1);

  const [fatura, assinatura] = await db.$transaction([
    db.invoice.create({
      data: {
        userId: session.user.id,
        type: "SUBSCRIPTION",
        amount: PRECO_PRO,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        description: "AlugaJá Pro — Assinatura mensal",
      },
    }),
    db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        status: "ACTIVE",
        startDate: new Date(),
        nextBilling: proxFaturamento,
      },
      update: { status: "ACTIVE", nextBilling: proxFaturamento },
    }),
  ]);

  // Vincula fatura à assinatura
  await db.invoice.update({
    where: { id: fatura.id },
    data: { subscriptionId: assinatura.id },
  });

  const { checkoutUrl } = await criarPreferenceCartao({
    fatura: { id: fatura.id, amount: PRECO_PRO, description: "AlugaJá Pro — Assinatura mensal" },
    pagador: {
      nome: usuario.profile?.name ?? usuario.email ?? "Assinante",
      email: usuario.email ?? "",
    },
    tipoRetorno: "pro",
  });

  return NextResponse.json({ checkoutUrl, faturaId: fatura.id }, { status: 201 });
}

export async function DELETE(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const assinatura = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!assinatura || assinatura.status !== "ACTIVE") {
    return NextResponse.json({ erro: "Nenhuma assinatura ativa" }, { status: 404 });
  }

  await db.subscription.update({
    where: { userId: session.user.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ cancelado: true });
}
