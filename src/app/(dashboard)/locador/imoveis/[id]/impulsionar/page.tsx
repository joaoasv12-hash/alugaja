"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, TrendingUp, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatarMoeda } from "@/lib/utils";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const PLANOS = [
  {
    dias: 7 as const,
    preco: 19.9,
    destaque: false,
    beneficios: ["Apareça no topo por 7 dias", "Selo 'Destaque' na listagem", "Mais visibilidade nos resultados"],
  },
  {
    dias: 15 as const,
    preco: 34.9,
    destaque: true,
    beneficios: ["Apareça no topo por 15 dias", "Selo 'Destaque' na listagem", "Mais visibilidade nos resultados", "Notificação para interessados próximos"],
  },
  {
    dias: 30 as const,
    preco: 59.9,
    destaque: false,
    beneficios: ["Apareça no topo por 30 dias", "Selo 'Destaque' na listagem", "Máxima visibilidade garantida", "Notificação para interessados próximos", "Relatório de desempenho"],
  },
];

export default function ImpulsionarPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [planoSelecionado, setPlanoSelecionado] = useState<7 | 15 | 30>(15);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function impulsionar() {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/impulsionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, dias: planoSelecionado }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao criar impulsionamento"); setCarregando(false); return; }
      // Redireciona para a fatura de pagamento
      router.push(`/fatura/${data.faturaId}`);
    } catch {
      setErro("Erro inesperado. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href={`/locador/imoveis/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o imóvel
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-3 py-1 text-xs font-medium mb-3">
          <Zap className="h-3 w-3" />
          Impulsionar imóvel
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Destaque seu imóvel</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Imóveis impulsionados recebem até <strong>3× mais visualizações</strong> e aparecem no topo dos resultados.
        </p>
      </div>

      {/* Estatísticas de destaque */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icone: Eye, valor: "3×", label: "mais visualizações" },
          { icone: TrendingUp, valor: "2×", label: "mais contatos" },
          { icone: Star, valor: "Top", label: "posição nos resultados" },
        ].map(({ icone: Icone, valor, label }) => (
          <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
            <Icone className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Planos */}
      <div className="grid gap-3 mb-6">
        {PLANOS.map((plano) => (
          <button
            key={plano.dias}
            onClick={() => setPlanoSelecionado(plano.dias)}
            className={`relative text-left rounded-xl border p-5 transition-all ${
              planoSelecionado === plano.dias
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 ring-1 ring-emerald-500"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}
          >
            {plano.destaque && (
              <span className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">
                Mais popular
              </span>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                planoSelecionado === plano.dias ? "border-emerald-500" : "border-slate-300 dark:border-slate-600"
              }`}>
                {planoSelecionado === plano.dias && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{plano.dias} dias</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatarMoeda(plano.preco)}</p>
              </div>
            </div>
            <ul className="space-y-1.5 ml-7">
              {plano.beneficios.map((b) => (
                <li key={b} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

      <Button onClick={impulsionar} carregando={carregando} className="w-full" tamanho="lg">
        <Zap className="h-4 w-4" />
        Impulsionar por {planoSelecionado} dias — {formatarMoeda(PLANOS.find(p => p.dias === planoSelecionado)!.preco)}
      </Button>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
        Você será redirecionado para a fatura de pagamento.
      </p>
    </div>
  );
}
