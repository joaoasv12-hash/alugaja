"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Calendar, FileText, MoreVertical } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AgendarVisitaForm } from "./agendar-visita-form";
import { PropostaForm } from "./proposta-form";
import { VisitaCard } from "./visita-card";
import { PropostaCard } from "./proposta-card";

interface Mensagem {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    profile?: { name?: string | null; avatarUrl?: string | null } | null;
  };
}

interface VisitaData {
  id: string;
  proposedTimes: string[];
  confirmedTime?: string | null;
  status: string;
  notes?: string | null;
}

interface PropostaData {
  id: string;
  rentValue: number | string;
  entryDate: string;
  durationMonths: number;
  guarantee: string;
  status: string;
  counterOffers: {
    id: string;
    rentValue?: number | string | null;
    entryDate?: string | null;
    durationMonths?: number | null;
    message?: string | null;
    createdAt: string;
    fromUser: { profile?: { name?: string | null } | null };
  }[];
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  isLocador: boolean;
  property: {
    id: string;
    title: string;
    rentPrice: number;
    landlordId: string;
  };
  mensagensIniciais: Mensagem[];
  visitasIniciais: VisitaData[];
  propostasIniciais: PropostaData[];
}

export function ChatWindow({
  conversationId,
  currentUserId,
  isLocador,
  property,
  mensagensIniciais,
  visitasIniciais,
  propostasIniciais,
}: ChatWindowProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensIniciais);
  const [visitas, setVisitas] = useState<VisitaData[]>(visitasIniciais);
  const [propostas, setPropostas] = useState<PropostaData[]>(propostasIniciais);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarVisitaForm, setMostrarVisitaForm] = useState(false);
  const [mostrarPropostaForm, setMostrarPropostaForm] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const ultimaRef = useRef<string | null>(null);

  const scrollParaBaixo = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollParaBaixo();
  }, [mensagens, scrollParaBaixo]);

  // Polling a cada 3s para novas mensagens e visitas
  useEffect(() => {
    const poll = async () => {
      try {
        const since = mensagens[mensagens.length - 1]?.createdAt;
        const url = `/api/conversations/${conversationId}/messages${since ? `?since=${encodeURIComponent(since)}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const novas: Mensagem[] = await res.json();
        if (novas.length > 0) {
          setMensagens((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            return [...prev, ...novas.filter((m) => !ids.has(m.id))];
          });
        }
      } catch {/* silencia erros de rede */}
    };

    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [conversationId, mensagens]);

  async function enviarMensagem() {
    if (!texto.trim() || enviando) return;
    const conteudo = texto.trim();
    setTexto("");
    setEnviando(true);

    // Otimista
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Mensagem = {
      id: tempId,
      content: conteudo,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      sender: { profile: null },
    };
    setMensagens((prev) => [...prev, tempMsg]);

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: conteudo }),
    });

    if (res.ok) {
      const nova: Mensagem = await res.json();
      setMensagens((prev) => prev.map((m) => (m.id === tempId ? nova : m)));
    } else {
      // Reverte se falhou
      setMensagens((prev) => prev.filter((m) => m.id !== tempId));
      setTexto(conteudo);
    }
    setEnviando(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  }

  // Agrupa visitas por mensagem de sistema
  const visitaPorId = Object.fromEntries(visitas.map((v) => [v.id, v]));

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensagens.map((msg) => {
          const isMeu = msg.senderId === currentUserId;
          const isSystem = msg.content.startsWith("📅") || msg.content.startsWith("✅") ||
            msg.content.startsWith("❌") || msg.content.startsWith("📋") ||
            msg.content.startsWith("🎉") || msg.content.startsWith("🔄");

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs px-4 py-2 rounded-full max-w-sm text-center">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn("flex items-end gap-2", isMeu ? "flex-row-reverse" : "flex-row")}>
              {/* Avatar */}
              {!isMeu && (
                <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                  {msg.sender.profile?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}

              {/* Balão */}
              <div
                className={cn(
                  "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isMeu
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={cn("text-xs mt-1", isMeu ? "text-emerald-200" : "text-slate-400")}>
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Visitas pendentes */}
        {visitas.filter((v) => v.status === "PENDING" || v.status === "CONFIRMED").map((v) => (
          <div key={v.id} className="mx-2">
            <VisitaCard visita={v} conversationId={conversationId} isLocador={isLocador} />
          </div>
        ))}

        {/* Propostas */}
        {propostas.map((p) => (
          <div key={p.id} className="mx-2">
            <PropostaCard proposta={p} isLocador={isLocador} />
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* Ações rápidas */}
      {!isLocador && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={() => setMostrarVisitaForm(true)}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Agendar visita
          </button>
          <button
            onClick={() => setMostrarPropostaForm(true)}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Enviar proposta
          </button>
        </div>
      )}

      {/* Input de mensagem */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-end gap-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Digite uma mensagem… (Enter para enviar)"
            rows={1}
            maxLength={5000}
            className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
          />
          <Button
            onClick={enviarMensagem}
            carregando={enviando}
            disabled={!texto.trim()}
            className="h-11 w-11 p-0 rounded-xl shrink-0"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modais */}
      {mostrarVisitaForm && (
        <AgendarVisitaForm
          conversationId={conversationId}
          onClose={() => setMostrarVisitaForm(false)}
        />
      )}
      {mostrarPropostaForm && (
        <PropostaForm
          propertyId={property.id}
          landlordId={property.landlordId}
          aluguelSugerido={property.rentPrice}
          onClose={() => setMostrarPropostaForm(false)}
        />
      )}
    </div>
  );
}
