import { db } from "@/lib/db";
import { formatarMoeda } from "@/lib/utils";
import { Users, Home, Flag, DollarSign, TrendingUp, FileText } from "lucide-react";

async function buscarMetricas() {
  const [
    totalUsuarios,
    usuariosAtivos,
    totalImoveis,
    imoveisEmRevisao,
    totalDenuncias,
    denunciasPendentes,
    receitaTotal,
    receitaMes,
    contratosAtivos,
    novosCadastros,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.property.count(),
    db.property.count({ where: { status: "UNDER_REVIEW" } }),
    db.report.count(),
    db.report.count({ where: { status: "PENDING" } }),
    db.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.invoice.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
    db.contract.count({ where: { status: "ACTIVE" } }),
    db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    totalUsuarios,
    usuariosAtivos,
    totalImoveis,
    imoveisEmRevisao,
    totalDenuncias,
    denunciasPendentes,
    receitaTotal: Number(receitaTotal._sum.amount ?? 0),
    receitaMes: Number(receitaMes._sum.amount ?? 0),
    contratosAtivos,
    novosCadastros,
  };
}

const CARDS = (m: Awaited<ReturnType<typeof buscarMetricas>>) => [
  {
    titulo: "Usuários cadastrados",
    valor: m.totalUsuarios.toLocaleString("pt-BR"),
    sub: `${m.usuariosAtivos} ativos · ${m.novosCadastros} novos esta semana`,
    Icone: Users,
    cor: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    titulo: "Imóveis",
    valor: m.totalImoveis.toLocaleString("pt-BR"),
    sub: m.imoveisEmRevisao > 0 ? `${m.imoveisEmRevisao} aguardando revisão` : "Nenhum pendente",
    Icone: Home,
    cor: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    alerta: m.imoveisEmRevisao > 0,
  },
  {
    titulo: "Denúncias",
    valor: m.totalDenuncias.toLocaleString("pt-BR"),
    sub: m.denunciasPendentes > 0 ? `${m.denunciasPendentes} pendentes` : "Nenhuma pendente",
    Icone: Flag,
    cor: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    alerta: m.denunciasPendentes > 0,
  },
  {
    titulo: "Receita total",
    valor: formatarMoeda(m.receitaTotal),
    sub: `${formatarMoeda(m.receitaMes)} este mês`,
    Icone: DollarSign,
    cor: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    titulo: "Contratos ativos",
    valor: m.contratosAtivos.toLocaleString("pt-BR"),
    sub: "Imóveis com locação vigente",
    Icone: FileText,
    cor: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
];

export default async function AdminPage() {
  const metricas = await buscarMetricas();
  const cards = CARDS(metricas);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Visão geral</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Métricas consolidadas da plataforma.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ titulo, valor, sub, Icone, cor, bg, alerta }) => (
          <div
            key={titulo}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icone className={`h-5 w-5 ${cor}`} />
              </div>
              {alerta && (
                <span className="h-2 w-2 rounded-full bg-red-500 mt-1" />
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{titulo}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Ações rápidas para pendências */}
      {(metricas.imoveisEmRevisao > 0 || metricas.denunciasPendentes > 0) && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Requer atenção</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-400">
            {metricas.imoveisEmRevisao > 0 && (
              <li>
                <a href="/admin/imoveis" className="underline underline-offset-2">
                  {metricas.imoveisEmRevisao} imóvel(is) aguardando moderação
                </a>
              </li>
            )}
            {metricas.denunciasPendentes > 0 && (
              <li>
                <a href="/admin/denuncias" className="underline underline-offset-2">
                  {metricas.denunciasPendentes} denúncia(s) pendente(s)
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
