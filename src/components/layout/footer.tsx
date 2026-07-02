import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-3">
              <Building2 className="h-5 w-5" />
              AlugaJá
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              O marketplace de aluguel que conecta locadores e locatários de forma direta e segura.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">CNPJ 00.000.000/0001-00</p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm">Plataforma</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/imoveis" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Buscar imóveis
                </Link>
              </li>
              <li>
                <Link href="/locador/imoveis/novo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Anunciar imóvel
                </Link>
              </li>
              <li>
                <Link href="/simulador" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Simulador de custos
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  AlugaJá Pro
                </Link>
              </li>
            </ul>
          </div>

          {/* Segurança */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm">Segurança</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/dicas-seguranca" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Dicas contra golpes
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link href="/configuracoes/privacidade" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Meus dados (LGPD)
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm">Suporte</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Perguntas frequentes
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Fale conosco
                </Link>
              </li>
              <li>
                <a href="mailto:contato@alugaja.com.br" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  contato@alugaja.com.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5511912345678" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AlugaJá. Todos os direitos reservados.</p>
          <p className="text-center">
            Os modelos de contrato são referências e não substituem a orientação de um advogado.
          </p>
        </div>
      </div>
    </footer>
  );
}
