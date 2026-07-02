export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import { Flag, Home, User } from "lucide-react";
import { ReportActions } from "@/components/admin/report-actions";
import { Prisma } from "@/generated/prisma/client";

interface Props {
  searchParams: Promise<{ status?: string; pagina?: string }>;
}

const motivoLabel: Record<string, string> = {
  FAKE_LISTING: "Anúncio falso",
  SCAM: "Golpe / fraude",
  DISCRIMINATION: "Discriminação",
  INAPPROPRIATE_CONTENT: "Conteúdo inadequado",
  OTHER: "Outro",
};

const statusCor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  DISMISSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default async function AdminDenunciasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status ?? "PENDING";
  const pagina = Number(sp.pagina ?? "1");
  const porPagina = 20;

  const where: Prisma.ReportWhereInput = { status: status as Prisma.EnumReportStatusFilter };

  const [denuncias, total, totalPendente] = await Promise.all([
    db.report.findMany({
      where,
      include: {
        reporter: { include: { profile: { select: { name: true } } } },
        property: { select: { id: true, title: true, slug: true } },
        targetUser: { include: { profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.report.count({ where }),
    db.report.count({ where: { status: "PENDING" } }),
  ]);

  const paginas = Math.ceil(total / porPagina);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Denúncias</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {totalPendente > 0 ? `${totalPendente} pendente(s)` : "Nenhuma pendente"} · {total} neste filtro
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((s) => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              status === s
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            {s === "UNDER_REVIEW" ? "Em revisão" : s === "DISMISSED" ? "Dispensada" : s === "RESOLVED" ? "Resolvida" : "Pendente"}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {denuncias.length === 0 && (
          <div className="text-center py-16">
            <Flag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma denúncia neste filtro.</p>
          </div>
        )}
        {denuncias.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {motivoLabel[d.reason]}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCor[d.status]}`}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Reportado por{" "}
                  <Link href={`/admin/usuarios/${d.reporterId}`} className="text-emerald-600 hover:underline">
                    {d.reporter.profile?.name ?? d.reporter.email}
                  </Link>{" "}
                  em {formatarData(d.createdAt)}
                </p>
              </div>
            </div>

            {/* Alvo */}
            {d.property && (
              <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <Home className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Imóvel:</span>
                <Link href={`/imovel/${d.property.slug}`} target="_blank" className="text-emerald-600 hover:underline truncate">
                  {d.property.title}
                </Link>
              </div>
            )}
            {d.targetUser && (
              <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Usuário:</span>
                <Link href={`/admin/usuarios/${d.targetUserId}`} className="text-emerald-600 hover:underline">
                  {d.targetUser.profile?.name ?? d.targetUser.email}
                </Link>
              </div>
            )}

            {/* Descrição */}
            <blockquote className="text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
              {d.description}
            </blockquote>

            {d.adminNotes && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong>Notas admin:</strong> {d.adminNotes}
              </p>
            )}

            {["PENDING", "UNDER_REVIEW"].includes(d.status) && (
              <ReportActions reportId={d.id} status={d.status} />
            )}
          </div>
        ))}
      </div>

      {paginas > 1 && (
        <div className="flex gap-2 justify-end text-sm">
          {pagina > 1 && (
            <Link href={`?status=${status}&pagina=${pagina - 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Anterior
            </Link>
          )}
          {pagina < paginas && (
            <Link href={`?status=${status}&pagina=${pagina + 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
