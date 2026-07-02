import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Building2, Users, BarChart3, Flag, BookOpen, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.roles.includes("SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar admin */}
      <aside className="w-64 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 text-white font-bold">
            <Building2 className="h-5 w-5 text-emerald-400" />
            AlugaJá Admin
          </Link>
          <p className="text-xs text-slate-500 mt-1">Painel restrito</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin", label: "Métricas", icone: BarChart3 },
            { href: "/admin/usuarios", label: "Usuários", icone: Users },
            { href: "/admin/anuncios", label: "Anúncios", icone: Building2 },
            { href: "/admin/financeiro", label: "Financeiro", icone: BarChart3 },
            { href: "/admin/denuncias", label: "Denúncias", icone: Flag },
            { href: "/admin/auditoria", label: "Auditoria", icone: BookOpen },
          ].map(({ href, label, icone: Icone }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
            >
              <Icone className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
          <Link
            href="/"
            className="flex items-center gap-2 mt-2 text-xs text-slate-500 hover:text-white transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Voltar ao site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8 text-white">{children}</main>
    </div>
  );
}
