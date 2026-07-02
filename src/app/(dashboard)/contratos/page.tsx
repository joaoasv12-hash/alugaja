import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_CONTRATO } from "@/constants";
import { FileText, Building2, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Contratos — AlugaJá" };

const STATUS_INFO: Record<string, { cor: "azul" | "amarelo" | "verde" | "cinza" | "vermelho"; label: string }> = {
  DRAFT: { cor: "cinza", label: "Rascunho" },
  PENDING_SIGNATURES: { cor: "amarelo", label: "Aguardando assinaturas" },
  ACTIVE: { cor: "verde", label: "Ativo" },
  TERMINATED: { cor: "vermelho", label: "Rescindido" },
  EXPIRED: { cor: "cinza", label: "Expirado" },
};

export default async function ContratosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;

  const contratos = await db.contract.findMany({
    where: { OR: [{ landlordId: userId }, { tenantId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, slug: true, photos: { orderBy: { order: "asc" }, take: 1 } } },
      landlord: { include: { profile: { select: { name: true } } } },
      tenant: { include: { profile: { select: { name: true } } } },
      signatures: { select: { role: true, signedAt: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        Contratos
      </h1>

      {contratos.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum contrato ainda
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Os contratos aparecerão aqui quando uma proposta for aceita.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contratos.map((c) => {
            const isLocador = c.landlordId === userId;
            const outroUsuario = isLocador ? c.tenant : c.landlord;
            const statusInfo = STATUS_INFO[c.status] ?? STATUS_INFO.DRAFT;
            const locadorAssinou = c.signatures.some((s) => s.role === "LANDLORD");
            const locatarioAssinou = c.signatures.some((s) => s.role === "TENANT");
            const minhaAssinatura = isLocador ? locadorAssinou : locatarioAssinou;

            return (
              <Link key={c.id} href={`/contratos/${c.id}`}>
                <Card className="hover:border-emerald-400 hover:shadow-sm transition-all">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge cor={statusInfo.cor}>{statusInfo.label}</Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {TIPOS_CONTRATO[c.templateType as keyof typeof TIPOS_CONTRATO]}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {c.property.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {isLocador ? "Locatário" : "Locador"}: {outroUsuario.profile?.name ?? "Usuário"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatarMoeda(Number(c.rentValue))}<span className="text-xs font-normal text-slate-500">/mês</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {c.durationMonths} meses · {new Date(c.startDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {c.status === "PENDING_SIGNATURES" && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${locadorAssinou ? "text-emerald-500" : "text-slate-300"}`} />
                          <span className={locadorAssinou ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                            Locador {locadorAssinou ? "assinou" : "pendente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${locatarioAssinou ? "text-emerald-500" : "text-slate-300"}`} />
                          <span className={locatarioAssinou ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                            Locatário {locatarioAssinou ? "assinou" : "pendente"}
                          </span>
                        </div>
                        {!minhaAssinatura && (
                          <span className="ml-auto text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                            Sua assinatura pendente
                          </span>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
