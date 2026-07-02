import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProSucessoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Bem-vindo ao Pro!</h1>
        <p className="text-slate-400 mb-8">
          Sua assinatura AlugaJá Pro está ativa. A taxa de sucesso foi zerada e você já pode usar seu impulsionamento gratuito.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            "Taxa de sucesso: R$0,00 ✓",
            "1 impulsionamento gratuito disponível ✓",
            "Selo Pro no seu perfil ✓",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 text-sm">{item}</span>
            </div>
          ))}
        </div>

        <Link href="/locador/imoveis">
          <Button className="w-full" tamanho="lg">
            Gerenciar meus imóveis
          </Button>
        </Link>
      </div>
    </div>
  );
}
