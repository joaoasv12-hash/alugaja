"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatarMoeda } from "@/lib/utils";

const INDICES = { IGPM: 0.1, IPCA: 0.045, INPC: 0.04 };

export default function SimuladorPage() {
  const [aluguel, setAluguel] = useState(2000);
  const [condominio, setCondominio] = useState(500);
  const [iptu, setIptu] = useState(100);
  const [seguro, setSeguro] = useState(80);
  const [indice, setIndice] = useState<keyof typeof INDICES>("IGPM");
  const [meses, setMeses] = useState(12);

  const totalMensal = aluguel + condominio + iptu + seguro;
  const totalPeriodo = totalMensal * meses;
  const reajuste = INDICES[indice];
  const aluguelReajustado = aluguel * (1 + reajuste);
  const totalReajustado = aluguelReajustado + condominio + iptu + seguro;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4">
          <Calculator className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Simulador de custos</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Calcule o custo total da locação, incluindo encargos e simulação de reajuste pelo índice contratual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Valores mensais</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Aluguel (R$)
            </label>
            <input
              type="number"
              min={0}
              value={aluguel}
              onChange={(e) => setAluguel(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Condomínio (R$)
            </label>
            <input
              type="number"
              min={0}
              value={condominio}
              onChange={(e) => setCondominio(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              IPTU mensal (R$)
            </label>
            <input
              type="number"
              min={0}
              value={iptu}
              onChange={(e) => setIptu(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Seguro incêndio (R$)
            </label>
            <input
              type="number"
              min={0}
              value={seguro}
              onChange={(e) => setSeguro(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <h2 className="font-semibold text-slate-900 dark:text-slate-100 pt-2">Projeção de reajuste</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Índice de reajuste
            </label>
            <select
              value={indice}
              onChange={(e) => setIndice(e.target.value as keyof typeof INDICES)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="IGPM">IGP-M (10% a.a.)</option>
              <option value="IPCA">IPCA (4,5% a.a.)</option>
              <option value="INPC">INPC (4% a.a.)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Duração do contrato (meses)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Resumo</h2>

          <Card>
            <CardBody className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Custo mensal atual</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Aluguel</span><span>{formatarMoeda(aluguel)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Condomínio</span><span>{formatarMoeda(condominio)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>IPTU mensal</span><span>{formatarMoeda(iptu)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Seguro incêndio</span><span>{formatarMoeda(seguro)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total mensal</span><span className="text-emerald-600 dark:text-emerald-400">{formatarMoeda(totalMensal)}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total no período ({meses} meses)</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatarMoeda(totalPeriodo)}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Após reajuste ({indice} · +{(reajuste * 100).toFixed(1)}%)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Aluguel reajustado</span><span>{formatarMoeda(aluguelReajustado)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Novo total mensal</span><span className="text-amber-600 dark:text-amber-400">{formatarMoeda(totalReajustado)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Aumento mensal</span><span>+{formatarMoeda(totalReajustado - totalMensal)}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 mt-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Simulação meramente informativa. Os valores reais dependem das condições de mercado e do contrato firmado entre as partes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
