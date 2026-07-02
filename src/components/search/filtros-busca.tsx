"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TIPOS_IMOVEL } from "@/constants";

export function FiltrosBusca() {
  const router = useRouter();
  const sp = useSearchParams();

  const [cidade, setCidade] = useState(sp.get("cidade") ?? "");
  const [tipo, setTipo] = useState(sp.get("tipo") ?? "");
  const [precoMax, setPrecoMax] = useState(sp.get("precoMax") ?? "");
  const [quartos, setQuartos] = useState(sp.get("quartos") ?? "");
  const [aceitaPets, setAceitaPets] = useState(sp.get("aceitaPets") === "true");
  const [mobiliado, setMobiliado] = useState(sp.get("mobiliado") === "true");
  const [ordenar, setOrdenar] = useState(sp.get("ordenar") ?? "recente");
  const [expandido, setExpandido] = useState(false);

  const buscar = useCallback(() => {
    const params = new URLSearchParams();
    if (cidade) params.set("cidade", cidade);
    if (tipo) params.set("tipo", tipo);
    if (precoMax) params.set("precoMax", precoMax);
    if (quartos) params.set("quartos", quartos);
    if (aceitaPets) params.set("aceitaPets", "true");
    if (mobiliado) params.set("mobiliado", "true");
    if (ordenar !== "recente") params.set("ordenar", ordenar);
    router.push(`/imoveis?${params.toString()}`);
  }, [cidade, tipo, precoMax, quartos, aceitaPets, mobiliado, ordenar, router]);

  function limpar() {
    setCidade(""); setTipo(""); setPrecoMax(""); setQuartos("");
    setAceitaPets(false); setMobiliado(false); setOrdenar("recente");
    router.push("/imoveis");
  }

  const temFiltros = !!(cidade || tipo || precoMax || quartos || aceitaPets || mobiliado);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      {/* Busca principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            placeholder="Cidade, bairro ou endereço…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
        >
          <option value="">Tipo</option>
          {Object.entries(TIPOS_IMOVEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <Button onClick={buscar} className="gap-2 shrink-0">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>

        <button
          onClick={() => setExpandido(!expandido)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors",
            expandido || temFiltros
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {temFiltros && (
            <span className="bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filtros expandidos */}
      {expandido && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Preço máx/mês</label>
            <input
              type="number"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              placeholder="R$ 0"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Quartos mín.</label>
            <select
              value={quartos}
              onChange={(e) => setQuartos(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Qualquer</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Ordenar por</label>
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="recente">Mais recente</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
              <option value="visualizacoes">Mais vistos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Outros</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitaPets}
                  onChange={(e) => setAceitaPets(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Aceita pets 🐾
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mobiliado}
                  onChange={(e) => setMobiliado(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Mobiliado
              </label>
            </div>
          </div>

          {temFiltros && (
            <div className="col-span-2 sm:col-span-4 flex justify-end">
              <button
                onClick={limpar}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
