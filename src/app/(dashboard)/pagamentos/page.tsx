import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatarMoeda, formatarData } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FileText, Receipt, Star, CreditCard } from "lucide-react";

const tipoLabel: Record<string, string> = {
  SUCCESS_FEE: "Taxa de sucesso",
  SPONSORSHIP: "Impulsionamento",
  SUBSCRIPTION: "AlugaJá Pro",
};

const tipoIcone: Record<string, typeof FileText> = {
  SUCCESS_FEE: Receipt,
  SPONSORSHIP: Star,
  SUBSCRIPTION: CreditCard,
};

const statusCor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

export default async function PagamentosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/entrar");

  const faturas = await db.invoice.findMany({
    where: { userId: session.user.id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Faturas e pagamentos</h1>

      {faturas.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma fatura encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faturas.map((fatura) => {
            const Icone = tipoIcone[fatura.type] ?? FileText;
            const pago = fatura.status === "PAID";
            return (
              <Link
                key={fatura.id}
                href={pago ? "#" : `/fatura/${fatura.id}`}
                className={`flex items-center gap-4 rounded-xl border bg-white dark:bg-slate-900 p-4 transition-colors ${
                  pago ? "cursor-default" : "hover:border-emerald-400 hover:shadow-sm"
                } border-slate-200 dark:border-slate-800`}
              >
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Icone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {fatura.description ?? tipoLabel[fatura.type]}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Vencimento: {formatarData(fatura.dueDate)}
                    {fatura.paidAt && ` · Pago em ${formatarData(fatura.paidAt)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatarMoeda(Number(fatura.amount))}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCor[fatura.status]}`}>
                    {statusLabel[fatura.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
