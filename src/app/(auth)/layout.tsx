import { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-400">
          <Building2 className="h-6 w-6" />
          AlugaJá
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AlugaJá. Todos os direitos reservados.
      </footer>
    </div>
  );
}
