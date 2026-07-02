"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  propertyId: string;
}

export function PropertyModerationActions({ propertyId }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<"aprovar" | "rejeitar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarRejeitar, setMostrarRejeitar] = useState(false);

  async function executar(acao: "aprovar" | "rejeitar") {
    setCarregando(acao);
    setErro("");
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, motivo }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro"); return; }
      setSucesso(acao === "aprovar" ? "Imóvel aprovado!" : "Imóvel rejeitado.");
      router.refresh();
    } catch {
      setErro("Erro inesperado.");
    } finally {
      setCarregando(null);
    }
  }

  if (sucesso) return <Alert tipo={sucesso.includes("aprovado") ? "sucesso" : "aviso"}>{sucesso}</Alert>;

  return (
    <div className="space-y-3">
      {erro && <Alert tipo="erro">{erro}</Alert>}
      <div className="flex gap-2">
        <Button
          variante="primary"
          tamanho="sm"
          onClick={() => executar("aprovar")}
          carregando={carregando === "aprovar"}
          className="gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          Aprovar
        </Button>
        <Button
          variante="outline"
          tamanho="sm"
          onClick={() => setMostrarRejeitar(!mostrarRejeitar)}
          className="gap-1.5"
        >
          <XCircle className="h-4 w-4 text-red-500" />
          Rejeitar
        </Button>
      </div>
      {mostrarRejeitar && (
        <div className="space-y-2">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo da rejeição (opcional)…"
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Button
            variante="danger"
            tamanho="sm"
            onClick={() => executar("rejeitar")}
            carregando={carregando === "rejeitar"}
          >
            Confirmar rejeição
          </Button>
        </div>
      )}
    </div>
  );
}
