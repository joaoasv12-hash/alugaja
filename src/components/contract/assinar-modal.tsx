"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AssinarModalProps {
  contratoId: string;
  documentHash: string;
  nomeAssinante: string;
  onClose: () => void;
}

export function AssinarModal({ contratoId, documentHash, nomeAssinante, onClose }: AssinarModalProps) {
  const router = useRouter();
  const [confirmado, setConfirmado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function assinar() {
    setErro(null);
    setCarregando(true);
    const res = await fetch(`/api/contracts/${contratoId}/sign`, { method: "POST" });
    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao assinar contrato.");
      return;
    }
    setSucesso(true);
    setTimeout(() => {
      onClose();
      router.refresh();
    }, 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        {sucesso ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Contrato assinado!
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Sua assinatura eletrônica foi registrada com sucesso.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Assinar contrato
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-5 space-y-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Ao assinar, você confirma que:</p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  Leu e compreendeu todas as cláusulas do contrato
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  Concorda com os valores, prazos e condições estabelecidos
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  Esta assinatura eletrônica tem a mesma validade jurídica de uma assinatura física (Lei 14.063/2020)
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Hash do documento</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-mono break-all mt-0.5">
                    {documentHash}
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Confirmo que sou <strong>{nomeAssinante}</strong> e aceito assinar este contrato eletronicamente.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variante="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                disabled={!confirmado}
                carregando={carregando}
                onClick={assinar}
                className="flex-1 gap-2"
              >
                <Shield className="h-4 w-4" />
                Assinar contrato
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
