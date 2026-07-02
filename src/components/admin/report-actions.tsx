"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Eye } from "lucide-react";

interface Props {
  reportId: string;
  status: string;
}

type Acao = "revisar" | "resolver" | "dispensar";

export function ReportActions({ reportId, status }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<Acao | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function executar(acao: Acao) {
    setCarregando(acao);
    setErro("");
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro"); return; }
      setSucesso("Status atualizado.");
      router.refresh();
    } catch {
      setErro("Erro inesperado.");
    } finally {
      setCarregando(null);
    }
  }

  if (sucesso) return <Alert tipo="sucesso">{sucesso}</Alert>;

  return (
    <div className="space-y-2">
      {erro && <Alert tipo="erro">{erro}</Alert>}
      <textarea
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="Notas internas (opcional)…"
        rows={2}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="flex gap-2">
        {status === "PENDING" && (
          <Button variante="outline" tamanho="sm" onClick={() => executar("revisar")} carregando={carregando === "revisar"} className="gap-1">
            <Eye className="h-3.5 w-3.5" />
            Revisar
          </Button>
        )}
        <Button variante="primary" tamanho="sm" onClick={() => executar("resolver")} carregando={carregando === "resolver"} className="gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Resolver
        </Button>
        <Button variante="outline" tamanho="sm" onClick={() => executar("dispensar")} carregando={carregando === "dispensar"} className="gap-1">
          <XCircle className="h-3.5 w-3.5 text-slate-400" />
          Dispensar
        </Button>
      </div>
    </div>
  );
}
