"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Upload, X, GripVertical, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadFotosProps {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  erro?: string;
}

export function UploadFotos({ fotos, onChange, erro }: UploadFotosProps) {
  const [carregando, setCarregando] = useState(false);
  const [erroUpload, setErroUpload] = useState<string | null>(null);

  const onDrop = useCallback(
    async (arquivos: File[]) => {
      setErroUpload(null);
      const novos = [...fotos];

      if (novos.length + arquivos.length > 20) {
        setErroUpload("Máximo de 20 fotos por anúncio.");
        return;
      }

      setCarregando(true);

      for (const arquivo of arquivos) {
        const form = new FormData();
        form.append("file", arquivo);

        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const { url } = await res.json();
          novos.push(url);
        } else {
          const { erro } = await res.json();
          setErroUpload(erro ?? "Erro ao enviar foto.");
          break;
        }
      }

      onChange(novos);
      setCarregando(false);
    },
    [fotos, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    disabled: carregando || fotos.length >= 20,
  });

  function removerFoto(i: number) {
    const novas = fotos.filter((_, idx) => idx !== i);
    onChange(novas);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Fotos <span className="text-red-500">*</span>
        <span className="ml-2 text-xs text-slate-500">({fotos.length}/20 — mín. 3)</span>
      </label>

      {/* Grid de fotos existentes */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {fotos.map((url, i) => (
            <div key={url} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 group">
              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="150px" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded">
                  Capa
                </div>
              )}
              <button
                type="button"
                onClick={() => removerFoto(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {fotos.length < 20 && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950"
              : "border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
            carregando && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isDragActive
              ? "Solte as fotos aqui…"
              : carregando
              ? "Enviando…"
              : "Arraste fotos ou clique para selecionar"}
          </p>
          <p className="text-xs text-slate-400 mt-1">JPEG, PNG ou WebP · Máx. 10 MB cada</p>
        </div>
      )}

      {(erro || erroUpload) && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {erro ?? erroUpload}
        </div>
      )}
    </div>
  );
}
