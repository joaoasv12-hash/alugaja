import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatarMoeda, formatarData } from "@/lib/utils";
import { EscolherPagamento } from "@/components/payment/escolher-pagamento";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const tipoLabel: Record<string, string> = {
  SUCCESS_FEE: "Taxa de sucesso",
  SPONSORSHIP: "Impulsionamento",
  SUBSCRIPTION: "AlugaJá Pro",
};

export default async function FaturaPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/entrar");

  const fatura = await db.invoice.findUnique({
    where: { id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!fatura || fatura.userId !== session.user.id) notFound();

  const usuario = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  const pago = fatura.status === "PAID";
  const cancelada = fatura.status === "CANCELLED";

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      {/* Cabeçalho */}
      <div className="mb-8">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {tipoLabel[fatura.type] ?? fatura.type}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {fatura.description ?? "Fatura"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Fatura #{fatura.id.slice(-8).toUpperCase()} · Vence em {formatarData(fatura.dueDate)}
        </p>
      </div>

      {/* Card de valor */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Valor total</p>
        <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          {formatarMoeda(Number(fatura.amount))}
        </p>
      </div>

      {/* Status */}
      {pago ? (
        <Alert tipo="sucesso" titulo="Pagamento confirmado">
          Seu pagamento foi aprovado em {fatura.paidAt ? formatarData(fatura.paidAt) : "—"}.
          Não é necessária nenhuma ação.
        </Alert>
      ) : cancelada ? (
        <Alert tipo="aviso" titulo="Fatura cancelada">
          Esta fatura foi cancelada e não requer pagamento.
        </Alert>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">Forma de pagamento</h2>
          <EscolherPagamento
            faturaId={fatura.id}
            valor={Number(fatura.amount)}
            descricao={fatura.description ?? tipoLabel[fatura.type]}
            pagador={{
              nome: usuario?.profile?.name ?? usuario?.email ?? "Usuário",
              email: usuario?.email ?? "",
              cpf: usuario?.profile?.cpfCnpj ?? undefined,
            }}
          />
        </div>
      )}
    </div>
  );
}
