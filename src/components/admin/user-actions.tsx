"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ShieldCheck, ShieldX, ShieldAlert, UserCheck, Building2 } from "lucide-react";

interface Props {
  userId: string;
  statusAtual: string;
  isVerificado: boolean;
  isLandlord: boolean;
}

type Acao = "ACTIVE" | "SUSPENDED" | "BANNED" | "verify" | "add_landlord" | "remove_landlord";

export function UserActions({ userId, statusAtual, isVerificado, isLandlord }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<Acao | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [motivo, setMotivo] = useState("");
  const [confirmar, setConfirmar] = useState<Acao | null>(null);

  async function executar(acao: Acao) {
    if (["SUSPENDED", "BANNED"].includes(acao) && !motivo) {
      setErro("Informe um motivo para suspender ou banir.");
      return;
    }
    setCarregando(acao);
    setErro("");
    setSucesso("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, motivo }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao executar ação"); return; }
      setSucesso("Ação executada com sucesso.");
      setConfirmar(null);
      setMotivo("");
      router.refresh();
    } catch {
      setErro("Erro inesperado.");
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="space-y-4">
      {erro && <Alert tipo="erro">{erro}</Alert>}
      {sucesso && <Alert tipo="sucesso">{sucesso}</Alert>}

      <div className="grid grid-cols-2 gap-3">
        {statusAtual !== "ACTIVE" && (
          <Button
            variante="outline"
            onClick={() => executar("ACTIVE")}
            carregando={carregando === "ACTIVE"}
            className="gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Reativar conta
          </Button>
        )}
        {statusAtual !== "SUSPENDED" && (
          <Button
            variante="outline"
            onClick={() => setConfirmar("SUSPENDED")}
            className="gap-1.5"
          >
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
            Suspender
          </Button>
        )}
        {statusAtual !== "BANNED" && (
          <Button
            variante="danger"
            onClick={() => setConfirmar("BANNED")}
            className="gap-1.5"
          >
            <ShieldX className="h-4 w-4" />
            Banir usuário
          </Button>
        )}
        {!isVerificado && (
          <Button
            variante="outline"
            onClick={() => executar("verify")}
            carregando={carregando === "verify"}
            className="gap-1.5"
          >
            <UserCheck className="h-4 w-4 text-blue-500" />
            Verificar identidade
          </Button>
        )}
        {!isLandlord && (
          <Button
            variante="outline"
            onClick={() => executar("add_landlord")}
            carregando={carregando === "add_landlord"}
            className="gap-1.5"
          >
            <Building2 className="h-4 w-4 text-violet-500" />
            Tornar locador
          </Button>
        )}
        {isLandlord && (
          <Button
            variante="outline"
            onClick={() => executar("remove_landlord")}
            carregando={carregando === "remove_landlord"}
            className="gap-1.5"
          >
            <Building2 className="h-4 w-4 text-slate-400" />
            Remover locador
          </Button>
        )}
      </div>

      {/* Modal de confirmação com motivo */}
      {confirmar && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 space-y-3">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {confirmar === "BANNED" ? "Banir" : "Suspender"} usuário — informe o motivo:
          </p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo obrigatório…"
            rows={2}
            className="w-full rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-2">
            <Button
              variante="danger"
              tamanho="sm"
              onClick={() => executar(confirmar)}
              carregando={carregando === confirmar}
            >
              Confirmar
            </Button>
            <Button
              variante="outline"
              tamanho="sm"
              onClick={() => { setConfirmar(null); setMotivo(""); }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
