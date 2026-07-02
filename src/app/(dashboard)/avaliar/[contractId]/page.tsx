import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AvaliarForm } from "@/components/reviews/avaliar-form";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

interface Props {
  params: Promise<{ contractId: string }>;
}

export default async function AvaliarPage({ params }: Props) {
  const { contractId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/entrar");

  const contrato = await db.contract.findUnique({
    where: { id: contractId },
    include: {
      landlord: { include: { profile: { select: { name: true } } } },
      tenant: { include: { profile: { select: { name: true } } } },
      property: { select: { title: true, slug: true } },
    },
  });

  if (!contrato) notFound();

  const isLandlord = contrato.landlordId === session.user.id;
  const isTenant = contrato.tenantId === session.user.id;

  if (!isLandlord && !isTenant) notFound();

  if (!["ACTIVE", "TERMINATED", "EXPIRED"].includes(contrato.status)) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <Alert tipo="aviso" titulo="Avaliação não disponível">
          Você só pode avaliar após o contrato estar ativo ou encerrado.
        </Alert>
      </div>
    );
  }

  const jaAvaliou = await db.review.findUnique({
    where: {
      contractId_reviewerId: { contractId, reviewerId: session.user.id },
    },
  });

  const nomeAvaliado = isLandlord
    ? (contrato.tenant.profile?.name ?? "Locatário")
    : (contrato.landlord.profile?.name ?? "Locador");

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <Link
        href="/contratos"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para contratos
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-3 py-1 text-xs font-medium mb-3">
          <Star className="h-3 w-3" />
          Avaliação
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Avaliar {isLandlord ? "locatário" : "locador"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Imóvel: <strong className="text-slate-700 dark:text-slate-300">{contrato.property.title}</strong>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        {jaAvaliou ? (
          <div className="space-y-4">
            <Alert tipo="sucesso" titulo="Você já avaliou este contrato">
              Sua avaliação foi enviada com {jaAvaliou.rating} estrela(s).
            </Alert>
            {jaAvaliou.comment && (
              <blockquote className="text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-emerald-400 pl-3">
                {jaAvaliou.comment}
              </blockquote>
            )}
          </div>
        ) : (
          <AvaliarForm contractId={contractId} nomeAvaliado={nomeAvaliado} />
        )}
      </div>
    </div>
  );
}
