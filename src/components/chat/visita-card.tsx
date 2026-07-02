"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

interface VisitaCardProps {
  visita: {
    id: string;
    proposedTimes: string[];
    confirmedTime?: string | null;
    status: string;
    notes?: string | null;
  };
  conversationId: string;
  isLocador: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando confirmação",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  CONFIRMED: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
  CANCELLED: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  COMPLETED: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
};

export function VisitaCard({ visita, conversationId, isLocador }: VisitaCardProps) {
  const router = useRouter();
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function responder(action: "CONFIRM" | "CANCEL") {
    if (action === "CONFIRM" && !horarioSelecionado) {
      alert("Selecione um horário para confirmar.");
      return;
    }
    setCarregando(true);
    await fetch(`/api/conversations/${conversationId}/visits/${visita.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, confirmedTime: horarioSelecionado }),
    });
    setCarregando(false);
    router.refresh();
  }

  const formatarData = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={`border rounded-xl p-4 mt-2 ${STATUS_COLOR[visita.status] ?? STATUS_COLOR.PENDING}`}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Solicitação de visita</p>
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {STATUS_LABEL[visita.status]}
        </span>
      </div>

      {visita.status === "CONFIRMED" && visita.confirmedTime ? (
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm font-medium">{formatarData(visita.confirmedTime)}</p>
        </div>
      ) : visita.status === "CANCELLED" ? (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4" />
          <p className="text-sm">Visita cancelada</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Horários propostos:</p>
          <div className="space-y-1 mb-3">
            {visita.proposedTimes.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                {isLocador ? (
                  <input
                    type="radio"
                    name={`visita-${visita.id}`}
                    value={t}
                    checked={horarioSelecionado === t}
                    onChange={() => setHorarioSelecionado(t)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
                <span className="text-sm text-slate-700 dark:text-slate-300">{formatarData(t)}</span>
              </label>
            ))}
          </div>

          {visita.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">"{visita.notes}"</p>
          )}

          {isLocador && (
            <div className="flex gap-2">
              <Button
                tamanho="sm"
                variante="outline"
                carregando={carregando}
                onClick={() => responder("CONFIRM")}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirmar
              </Button>
              <Button
                tamanho="sm"
                variante="ghost"
                carregando={carregando}
                onClick={() => responder("CANCEL")}
                className="text-red-600 hover:text-red-700 gap-1.5"
              >
                <XCircle className="h-3.5 w-3.5" />
                Recusar
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
