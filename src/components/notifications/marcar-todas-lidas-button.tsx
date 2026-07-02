"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarcarTodasLidasButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function marcarTodas() {
    setCarregando(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: "all" }),
      });
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button variante="outline" tamanho="sm" onClick={marcarTodas} carregando={carregando} className="gap-1.5">
      <CheckCheck className="h-4 w-4" />
      Marcar todas como lidas
    </Button>
  );
}
