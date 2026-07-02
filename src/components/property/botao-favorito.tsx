"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotaoFavoritoProps {
  propertyId: string;
  favoritoInicial: boolean;
  className?: string;
}

export function BotaoFavorito({ propertyId, favoritoInicial, className }: BotaoFavoritoProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favoritado, setFavoritado] = useState(favoritoInicial);
  const [carregando, setCarregando] = useState(false);

  async function toggleFavorito() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (carregando) return;
    setCarregando(true);
    const prev = favoritado;
    setFavoritado(!prev);
    const res = await fetch(`/api/properties/${propertyId}/favorite`, { method: "POST" });
    if (!res.ok) setFavoritado(prev);
    setCarregando(false);
  }

  return (
    <button
      onClick={toggleFavorito}
      disabled={carregando}
      aria-label={favoritado ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={cn(
        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
        favoritado
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
          : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", favoritado && "fill-current")} />
      {favoritado ? "Salvo nos favoritos" : "Salvar nos favoritos"}
    </button>
  );
}
