"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Send } from "lucide-react";
import { TIPOS_CONTRATO } from "@/constants";

interface PublicarContratoProps {
  contratoId: string;
  tipoAtual: string;
}

const INDICES = ["IGPM", "IPCA", "OTHER"] as const;
const INDICES_LABEL: Record<string, string> = {
  IGPM: "IGP-M",
  IPCA: "IPCA",
  OTHER: "Outro",
};

export function PublicarContrato({ contratoId, tipoAtual }: PublicarContratoProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState(tipoAtual);
  const [indice, setIndice] = useState("IGPM");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function publicar() {
    setErro(null);
    setCarregando(true);
    const res = await fetch(`/api/contracts/${contratoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateType: tipo, adjustmentIndex: indice, publish: true }),
    });
    const json = await res.json();
    setCarregando(false);
    if (!res.ok) {
      setErro(json.erro ?? "Erro ao publicar contrato.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {erro && <Alert tipo="erro">{erro}</Alert>}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Modelo de contrato
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {Object.entries(TIPOS_CONTRATO).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Índice de reajuste anual
        </label>
        <select
          value={indice}
          onChange={(e) => setIndice(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {INDICES.map((i) => <option key={i} value={i}>{INDICES_LABEL[i]}</option>)}
        </select>
      </div>

      <Alert tipo="aviso">
        Ao publicar, o contrato será bloqueado para edição. Ambas as partes receberão notificação para assinar.
      </Alert>

      <Button onClick={publicar} carregando={carregando} className="w-full gap-2">
        <Send className="h-4 w-4" />
        Publicar para assinatura
      </Button>
    </div>
  );
}
