"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PixDisplay } from "./pix-display";
import { formatarMoeda } from "@/lib/utils";

interface EscolherPagamentoProps {
  faturaId: string;
  valor: number;
  descricao: string;
  pagador: { nome: string; email: string; cpf?: string };
}

type Metodo = "PIX" | "CARTAO";

interface PixData {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export function EscolherPagamento({ faturaId, valor, descricao, pagador }: EscolherPagamentoProps) {
  const router = useRouter();
  const [metodo, setMetodo] = useState<Metodo>("PIX");
  const [carregando, setCarregando] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [erro, setErro] = useState("");
  const [pago, setPago] = useState(false);

  async function pagar() {
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faturaId, metodo }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao processar pagamento"); return; }

      if (metodo === "PIX") {
        setPixData({
          paymentId: data.paymentId,
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          expiresAt: data.expiresAt,
        });
      } else {
        // Redireciona para o checkout do Mercado Pago
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (pago) {
    return (
      <Alert tipo="sucesso" titulo="Pagamento confirmado!">
        Seu pagamento de {formatarMoeda(valor)} foi aprovado. Redirecionando…
      </Alert>
    );
  }

  if (pixData) {
    return (
      <PixDisplay
        paymentId={pixData.paymentId}
        qrCode={pixData.qrCode}
        qrCodeBase64={pixData.qrCodeBase64}
        expiresAt={pixData.expiresAt}
        faturaId={faturaId}
        onPago={() => { setPago(true); setTimeout(() => router.refresh(), 2000); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Escolha como deseja pagar <strong>{formatarMoeda(valor)}</strong>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMetodo("PIX")}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
            metodo === "PIX"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "border-slate-200 hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          <QrCode className="h-7 w-7" />
          <span>Pix</span>
          <span className="text-xs font-normal text-slate-500">Aprovação imediata</span>
        </button>

        <button
          onClick={() => setMetodo("CARTAO")}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
            metodo === "CARTAO"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "border-slate-200 hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          <CreditCard className="h-7 w-7" />
          <span>Cartão de crédito</span>
          <span className="text-xs font-normal text-slate-500">Via Mercado Pago</span>
        </button>
      </div>

      {erro && <Alert tipo="erro">{erro}</Alert>}

      <Button onClick={pagar} carregando={carregando} className="w-full" tamanho="lg">
        {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {metodo === "PIX" ? "Gerar QR Code Pix" : "Ir para o checkout"}
      </Button>
    </div>
  );
}
