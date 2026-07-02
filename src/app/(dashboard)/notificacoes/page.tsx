import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import { MarcarTodasLidasButton } from "@/components/notifications/marcar-todas-lidas-button";

const tipoIcone: Record<string, string> = {
  NEW_MESSAGE: "💬",
  VISIT_CONFIRMED: "📅",
  VISIT_CANCELLED: "❌",
  PROPOSAL_RECEIVED: "📋",
  PROPOSAL_ACCEPTED: "✅",
  PROPOSAL_REJECTED: "❌",
  CONTRACT_READY: "📄",
  CONTRACT_SIGNED: "✍️",
  INVOICE_GENERATED: "💰",
  INVOICE_DUE: "⚠️",
  REVIEW_RECEIVED: "⭐",
  PROPERTY_APPROVED: "🏠",
  PROPERTY_REJECTED: "🚫",
  SAVED_SEARCH_MATCH: "🔔",
};

export default async function NotificacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/entrar");

  const notificacoes = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const naoLidas = notificacoes.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notificações</h1>
          {naoLidas > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {naoLidas} não lida{naoLidas !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {naoLidas > 0 && <MarcarTodasLidasButton />}
      </div>

      {notificacoes.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma notificação ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                n.readAt
                  ? "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                  : "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">{tipoIcone[n.type] ?? "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.readAt ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-slate-400">{formatarData(n.createdAt)}</span>
                {n.readAt && <CheckCheck className="h-3.5 w-3.5 text-slate-300" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
