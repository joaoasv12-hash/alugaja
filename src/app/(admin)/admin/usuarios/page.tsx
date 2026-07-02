export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";

interface Props {
  searchParams: Promise<{ q?: string; status?: string; role?: string; pagina?: string }>;
}

const statusCor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  SUSPENDED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  BANNED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  PENDING_VERIFICATION: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  BANNED: "Banido",
  PENDING_VERIFICATION: "Pendente",
};

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const busca = sp.q ?? "";
  const status = sp.status ?? "";
  const role = sp.role ?? "";
  const pagina = Number(sp.pagina ?? "1");
  const porPagina = 20;

  const where: Prisma.UserWhereInput = {
    ...(busca && {
      OR: [
        { email: { contains: busca, mode: "insensitive" } },
        { profile: { name: { contains: busca, mode: "insensitive" } } },
      ],
    }),
    ...(status && { status: status as Prisma.EnumUserStatusFilter }),
    ...(role && { roles: { has: role as "TENANT" | "LANDLORD" | "SUPER_ADMIN" } }),
  };

  const [usuarios, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        profile: { select: { name: true, isVerified: true } },
        _count: { select: { properties: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.user.count({ where }),
  ]);

  const paginas = Math.ceil(total / porPagina);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Usuários</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{total} no total</p>
        </div>
      </div>

      {/* Filtros */}
      <form method="get" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome ou e-mail…"
          className="flex-1 min-w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="SUSPENDED">Suspenso</option>
          <option value="BANNED">Banido</option>
        </select>
        <select
          name="role"
          defaultValue={role}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="">Todos os papéis</option>
          <option value="LANDLORD">Locador</option>
          <option value="TENANT">Locatário</option>
          <option value="SUPER_ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium"
        >
          Filtrar
        </button>
      </form>

      {/* Tabela */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Usuário</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Papéis</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Cadastro</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {usuarios.map((u) => (
              <tr key={u.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        {u.profile?.name ?? "—"}
                        {u.profile?.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCor[u.status]}`}>
                    {statusLabel[u.status]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r) => (
                      <span key={r} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                  {formatarData(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Ver perfil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {paginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Página {pagina} de {paginas}
          </p>
          <div className="flex gap-2">
            {pagina > 1 && (
              <Link
                href={`?q=${busca}&status=${status}&role=${role}&pagina=${pagina - 1}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Anterior
              </Link>
            )}
            {pagina < paginas && (
              <Link
                href={`?q=${busca}&status=${status}&role=${role}&pagina=${pagina + 1}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
