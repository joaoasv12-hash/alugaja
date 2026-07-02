"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function AssinarProButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function assinar() {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/pro/subscribe", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao criar assinatura"); return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-3">
      {erro && <Alert tipo="erro">{erro}</Alert>}
      <Button onClick={assinar} carregando={carregando} className="w-full" tamanho="lg">
        <Zap className="h-4 w-4" />
        Assinar Pro — R$49,90/mês
      </Button>
    </div>
  );
}
