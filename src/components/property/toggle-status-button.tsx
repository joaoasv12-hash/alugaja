"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

interface ToggleStatusButtonProps {
  propertyId: string;
  statusAtual: string;
}

export function ToggleStatusButton({ propertyId, statusAtual }: ToggleStatusButtonProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const pausado = statusAtual === "PAUSED";

  async function toggleStatus() {
    setCarregando(true);
    await fetch(`/api/properties/${propertyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: pausado ? "ACTIVE" : "PAUSED" }),
    });
    setCarregando(false);
    router.refresh();
  }

  return (
    <Button
      variante={pausado ? "outline" : "ghost"}
      tamanho="sm"
      carregando={carregando}
      onClick={toggleStatus}
      className="gap-1.5"
    >
      {pausado ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
      {pausado ? "Reativar" : "Pausar"}
    </Button>
  );
}
