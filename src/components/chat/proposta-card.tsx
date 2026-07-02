"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatarMoeda } from "@/lib/utils";
import { GARANTIAS } from "@/constants";

interface ContraOferta {
  id: string;
  rentValue?: number | string | null;
  entryDate?: string | null;
  durationMonths?: number | null;
  message?: string | null;
  createdAt: string;
  fromUser: { profile?: { name?: string | null } | null };
}

interface PropostaCardProps {
  proposta: {
    id: string;
    rentValue: number | string;
    entryDate: string;
    durationMonths: number;
    guarantee: string;
    status: string;
    counterOffers: ContraOferta[];
  };
  isLocador: boolean;
}

const STATUS_BADGE: Record<string, { cor: "verde" | "amarelo" | "vermelho" | "azul" | "cinza"; label: string }> = {
  PENDING: { cor: "amarelo", label: "Aguardando resposta" },
  COUNTER_OFFERED: { cor: "azul", label: "Contraproposta enviada" },
  ACCEPTED: { cor: "verde", label: "Aceita ✓" },
  REJECTED: { cor: "vermelho", label: "Recusada" },
  CANCELLED: { cor: "cinza", label: "Cancelada" },
  EXPIRED: { cor: "cinza", label: "Expirada" },
};

export function PropostaCard({ proposta, isLocador }: PropostaCardProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(true);
  const [contraAberto, setContraAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [contra, setContra] = useState({ rentValue: "", entryDate: "", durationMonths: "", message: "" });

  const podeResponder =
    isLocador &&
    (proposta.status === "PENDING" || proposta.status === "COUNTER_OFFERED");

  async function responder(action: "ACCEPT" | "REJECT" | "COUNTER") {
    setErro(null);
    const body: Record<string, unknown> = { action };
    if (action === "COUNTER") {
      if (contra.rentValue) body.rentValue = Number(contra.rentValue);
      if (contra.entryDate) body.entryDate = new Date(contra.entryDate + "T12:00:00").toISOString();
      if (contra.durationMonths) body.durationMonths = Number(contra.durationMonths);
      if (contra.message) body.message = contra.message;
    }

    setCarregando(true);
    const res = await fetch(`/api/proposals/${proposta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao responder proposta.");
      return;
    }
    setContraAberto(false);
    router.refresh();
  }

  const statusInfo = STATUS_BADGE[proposta.status] ?? STATUS_BADGE.PENDING;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-2">
      {/* Header */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">📋 Proposta de aluguel</span>
          <Badge cor={statusInfo.cor}>{statusInfo.label}</Badge>
        </div>
        {aberto ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {aberto && (
        <div className="p-4">
          {/* Dados da proposta */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Aluguel proposto</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {formatarMoeda(Number(proposta.rentValue))}/mês
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Entrada</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(proposta.entryDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Duração</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{proposta.durationMonths} meses</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Garantia</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {GARANTIAS[proposta.guarantee as keyof typeof GARANTIAS]}
              </p>
            </div>
          </div>

          {/* Contrapropostas */}
          {proposta.counterOffers.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mb-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Histórico de contrapropostas:</p>
              {proposta.counterOffers.map((co) => (
                <div key={co.id} className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mb-2 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-300 text-xs mb-1">
                    {co.fromUser.profile?.name ?? "Usuário"} ·{" "}
                    {new Date(co.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  {co.rentValue && <p>Aluguel: {formatarMoeda(Number(co.rentValue))}/mês</p>}
                  {co.entryDate && <p>Entrada: {new Date(co.entryDate).toLocaleDateString("pt-BR")}</p>}
                  {co.durationMonths && <p>Duração: {co.durationMonths} meses</p>}
                  {co.message && <p className="italic text-blue-700 dark:text-blue-400">"{co.message}"</p>}
                </div>
              ))}
            </div>
          )}

          {erro && <Alert tipo="erro" className="mb-3">{erro}</Alert>}

          {/* Ações do locador */}
          {podeResponder && !contraAberto && (
            <div className="flex gap-2">
              <Button
                tamanho="sm"
                carregando={carregando}
                onClick={() => responder("ACCEPT")}
                className="gap-1.5 flex-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aceitar
              </Button>
              <Button
                tamanho="sm"
                variante="outline"
                onClick={() => setContraAberto(true)}
                className="gap-1.5 flex-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Contraproposta
              </Button>
              <Button
                tamanho="sm"
                variante="ghost"
                carregando={carregando}
                onClick={() => responder("REJECT")}
                className="text-red-600 hover:text-red-700 gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Recusar
              </Button>
            </div>
          )}

          {/* Form de contraproposta */}
          {contraAberto && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-3 space-y-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Sua contraproposta</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Novo aluguel (R$)</label>
                  <input
                    type="number"
                    placeholder={String(Number(proposta.rentValue))}
                    value={contra.rentValue}
                    onChange={(e) => setContra({ ...contra, rentValue: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Duração (meses)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    placeholder={String(proposta.durationMonths)}
                    value={contra.durationMonths}
                    onChange={(e) => setContra({ ...contra, durationMonths: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mensagem (opcional)</label>
                <textarea
                  rows={2}
                  value={contra.message}
                  onChange={(e) => setContra({ ...contra, message: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variante="outline" tamanho="sm" onClick={() => setContraAberto(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button tamanho="sm" carregando={carregando} onClick={() => responder("COUNTER")} className="flex-1">
                  Enviar contraproposta
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
