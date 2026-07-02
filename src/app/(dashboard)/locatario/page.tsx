import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, MessageSquare, FileText, Star, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "Painel do Locatário" };

export default async function LocatarioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.roles.includes("TENANT")) redirect("/");

  const [favoritos, propostas, contratos] = await Promise.all([
    db.favorite.count({ where: { userId: session.user.id } }),
    db.proposal.count({ where: { tenantId: session.user.id } }),
    db.contract.count({ where: { tenantId: session.user.id } }),
  ]);

  const metricas = [
    { label: "Favoritos", valor: favoritos, href: "/locatario/favoritos", icone: Heart, cor: "text-red-500" },
    { label: "Propostas enviadas", valor: propostas, href: "/locatario/propostas", icone: FileText, cor: "text-blue-500" },
    { label: "Contratos", valor: contratos, href: "/locatario/contratos", icone: FileText, cor: "text-emerald-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Olá, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Aqui está um resumo da sua atividade como locatário.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {metricas.map(({ label, valor, href, icone: Icone, cor }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardBody className="flex flex-col items-center text-center py-6">
                <Icone className={`h-8 w-8 mb-2 ${cor}`} />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Ações rápidas</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { href: "/imoveis", label: "Buscar imóveis", desc: "Explore imóveis disponíveis com filtros avançados", icone: Search },
          { href: "/mensagens", label: "Mensagens", desc: "Converse com locadores sobre os imóveis", icone: MessageSquare },
          { href: "/visitas", label: "Minhas visitas", desc: "Gerencie seus agendamentos de visita", icone: Calendar },
          { href: "/locatario/avaliacoes", label: "Avaliações", desc: "Veja e deixe avaliações após os contratos", icone: Star },
        ].map(({ href, label, desc, icone: Icone }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardBody className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                  <Icone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
