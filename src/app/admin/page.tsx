import { Metadata } from "next";
import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Users, Building2, FileText, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Métricas" };

export default async function AdminPage() {
  const [totalUsuarios, totalImoveis, totalContratos, totalFaturas] = await Promise.all([
    db.user.count(),
    db.property.count({ where: { status: "ACTIVE" } }),
    db.contract.count({ where: { status: "ACTIVE" } }),
    db.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const receitaTotal = Number(totalFaturas._sum.amount ?? 0);

  const [usuariosNovos, imoveisEmRevisao, denunciasPendentes] = await Promise.all([
    db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    db.property.count({ where: { status: "UNDER_REVIEW" } }),
    db.report.count({ where: { status: "PENDING" } }),
  ]);

  const metricas = [
    { label: "Usuários ativos", valor: totalUsuarios, sub: `+${usuariosNovos} esta semana`, icone: Users, cor: "text-blue-400" },
    { label: "Imóveis ativos", valor: totalImoveis, sub: `${imoveisEmRevisao} aguardando revisão`, icone: Building2, cor: "text-emerald-400" },
    { label: "Contratos ativos", valor: totalContratos, sub: "Com assinatura digital", icone: FileText, cor: "text-purple-400" },
    { label: "Receita total", valor: `R$ ${receitaTotal.toFixed(2)}`, sub: "Faturamento acumulado", icone: TrendingUp, cor: "text-yellow-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Métricas gerais</h1>
        <p className="text-slate-400 mt-1">Visão geral da plataforma em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricas.map(({ label, valor, sub, icone: Icone, cor }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <Icone className={`h-7 w-7 mb-3 ${cor}`} />
            <p className="text-2xl font-bold text-white">{valor}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {(denunciasPendentes > 0 || imoveisEmRevisao > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Itens aguardando ação</h2>
          {imoveisEmRevisao > 0 && (
            <a href="/admin/anuncios" className="flex items-center justify-between bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 hover:bg-yellow-900/50 transition-colors">
              <div>
                <p className="font-medium text-yellow-200">{imoveisEmRevisao} anúncio(s) em revisão</p>
                <p className="text-sm text-yellow-400">Aprovar ou rejeitar anúncios pendentes</p>
              </div>
              <Building2 className="h-5 w-5 text-yellow-400" />
            </a>
          )}
          {denunciasPendentes > 0 && (
            <a href="/admin/denuncias" className="flex items-center justify-between bg-red-900/30 border border-red-700/50 rounded-xl p-4 hover:bg-red-900/50 transition-colors">
              <div>
                <p className="font-medium text-red-200">{denunciasPendentes} denúncia(s) pendente(s)</p>
                <p className="text-sm text-red-400">Revisar denúncias de usuários</p>
              </div>
              <FileText className="h-5 w-5 text-red-400" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
