export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import { ScrollText, User } from "lucide-react";

interface Props {
  searchParams: Promise<{ acao?: string; pagina?: string }>;
}

const acaoCor: Record<string, string> = {
  USER_STATUS_ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  USER_STATUS_SUSPENDED: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  USER_STATUS_BANNED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  USER_VERIFIED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  USER_ADD_LANDLORD: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  USER_REMOVE_LANDLORD: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  PROPERTY_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  PROPERTY_REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  REPORT_RESOLVER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  REPORT_DISPENSAR: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  REPORT_REVISAR: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

export default async function AdminAuditoriaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const acao = sp.acao ?? "";
  const pagina = Number(sp.pagina ?? "1");
  const porPagina = 30;

  const where = acao ? { action: { contains: acao } } : {};

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        admin: { include: { profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.auditLog.count({ where }),
  ]);

  const paginas = Math.ceil(total / porPagina);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Log de auditoria</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{total} entrada(s) no total</p>
      </div>

      {/* Filtro por ação */}
      <form method="get" className="flex gap-2">
        <input
          name="acao"
          defaultValue={acao}
          placeholder="Filtrar por ação (ex: USER, PROPERTY)…"
          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium"
        >
          Filtrar
        </button>
      </form>

      {/* Lista */}
      <div className="space-y-2">
        {logs.length === 0 && (
          <div className="text-center py-16">
            <ScrollText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma entrada no log.</p>
          </div>
        )}
        {logs.map((log) => {
          const details = log.details as Record<string, unknown> | null;
          return (
            <div
              key={log.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
            >
              <div className="mt-0.5 shrink-0">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${acaoCor[log.action] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-slate-500">
                    {log.targetType} #{log.targetId.slice(-6)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Por{" "}
                  <Link href={`/admin/usuarios/${log.adminId}`} className="text-emerald-600 hover:underline">
                    {log.admin.profile?.name ?? log.admin.email}
                  </Link>
                  {log.ipAddress && ` · ${log.ipAddress}`}
                  {details?.motivo != null && ` · Motivo: ${String(details.motivo)}`}
                </p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatarData(log.createdAt)}</span>
            </div>
          );
        })}
      </div>

      {paginas > 1 && (
        <div className="flex gap-2 justify-end text-sm">
          {pagina > 1 && (
            <Link href={`?acao=${acao}&pagina=${pagina - 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Anterior
            </Link>
          )}
          {pagina < paginas && (
            <Link href={`?acao=${acao}&pagina=${pagina + 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
