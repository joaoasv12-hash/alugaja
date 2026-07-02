"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Home,
  Search,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  const { data: session, status } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const { tema, alternarTema } = useTheme();

  const isLocador = session?.user.roles.includes("LANDLORD");
  const isLocatario = session?.user.roles.includes("TENANT");
  const isAdmin = session?.user.roles.includes("SUPER_ADMIN");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-400 shrink-0">
          <Building2 className="h-6 w-6" />
          <span>AlugaJá</span>
        </Link>

        {/* Busca central (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <Link
            href="/imoveis"
            className="flex items-center gap-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-500 hover:border-emerald-400 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Buscar imóveis por cidade, bairro…</span>
          </Link>
        </div>

        {/* Ações direita */}
        <div className="flex items-center gap-2">
          {/* Modo escuro */}
          <button
            onClick={alternarTema}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar tema"
          >
            {tema === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {status === "loading" && (
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <>
              <Link href="/login">
                <Button variante="ghost" tamanho="sm">Entrar</Button>
              </Link>
              <Link href="/cadastro" className="hidden sm:block">
                <Button tamanho="sm">Cadastrar</Button>
              </Link>
            </>
          )}

          {status === "authenticated" && session && (
            <>
              {/* Notificações */}
              <NotificationBell />

              {/* Mensagens */}
              <Link
                href="/mensagens"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Mensagens"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Menu de perfil */}
              <div className="relative">
                <button
                  onClick={() => setPerfilAberto(!perfilAberto)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="hidden sm:block max-w-24 truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {perfilAberto && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setPerfilAberto(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-20 py-1">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500">Conectado como</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      {isLocatario && (
                        <MenuItem href="/locatario" icone={<Home className="h-4 w-4" />}>
                          Painel do Locatário
                        </MenuItem>
                      )}
                      {isLocador && (
                        <MenuItem href="/locador" icone={<Building2 className="h-4 w-4" />}>
                          Painel do Locador
                        </MenuItem>
                      )}
                      {isAdmin && (
                        <MenuItem href="/admin" icone={<User className="h-4 w-4" />}>
                          Admin
                        </MenuItem>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                        <MenuItem href="/perfil" icone={<User className="h-4 w-4" />}>
                          Meu Perfil
                        </MenuItem>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile expandido */}
      {menuAberto && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          <Link
            href="/imoveis"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMenuAberto(false)}
          >
            <Search className="h-4 w-4" />
            Buscar imóveis
          </Link>
        </div>
      )}
    </header>
  );
}

function MenuItem({
  href,
  icone,
  children,
}: {
  href: string;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      {icone}
      {children}
    </Link>
  );
}
