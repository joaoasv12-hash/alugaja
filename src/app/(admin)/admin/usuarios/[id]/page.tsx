export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatarData, formatarMoeda } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, Building2, CreditCard, MessageSquare } from "lucide-react";
import { UserActions } from "@/components/admin/user-actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUsuarioPage({ params }: Props) {
  const { id } = await params;

  const usuario = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      properties: {
        select: { id: true, title: true, status: true, rentPrice: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      invoices: {
        select: { id: true, type: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      subscription: true,
      _count: { select: { properties: true, invoices: true, sentMessages: true } },
    },
  });

  if (!usuario) notFound();

  const isLandlord = usuario.roles.includes("LANDLORD");
  const isVerificado = usuario.profile?.isVerified ?? false;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuários
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-2xl font-bold text-slate-500">
            {(usuario.profile?.name ?? usuario.email)[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {usuario.profile?.name ?? "Sem nome"}
              </h1>
              {isVerificado && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
              {usuario.roles.includes("SUPER_ADMIN") && (
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                  SUPER ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {usuario.email}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-500">
              <span>Cadastrado em {formatarData(usuario.createdAt)}</span>
              <span>Status: <strong className="text-slate-700 dark:text-slate-300">{usuario.status}</strong></span>
              <span>Papéis: <strong className="text-slate-700 dark:text-slate-300">{usuario.roles.join(", ")}</strong></span>
            </div>
          </div>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          {[
            { icone: Building2, label: "Imóveis", valor: usuario._count.properties },
            { icone: CreditCard, label: "Faturas", valor: usuario._count.invoices },
            { icone: MessageSquare, label: "Mensagens", valor: usuario._count.sentMessages },
          ].map(({ icone: Icone, label, valor }) => (
            <div key={label} className="text-center">
              <Icone className="h-5 w-5 text-slate-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{valor}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Ações moderativas</h2>
        <UserActions
          userId={usuario.id}
          statusAtual={usuario.status}
          isVerificado={isVerificado}
          isLandlord={isLandlord}
        />
      </div>

      {/* Imóveis recentes */}
      {usuario.properties.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Imóveis recentes</h2>
          <div className="space-y-2">
            {usuario.properties.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <Link href={`/admin/imoveis?id=${p.id}`} className="text-emerald-600 hover:underline truncate flex-1">
                  {p.title}
                </Link>
                <span className="ml-4 shrink-0 text-slate-500">{formatarMoeda(Number(p.rentPrice))}</span>
                <span className="ml-3 shrink-0 text-xs text-slate-400">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faturas recentes */}
      {usuario.invoices.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Faturas recentes</h2>
          <div className="space-y-2">
            {usuario.invoices.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{f.type}</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">{formatarMoeda(Number(f.amount))}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
