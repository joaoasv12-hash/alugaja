import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Zap, Shield, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssinarProButton } from "@/components/payment/assinar-pro-button";

export const metadata = {
  title: "AlugaJá Pro — Maximize seus resultados",
  description: "Assine o plano Pro e elimine a taxa de sucesso, tenha acesso a impulsionamento grátis e muito mais.",
};

const BENEFICIOS = [
  { icone: Shield, texto: "Taxa de sucesso zerada (economize até R$1.500 por contrato)" },
  { icone: Zap, texto: "1 impulsionamento gratuito por mês (valor de até R$59,90)" },
  { icone: TrendingUp, texto: "Destaque Pro no perfil e listagens" },
  { icone: Star, texto: "Acesso antecipado a novidades e funcionalidades beta" },
];

export default async function ProPage() {
  const session = await getServerSession(authOptions);

  let assinaturaAtiva = false;
  if (session) {
    const assinatura = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });
    assinaturaAtiva = assinatura?.status === "ACTIVE";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Zap className="h-3.5 w-3.5" />
          AlugaJá Pro
        </span>

        <h1 className="text-4xl font-bold text-white mb-4">
          Maximize seus resultados sem pagar por cada contrato
        </h1>
        <p className="text-lg text-slate-400 mb-10">
          Alugue sem preocupação. Por apenas <strong className="text-white">R$49,90/mês</strong>, sua taxa de sucesso vai a zero.
        </p>

        {/* Card de preço */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl text-left mb-8">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-bold text-slate-900 dark:text-white">R$49,90</span>
            <span className="text-slate-500 mb-2">/mês</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">Cancele quando quiser, sem fidelidade.</p>

          <ul className="space-y-4 mb-8">
            {BENEFICIOS.map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900 p-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-sm">{texto}</span>
              </li>
            ))}
          </ul>

          {assinaturaAtiva ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                Você já é Pro! Gerencie sua assinatura em <Link href="/configuracoes" className="underline">Configurações</Link>.
              </p>
            </div>
          ) : session ? (
            <AssinarProButton />
          ) : (
            <Link href="/entrar?callbackUrl=/pro">
              <Button className="w-full" tamanho="lg">
                Começar agora — R$49,90/mês
              </Button>
            </Link>
          )}
        </div>

        <p className="text-slate-500 text-sm">
          Pagamento seguro via Mercado Pago. Cancele a qualquer momento pelo painel.
        </p>

        {/* Comparativo */}
        <div className="mt-16 text-left">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Quanto você economiza?</h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium">Situação</th>
                  <th className="px-5 py-3 text-slate-400 font-medium text-right">Sem Pro</th>
                  <th className="px-5 py-3 text-emerald-400 font-medium text-right">Com Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {[
                  ["Aluguel de R$1.000/mês", "R$500,00 taxa", "R$0,00 ✓"],
                  ["Aluguel de R$2.000/mês", "R$1.000,00 taxa", "R$0,00 ✓"],
                  ["Aluguel de R$3.500/mês", "R$1.500,00 taxa (teto)", "R$0,00 ✓"],
                  ["Impulsionamento 30 dias", "R$59,90", "Grátis 1x/mês ✓"],
                ].map(([situacao, sem, com]) => (
                  <tr key={situacao}>
                    <td className="px-5 py-3 text-slate-300">{situacao}</td>
                    <td className="px-5 py-3 text-red-400 text-right">{sem}</td>
                    <td className="px-5 py-3 text-emerald-400 text-right font-medium">{com}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
