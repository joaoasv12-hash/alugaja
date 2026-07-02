import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

  const [
    receitaTotal,
    receitaMesAtual,
    receitaMesAnterior,
    porTipo,
    ultimasFaturas,
    totalAssinantes,
    assinantesAtivos,
  ] = await Promise.all([
    db.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: inicioMes } },
      _sum: { amount: true },
    }),
    db.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: inicioMesAnterior, lte: fimMesAnterior } },
      _sum: { amount: true },
    }),
    db.invoice.groupBy({
      by: ["type"],
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    db.invoice.findMany({
      where: { status: "PAID" },
      include: {
        user: { include: { profile: { select: { name: true } } } },
        payments: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { paidAt: "desc" },
      take: 15,
    }),
    db.subscription.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    receitaTotal: Number(receitaTotal._sum.amount ?? 0),
    receitaMesAtual: Number(receitaMesAtual._sum.amount ?? 0),
    receitaMesAnterior: Number(receitaMesAnterior._sum.amount ?? 0),
    porTipo: porTipo.map((t) => ({
      tipo: t.type,
      total: Number(t._sum.amount ?? 0),
      quantidade: t._count,
    })),
    ultimasFaturas,
    totalAssinantes,
    assinantesAtivos,
  });
}
