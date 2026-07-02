"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface PixDisplayProps {
  paymentId: string;
  qrCode: string;
  qrCodeBase64?: string;
  expiresAt: string;
  faturaId: string;
  onPago: () => void;
}

export function PixDisplay({ paymentId, qrCode, qrCodeBase64, expiresAt, faturaId, onPago }: PixDisplayProps) {
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState("");
  const [verificando, setVerificando] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    });
  }

  // Countdown até expirar
  useEffect(() => {
    const calcular = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTempoRestante("Expirado"); return; }
      const min = Math.floor(diff / 60000);
      const seg = Math.floor((diff % 60000) / 1000);
      setTempoRestante(`${min}:${String(seg).padStart(2, "0")}`);
    };
    calcular();
    const id = setInterval(calcular, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  // Polling de status a cada 5s
  const verificarStatus = useCallback(async () => {
    setVerificando(true);
    try {
      const res = await fetch(`/api/payments/status/${paymentId}`);
      const data = await res.json();
      if (data.invoiceStatus === "PAID") onPago();
    } catch {}
    setVerificando(false);
  }, [paymentId, onPago]);

  useEffect(() => {
    const id = setInterval(verificarStatus, 5000);
    return () => clearInterval(id);
  }, [verificarStatus]);

  return (
    <div className="space-y-5">
      {/* QR Code */}
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          {qrCodeBase64 ? (
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="h-48 w-48"
            />
          ) : (
            <div className="h-48 w-48 flex items-center justify-center bg-slate-100 rounded-xl">
              <p className="text-xs text-slate-500 text-center px-4">
                QR Code disponível em produção com MP configurado
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Expira em <strong className="text-slate-900 dark:text-slate-100">{tempoRestante}</strong></span>
        </div>
      </div>

      {/* Pix Copia e Cola */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Pix Copia e Cola</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300 break-all select-all overflow-hidden">
            {qrCode || "Código gerado em produção"}
          </div>
          <Button onClick={copiar} variante="outline" className="shrink-0 gap-1.5">
            {copiado ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>

      <Alert tipo="info">
        <strong>Como pagar:</strong> Abra seu banco, vá em Pix, escolha "Pix Copia e Cola" ou escaneie o QR code acima. Após o pagamento, esta página atualizará automaticamente.
      </Alert>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <RefreshCw className={`h-3.5 w-3.5 ${verificando ? "animate-spin" : ""}`} />
        <span>Verificando pagamento automaticamente…</span>
      </div>
    </div>
  );
}
