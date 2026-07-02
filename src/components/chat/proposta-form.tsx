"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { GARANTIAS, INDICES_REAJUSTE } from "@/constants";
import { formatarMoeda } from "@/lib/utils";

interface PropostaFormProps {
  propertyId: string;
  landlordId: string;
  aluguelSugerido: number;
  onClose: () => void;
}

const DURACOES = [12, 24, 30, 36];

export function PropostaForm({ propertyId, landlordId, aluguelSugerido, onClose }: PropostaFormProps) {
  const router = useRouter();
  const [rentValue, setRentValue] = useState(aluguelSugerido);
  const [entryDate, setEntryDate] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);
  const [guarantee, setGuarantee] = useState("DEPOSIT");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const hoje = new Date().toISOString().split("T")[0];

  async function enviar() {
    setErro(null);
    if (!entryDate) {
      setErro("Informe a data de entrada desejada.");
      return;
    }

    setCarregando(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        landlordId,
        rentValue,
        entryDate: new Date(entryDate + "T12:00:00").toISOString(),
        durationMonths,
        guarantee,
      }),
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao enviar proposta.");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enviar proposta
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

        <div className="space-y-4">
          {/* Valor do aluguel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Valor proposto (R$/mês)
            </label>
            <Input
              type="number"
              min={1}
              step="50"
              value={rentValue}
              onChange={(e) => setRentValue(Number(e.target.value))}
              iconeEsquerda={<span className="text-xs">R$</span>}
            />
            {rentValue < aluguelSugerido && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Abaixo do aluguel pedido ({formatarMoeda(aluguelSugerido)})
              </p>
            )}
          </div>

          {/* Data de entrada */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data de entrada desejada <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={hoje}
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Duração */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Duração do contrato
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURACOES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                    durationMonths === m
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Garantia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de garantia
            </label>
            <select
              value={guarantee}
              onChange={(e) => setGuarantee(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(GARANTIAS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Resumo */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Resumo da proposta</p>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Aluguel</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatarMoeda(rentValue)}/mês</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Duração</span>
              <span>{durationMonths} meses</span>
            </div>
            {entryDate && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Entrada</span>
                <span>{new Date(entryDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Garantia</span>
              <span>{GARANTIAS[guarantee as keyof typeof GARANTIAS]}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variante="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button carregando={carregando} onClick={enviar} className="flex-1">
            Enviar proposta
          </Button>
        </div>
      </div>
    </div>
  );
}
