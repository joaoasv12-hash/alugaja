"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AvaliarFormProps {
  contractId: string;
  nomeAvaliado: string;
}

export function AvaliarForm({ contractId, nomeAvaliado }: AvaliarFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function enviar() {
    if (rating === 0) { setErro("Selecione uma nota de 1 a 5 estrelas."); return; }
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao enviar avaliação"); return; }
      setSucesso(true);
      setTimeout(() => router.push("/contratos"), 2000);
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (sucesso) {
    return (
      <Alert tipo="sucesso" titulo="Avaliação enviada!">
        Obrigado pelo seu feedback. Redirecionando para seus contratos…
      </Alert>
    );
  }

  const labels = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Como você avalia <strong>{nomeAvaliado}</strong>?
        </p>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  n <= (hover || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700 hover:text-amber-300"
                }`}
              />
            </button>
          ))}
          {(hover || rating) > 0 && (
            <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              {labels[hover || rating]}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
          Comentário <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência…"
          rows={4}
          maxLength={1000}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/1000</p>
      </div>

      {erro && <Alert tipo="erro">{erro}</Alert>}

      <Button onClick={enviar} carregando={carregando} className="w-full" tamanho="lg">
        Enviar avaliação
      </Button>
    </div>
  );
}
