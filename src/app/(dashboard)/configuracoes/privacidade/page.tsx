"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function PrivacidadePage() {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("");
  const [erro, setErro] = useState("");
  const [exportando, setExportando] = useState(false);

  async function exportarDados() {
    setExportando(true);
    try {
      const res = await fetch("/api/lgpd/export");
      if (!res.ok) { setErro("Erro ao exportar dados."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alugaja-meus-dados-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Erro inesperado ao exportar.");
    } finally {
      setExportando(false);
    }
  }

  async function excluirConta() {
    if (confirmacaoTexto !== "EXCLUIR MINHA CONTA") {
      setErro('Digite exatamente "EXCLUIR MINHA CONTA" para confirmar.');
      return;
    }
    setExcluindo(true);
    setErro("");
    try {
      const res = await fetch("/api/lgpd/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setErro(data.erro ?? "Erro ao excluir conta"); setExcluindo(false); return; }
      await signOut({ callbackUrl: "/" });
    } catch {
      setErro("Erro inesperado.");
      setExcluindo(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Privacidade e dados</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Gerencie seus dados pessoais conforme a LGPD (Lei n.º 13.709/2018).
        </p>
      </div>

      {erro && <Alert tipo="erro">{erro}</Alert>}

      {/* Exportar dados */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 shrink-0">
            <Download className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Exportar meus dados</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Baixe uma cópia de todos os seus dados pessoais armazenados na plataforma em formato JSON.
              Inclui perfil, imóveis, faturas, contratos e histórico de avaliações.
            </p>
            <Button variante="outline" onClick={exportarDados} carregando={exportando} className="gap-1.5">
              <Download className="h-4 w-4" />
              Exportar dados
            </Button>
          </div>
        </div>
      </div>

      {/* Excluir conta */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950 shrink-0">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Excluir minha conta</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Remove permanentemente seus dados pessoais (nome, e-mail, telefone, documentos).
              Registros financeiros são anonimizados e mantidos por exigência legal.
              <strong className="text-red-600 dark:text-red-400"> Esta ação é irreversível.</strong>
            </p>

            {!confirmarExclusao ? (
              <Button variante="danger" onClick={() => setConfirmarExclusao(true)} className="gap-1.5">
                <Trash2 className="h-4 w-4" />
                Solicitar exclusão da conta
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert tipo="aviso" titulo="Atenção">
                  Sua conta será anonimizada. Contratos ativos impedem a exclusão.
                </Alert>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                    Digite <strong>EXCLUIR MINHA CONTA</strong> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={confirmacaoTexto}
                    onChange={(e) => setConfirmacaoTexto(e.target.value)}
                    placeholder="EXCLUIR MINHA CONTA"
                    className="w-full rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variante="danger"
                    onClick={excluirConta}
                    carregando={excluindo}
                    disabled={confirmacaoTexto !== "EXCLUIR MINHA CONTA"}
                    className="gap-1.5"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Confirmar exclusão
                  </Button>
                  <Button
                    variante="outline"
                    onClick={() => { setConfirmarExclusao(false); setConfirmacaoTexto(""); setErro(""); }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info LGPD */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Seus direitos pela LGPD</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Acesso aos dados pessoais tratados</li>
          <li>Correção de dados incompletos ou desatualizados</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
          <li>Portabilidade dos dados a outro fornecedor</li>
          <li>Revogação do consentimento a qualquer momento</li>
        </ul>
        <p className="mt-2">
          Dúvidas? Entre em contato com nosso DPO: <a href="mailto:privacidade@alugaja.com.br" className="text-emerald-600 hover:underline">privacidade@alugaja.com.br</a>
        </p>
      </div>
    </div>
  );
}
