"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  Flag,
  DollarSign,
  ScrollText,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Visão geral", icone: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icone: Users },
  { href: "/admin/imoveis", label: "Moderação", icone: Home },
  { href: "/admin/denuncias", label: "Denúncias", icone: Flag },
  { href: "/admin/financeiro", label: "Financeiro", icone: DollarSign },
  { href: "/admin/auditoria", label: "Auditoria", icone: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0">
      <div className="flex items-center gap-2 px-3 py-3 mb-4">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <span className="font-bold text-slate-900 dark:text-slate-100">Admin Panel</span>
      </div>
      <nav className="space-y-1">
        {NAV.map(({ href, label, icone: Icone }) => {
          const ativo = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                ativo
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <Icone className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
