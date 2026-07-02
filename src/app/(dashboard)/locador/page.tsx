import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Eye, MessageSquare, FileText, TrendingUp } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel do Locador" };

export default async function LocadorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.roles.includes("LANDLORD")) redirect("/");

  const [imoveis, propostas, contratos, visualizacoes] = await Promise.all([
    db.property.findMany({
      where: { landlordId: session.user.id },
      select: { id: true, title: true, status: true, rentPrice: true, viewCount: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.proposal.count({ where: { landlordId: session.user.id, status: "PENDING" } }),
    db.contract.count({ where: { landlordId: session.user.id, status: "ACTIVE" } }),
    db.property.aggregate({
      where: { landlordId: session.user.id },
      _sum: { viewCount: true },
    }),
  ]);

  const totalVisualizacoes = visualizacoes._sum.viewCount ?? 0;

  const STATUS_CORES: Record<string, string> = {
    ACTIVE: "verde",
    PAUSED: "amarelo",
    DRAFT: "cinza",
    UNDER_REVIEW: "azul",
    RENTED: "roxo",
    EXPIRED: "vermelho",
  };

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Ativo",
    PAUSED: "Pausado",
    DRAFT: "Rascunho",
    UNDER_REVIEW: "Em análise",
    RENTED: "Alugado",
    EXPIRED: "Expirado",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Painel do Locador
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie seus imóveis, propostas e contratos.
          </p>
        </div>
        <Link href="/locador/imoveis/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo anúncio
          </Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Imóveis ativos", valor: imoveis.filter((i) => i.status === "ACTIVE").length, icone: Building2, cor: "text-emerald-500" },
          { label: "Propostas pendentes", valor: propostas, icone: FileText, cor: "text-yellow-500" },
          { label: "Contratos ativos", valor: contratos, icone: FileText, cor: "text-blue-500" },
          { label: "Visualizações totais", valor: totalVisualizacoes, icone: Eye, cor: "text-purple-500" },
        ].map(({ label, valor, icone: Icone, cor }) => (
          <Card key={label}>
            <CardBody className="flex flex-col items-center text-center py-5">
              <Icone className={`h-7 w-7 mb-2 ${cor}`} />
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Lista de imóveis */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Meus imóveis
          </h2>
          <Link href="/locador/imoveis" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
            Ver todos
          </Link>
        </div>

        {imoveis.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Você ainda não tem anúncios.</p>
              <Link href="/locador/imoveis/novo" className="mt-4 inline-block">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeiro anúncio
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {imoveis.map((imovel) => (
              <Card key={imovel.id}>
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {imovel.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatarMoeda(Number(imovel.rentPrice))}/mês
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {imovel.viewCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_CORES[imovel.status] === "verde" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" :
                      STATUS_CORES[imovel.status] === "amarelo" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {STATUS_LABELS[imovel.status]}
                    </span>
                    <Link href={`/locador/imoveis/${imovel.id}`}>
                      <Button variante="ghost" tamanho="sm">Gerenciar</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Links rápidos */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/mensagens", label: "Mensagens", desc: "Responda locatários interessados", icone: MessageSquare },
          { href: "/locador/financeiro", label: "Financeiro", desc: "Faturas, taxas e recibos", icone: TrendingUp },
          { href: "/locador/impulsionar", label: "Impulsionar anúncio", desc: "Apareça no topo das buscas", icone: TrendingUp },
        ].map(({ href, label, desc, icone: Icone }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardBody className="flex gap-3 items-start">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                  <Icone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
