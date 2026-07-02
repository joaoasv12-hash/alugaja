"use client";
import dynamic from "next/dynamic";

export const MapaCliente = dynamic(
  () => import("@/components/map/mapa-imoveis").then((m) => m.MapaImoveis),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
    ),
  }
);
