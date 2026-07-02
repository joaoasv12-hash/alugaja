import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { criarPagamentoPix, criarPreferenceCartao } from "@/lib/services/payment-service";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { faturaId, metodo } = await request.json();
  if (!faturaId || !metodo) {
    return NextResponse.json({ erro: "faturaId e metodo são obrigatórios" }, { status: 400 });
  }

  const fatura = await db.invoice.findUnique({
    where: { id: faturaId },
    include: { user: { include: { profile: true } } },
  });

  if (!fatura) return NextResponse.json({ erro: "Fatura não encontrada" }, { status: 404 });
  if (fatura.userId !== session.user.id) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }
  if (fatura.status === "PAID") {
    return NextResponse.json({ erro: "Fatura já paga" }, { status: 409 });
  }
  if (fatura.status === "CANCELLED") {
    return NextResponse.json({ erro: "Fatura cancelada" }, { status: 409 });
  }

  const pagador = {
    nome: fatura.user.profile?.name ?? fatura.user.email ?? "Pagador",
    email: fatura.user.email ?? "",
    cpf: fatura.user.profile?.cpfCnpj ?? null,
  };

  const faturaPayload = { id: fatura.id, amount: Number(fatura.amount), description: fatura.description };

  if (metodo === "PIX") {
    const resultado = await criarPagamentoPix({ fatura: faturaPayload, pagador });
    return NextResponse.json(resultado);
  }

  if (metodo === "CARTAO") {
    const resultado = await criarPreferenceCartao({
      fatura: faturaPayload,
      pagador,
      tipoRetorno: fatura.type === "SUBSCRIPTION" ? "pro" : "fatura",
    });
    return NextResponse.json(resultado);
  }

  return NextResponse.json({ erro: "Método inválido. Use PIX ou CARTAO." }, { status: 400 });
}
