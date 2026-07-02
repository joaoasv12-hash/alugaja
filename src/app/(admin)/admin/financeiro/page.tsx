import { db } from "@/lib/db";
import { formatarMoeda, formatarData } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard } from "lucide-react";

const tipoLabel: Record<string, string> = {
  SUCCESS_FEE: "Taxa de sucesso",
  SPONSORSHIP: "Impulsionamento",
  SUBSCRIPTION: "AlugaJá Pro",
};

const metodoCor: Record<string, string> = {
  PIX: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  CREDIT_CARD: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  BOLETO: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

async function buscarFinanceiro() {
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
    db.invoice.aggregate({ where: { status: "PAID", paidAt: { gte: inicioMes } }, _sum: { amount: true } }),
    db.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: inicioMesAnterior, lte: fimMesAnterior } },
      _sum: { amount: true },
    }),
    db.invoice.groupBy({ by: ["type"], where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    db.invoice.findMany({
      where: { status: "PAID" },
      include: {
        user: { include: { profile: { select: { name: true } } } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { paidAt: "desc" },
      take: 15,
    }),
    db.subscription.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return {
    receitaTotal: Number(receitaTotal._sum.amount ?? 0),
    receitaMesAtual: Number(receitaMesAtual._sum.amount ?? 0),
    receitaMesAnterior: Number(receitaMesAnterior._sum.amount ?? 0),
    porTipo: porTipo.map((t) => ({ tipo: t.type, total: Number(t._sum.amount ?? 0), quantidade: t._count })),
    ultimasFaturas,
    totalAssinantes,
    assinantesAtivos,
  };
}

export default async function AdminFinanceiroPage() {
  const dados = await buscarFinanceiro();
  const crescimento =
    dados.receitaMesAnterior > 0
      ? ((dados.receitaMesAtual - dados.receitaMesAnterior) / dados.receitaMesAnterior) * 100
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Relatório financeiro</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Receita consolidada de faturas pagas.</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Receita total</p>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatarMoeda(dados.receitaTotal)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Este mês</p>
            {crescimento !== null ? (
              crescimento >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )
            ) : null}
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatarMoeda(dados.receitaMesAtual)}</p>
          {crescimento !== null && (
            <p className={`text-xs mt-1 ${crescimento >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {crescimento >= 0 ? "+" : ""}{crescimento.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Assinantes Pro</p>
            <Users className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dados.assinantesAtivos}</p>
          <p className="text-xs text-slate-500 mt-1">{dados.totalAssinantes} total · MRR {formatarMoeda(dados.assinantesAtivos * 49.9)}</p>
        </div>
      </div>

      {/* Por tipo */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Receita por categoria</h2>
        <div className="space-y-3">
          {dados.porTipo.map(({ tipo, total, quantidade }) => (
            <div key={tipo} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{tipoLabel[tipo]}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatarMoeda(total)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(total / Math.max(dados.receitaTotal, 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{quantidade} transação(ões)</p>
              </div>
            </div>
          ))}
          {dados.porTipo.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Nenhuma receita ainda.</p>
          )}
        </div>
      </div>

      {/* Últimas faturas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Últimos pagamentos</h2>
        <div className="space-y-2">
          {dados.ultimasFaturas.map((f) => {
            const metodo = f.payments[0]?.method;
            return (
              <div key={f.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {f.user.profile?.name ?? f.user.email}
                  </p>
                  <p className="text-xs text-slate-500">{tipoLabel[f.type]} · {f.paidAt ? formatarData(f.paidAt) : "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {metodo && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${metodoCor[metodo] ?? ""}`}>
                      {metodo === "CREDIT_CARD" ? "CARTÃO" : metodo}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {formatarMoeda(Number(f.amount))}
                  </span>
                </div>
              </div>
            );
          })}
          {dados.ultimasFaturas.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum pagamento ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
