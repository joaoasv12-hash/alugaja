"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";

interface SimuladorCustosProps {
  aluguel: number;
  condominio: number;
  iptu: number;
}

const INDICES = {
  IGPM: 0.1,
  IPCA: 0.045,
  INPC: 0.04,
};

export function SimuladorCustos({ aluguel, condominio, iptu }: SimuladorCustosProps) {
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState<keyof typeof INDICES>("IGPM");
  const [meses, setMeses] = useState(12);

  const reajuste = INDICES[indice];
  const novoAluguel = aluguel * (1 + reajuste);
  const totalAtual = aluguel + condominio + iptu;
  const totalReajustado = novoAluguel + condominio + iptu;
  const variacao = totalReajustado - totalAtual;

  const custosGarantia = aluguel * 3;

  return (
    <Card>
      <CardBody>
        <button
          onClick={() => setAberto(!aberto)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Simulador de custos
          </h2>
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {aberto ? "Ocultar" : "Expandir"}
          </span>
        </button>

        {aberto && (
          <div className="mt-4 space-y-5">
            {/* Resumo de custos iniciais */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Custos na entrada</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Aluguel (1º mês)</span>
                  <span className="font-medium">{formatarMoeda(aluguel)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Caução estimada (3x aluguel)</span>
                  <span className="font-medium">{formatarMoeda(custosGarantia)}</span>
                </div>
                {condominio > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Condomínio (1º mês)</span>
                    <span className="font-medium">{formatarMoeda(condominio)}</span>
                  </div>
                )}
                {iptu > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">IPTU (1º mês)</span>
                    <span className="font-medium">{formatarMoeda(iptu)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold">
                  <span>Total na entrada</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatarMoeda(aluguel + custosGarantia + condominio + iptu)}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulação de reajuste */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Simulação de reajuste anual</p>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Índice</label>
                  <select
                    value={indice}
                    onChange={(e) => setIndice(e.target.value as keyof typeof INDICES)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.keys(INDICES).map((k) => (
                      <option key={k} value={k}>{k} ({(INDICES[k as keyof typeof INDICES] * 100).toFixed(1)}% ao ano)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Meses</label>
                  <select
                    value={meses}
                    onChange={(e) => setMeses(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {[12, 24, 30, 36].map((m) => <option key={m} value={m}>{m}m</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Aluguel atual</span>
                  <span>{formatarMoeda(aluguel)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Aluguel após {meses}m</span>
                  <span className="font-medium">{formatarMoeda(novoAluguel)}</span>
                </div>
                <div className="flex justify-between text-orange-600 dark:text-orange-400">
                  <span>Aumento</span>
                  <span>+ {formatarMoeda(variacao)}/mês</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              * Valores estimados. O reajuste real depende do índice vigente na data do aniversário do contrato.
              Caução de 3 meses é uma estimativa — a garantia pode variar.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
