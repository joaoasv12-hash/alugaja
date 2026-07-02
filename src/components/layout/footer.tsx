import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-3">
              <Building2 className="h-5 w-5" />
              AlugaJá
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              O marketplace de aluguel que conecta locadores e locatários de forma direta e segura.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">Plataforma</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/imoveis" className="hover:text-emerald-600 dark:hover:text-emerald-400">Buscar imóveis</Link></li>
              <li><Link href="/locador/imoveis/novo" className="hover:text-emerald-600 dark:hover:text-emerald-400">Anunciar imóvel</Link></li>
              <li><Link href="/simulador" className="hover:text-emerald-600 dark:hover:text-emerald-400">Simulador de custos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">Segurança</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/dicas-seguranca" className="hover:text-emerald-600 dark:hover:text-emerald-400">Dicas contra golpes</Link></li>
              <li><Link href="/privacidade" className="hover:text-emerald-600 dark:hover:text-emerald-400">Política de privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-emerald-600 dark:hover:text-emerald-400">Termos de uso</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">Suporte</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400">Perguntas frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-emerald-600 dark:hover:text-emerald-400">Fale conosco</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AlugaJá. Todos os direitos reservados.</p>
          <p className="text-center">
            Os modelos de contrato são referências e não substituem a orientação de um advogado.
          </p>
        </div>
      </div>
    </footer>
  );
}
