"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Grid3x3 } from "lucide-react";

interface GaleriaFotosProps {
  fotos: { url: string; caption?: string | null }[];
  titulo: string;
}

export function GaleriaFotos({ fotos, titulo }: GaleriaFotosProps) {
  const [lightboxAberto, setLightboxAberto] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);

  if (fotos.length === 0) return null;

  function abrir(i: number) {
    setIndiceAtual(i);
    setLightboxAberto(true);
  }

  function navegar(dir: 1 | -1) {
    setIndiceAtual((prev) => (prev + dir + fotos.length) % fotos.length);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") navegar(-1);
    if (e.key === "ArrowRight") navegar(1);
    if (e.key === "Escape") setLightboxAberto(false);
  }

  return (
    <>
      {/* Grade de fotos */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/7] rounded-2xl overflow-hidden">
        {/* Foto principal */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer bg-slate-200 dark:bg-slate-700"
          onClick={() => abrir(0)}
        >
          <Image src={fotos[0].url} alt={titulo} fill className="object-cover hover:brightness-95 transition-all" />
        </div>

        {/* Fotos secundárias */}
        {fotos.slice(1, 5).map((foto, i) => (
          <div
            key={i}
            className="relative cursor-pointer bg-slate-200 dark:bg-slate-700 overflow-hidden"
            onClick={() => abrir(i + 1)}
          >
            <Image src={foto.url} alt={`${titulo} - foto ${i + 2}`} fill className="object-cover hover:brightness-95 transition-all" />
            {/* Botão "ver todas" na última foto */}
            {i === 3 && fotos.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-1">
                <Grid3x3 className="h-5 w-5" />
                <span className="text-sm font-semibold">+{fotos.length - 5} fotos</span>
              </div>
            )}
          </div>
        ))}

        {/* Botão ver todas (desktop) */}
        <button
          onClick={() => abrir(0)}
          className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg shadow border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 hover:shadow-md transition-shadow"
          style={{ position: "absolute" }}
        >
          <Grid3x3 className="h-4 w-4" />
          Ver {fotos.length} fotos
        </button>
      </div>

      {/* Lightbox */}
      {lightboxAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Galeria de fotos"
        >
          <button
            onClick={() => setLightboxAberto(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {indiceAtual + 1} / {fotos.length}
          </p>

          <div className="relative w-full max-w-4xl px-16 aspect-[4/3]">
            <Image
              src={fotos[indiceAtual].url}
              alt={`${titulo} - foto ${indiceAtual + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {fotos.length > 1 && (
            <>
              <button
                onClick={() => navegar(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 bg-black/50 rounded-full"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navegar(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 bg-black/50 rounded-full"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 flex gap-2 overflow-x-auto max-w-lg px-4">
            {fotos.map((f, i) => (
              <button
                key={i}
                onClick={() => setIndiceAtual(i)}
                className={`relative h-12 w-16 shrink-0 rounded overflow-hidden border-2 transition-all ${
                  i === indiceAtual ? "border-emerald-400" : "border-transparent opacity-60"
                }`}
              >
                <Image src={f.url} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
