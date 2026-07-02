"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AgendarVisitaFormProps {
  conversationId: string;
  onClose: () => void;
}

export function AgendarVisitaForm({ conversationId, onClose }: AgendarVisitaFormProps) {
  const router = useRouter();
  const [horarios, setHorarios] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const agora = new Date();
  agora.setMinutes(0, 0, 0);
  agora.setHours(agora.getHours() + 2);
  const minDatetime = agora.toISOString().slice(0, 16);

  function adicionarHorario() {
    if (horarios.length < 3) setHorarios([...horarios, ""]);
  }

  function removerHorario(i: number) {
    setHorarios(horarios.filter((_, idx) => idx !== i));
  }

  function atualizarHorario(i: number, value: string) {
    const novos = [...horarios];
    novos[i] = value;
    setHorarios(novos);
  }

  async function enviar() {
    setErro(null);
    const validos = horarios.filter(Boolean);
    if (validos.length === 0) {
      setErro("Adicione ao menos um horário.");
      return;
    }

    setCarregando(true);
    const res = await fetch(`/api/conversations/${conversationId}/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposedTimes: validos.map((h) => new Date(h).toISOString()),
        notes: notes || undefined,
      }),
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao solicitar visita.");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar visita
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Proponha até 3 horários para o locador escolher.
        </p>

        {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

        <div className="space-y-3 mb-4">
          {horarios.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="datetime-local"
                min={minDatetime}
                value={h}
                onChange={(e) => atualizarHorario(i, e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {horarios.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerHorario(i)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {horarios.length < 3 && (
          <button
            type="button"
            onClick={adicionarHorario}
            className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 mb-4"
          >
            <Plus className="h-4 w-4" />
            Adicionar horário alternativo
          </button>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Ex: Prefiro visitar pela manhã, é pet-friendly?"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button variante="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button carregando={carregando} onClick={enviar} className="flex-1">
            Solicitar visita
          </Button>
        </div>
      </div>
    </div>
  );
}
