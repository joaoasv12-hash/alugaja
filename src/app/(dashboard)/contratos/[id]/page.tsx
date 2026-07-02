import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { carregarDadosContrato } from "@/lib/services/contract-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AssinarModal } from "@/components/contract/assinar-modal";
import { PublicarContrato } from "@/components/contract/publicar-contrato";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_CONTRATO, GARANTIAS } from "@/constants";
import { Role } from "@/generated/prisma/enums";
import {
  FileText, Download, CheckCircle2, Clock, ArrowLeft,
  Building2, User, Shield, AlertTriangle,
} from "lucide-react";
import { ContratoPreviewer } from "@/components/contract/contrato-previewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_INFO: Record<string, { cor: "azul" | "amarelo" | "verde" | "cinza" | "vermelho"; label: string }> = {
  DRAFT: { cor: "cinza", label: "Rascunho" },
  PENDING_SIGNATURES: { cor: "amarelo", label: "Aguardando assinaturas" },
  ACTIVE: { cor: "verde", label: "Ativo" },
  TERMINATED: { cor: "vermelho", label: "Rescindido" },
  EXPIRED: { cor: "cinza", label: "Expirado" },
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const c = await carregarDadosContrato(id);
  return { title: c ? `Contrato — ${c.property.title}` : "Contrato" };
}

export default async function ContratoPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const contrato = await carregarDadosContrato(id);
  if (!contrato) notFound();

  const userId = session.user.id;
  const isAdmin = session.user.roles.includes(Role.SUPER_ADMIN);
  if (contrato.landlordId !== userId && contrato.tenantId !== userId && !isAdmin) notFound();

  const isLocador = contrato.landlordId === userId;
  const locadorAssinou = contrato.signatures.some((s) => s.role === "LANDLORD");
  const locatarioAssinou = contrato.signatures.some((s) => s.role === "TENANT");
  const euAssinei = contrato.signatures.some((s) => s.userId === userId);
  const statusInfo = STATUS_INFO[contrato.status] ?? STATUS_INFO.DRAFT;
  const podeAssinar = contrato.status === "PENDING_SIGNATURES" && !euAssinei;
  const podePDF = contrato.status === "PENDING_SIGNATURES" || contrato.status === "ACTIVE";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/contratos" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {TIPOS_CONTRATO[contrato.templateType as keyof typeof TIPOS_CONTRATO] ?? contrato.templateType}
            </h1>
            <Badge cor={statusInfo.cor}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{contrato.property.title}</p>
        </div>
        {podePDF && (
          <Link href={`/api/contracts/${id}/pdf`} target="_blank">
            <Button variante="outline" tamanho="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna principal — preview */}
        <div className="lg:col-span-2 space-y-5">
          {/* Alertas de ação */}
          {podeAssinar && (
            <Alert tipo="aviso" titulo="Sua assinatura é necessária">
              Leia o contrato abaixo e assine para concluir a negociação.
            </Alert>
          )}
          {euAssinei && contrato.status === "PENDING_SIGNATURES" && (
            <Alert tipo="info">
              Você já assinou. Aguardando a assinatura da outra parte.
            </Alert>
          )}
          {contrato.status === "ACTIVE" && (
            <Alert tipo="sucesso" titulo="Contrato ativo">
              Ambas as partes assinaram. O contrato está vigente.
            </Alert>
          )}

          {/* Preview HTML do contrato */}
          <ContratoPreviewer contrato={{
            ...contrato,
            rentValue: Number(contrato.rentValue),
          }} />

          {/* Publicar (apenas locador em DRAFT) */}
          {contrato.status === "DRAFT" && isLocador && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Publicar para assinatura
                </h2>
              </CardHeader>
              <CardBody>
                <PublicarContrato contratoId={id} tipoAtual={contrato.templateType} />
              </CardBody>
            </Card>
          )}

          {contrato.status === "DRAFT" && !isLocador && (
            <Alert tipo="info">
              O locador ainda está revisando o contrato. Você receberá uma notificação quando ele estiver pronto para assinatura.
            </Alert>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Dados financeiros */}
          <Card>
            <CardBody className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aluguel</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(Number(contrato.rentValue))}
                  <span className="text-sm font-normal text-slate-500">/mês</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Duração</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{contrato.durationMonths} meses</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Início</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(contrato.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Garantia</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {GARANTIAS[contrato.guarantee as keyof typeof GARANTIAS]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reajuste</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{contrato.adjustmentIndex}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Status de assinaturas */}
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Assinaturas
              </p>
              <div className="space-y-3">
                {[
                  { nome: contrato.landlord.profile?.name ?? "Locador", role: "LANDLORD", assinou: locadorAssinou },
                  { nome: contrato.tenant.profile?.name ?? "Locatário", role: "TENANT", assinou: locatarioAssinou },
                ].map((parte) => {
                  const sig = contrato.signatures.find((s) => s.role === parte.role);
                  return (
                    <div key={parte.role} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${parte.assinou ? "bg-emerald-100 dark:bg-emerald-900" : "bg-slate-100 dark:bg-slate-700"}`}>
                        {parte.assinou ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{parte.nome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {parte.assinou && sig
                            ? `Assinado em ${new Date(sig.signedAt).toLocaleDateString("pt-BR")}`
                            : "Aguardando assinatura"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {podeAssinar && (
                <ContratoPreviewer.BotaoAssinar
                  contratoId={id}
                  documentHash={contrato.documentHash ?? ""}
                  nomeAssinante={session.user.name ?? session.user.email ?? ""}
                />
              )}
            </CardBody>
          </Card>

          {/* Info de segurança */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-semibold">Validade jurídica</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              As assinaturas eletrônicas desta plataforma são válidas nos termos da MP 2.200-2/2001
              e da Lei 14.063/2020. O hash SHA-256 do documento garante sua integridade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
