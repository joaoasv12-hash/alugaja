"use client";

import { useEffect, useRef } from "react";
import { formatarMoeda } from "@/lib/utils";

interface PinImovel {
  id: string;
  slug: string;
  title: string;
  rentPrice: number;
  type: string;
  latitude: number;
  longitude: number;
  fotos: { url: string }[];
}

interface MapaImoveisProps {
  imoveis: PinImovel[];
  centro?: [number, number];
  zoom?: number;
}

export function MapaImoveis({ imoveis, centro = [-15.78, -47.93], zoom = 5 }: MapaImoveisProps) {
  const mapaRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);

  useEffect(() => {
    if (!mapaRef.current || leafletRef.current) return;

    // Importação dinâmica do Leaflet (só no cliente)
    import("leaflet").then((L) => {
      // Fix ícone padrão no Next.js
      // @ts-expect-error _getIconUrl é interno do Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const mapa = L.map(mapaRef.current!).setView(centro, zoom);
      leafletRef.current = mapa;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);

      imoveis.forEach((im) => {
        const marker = L.marker([im.latitude, im.longitude]).addTo(mapa);
        marker.bindPopup(`
          <div style="width:200px;">
            ${im.fotos[0] ? `<img src="${im.fotos[0].url}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ""}
            <p style="font-weight:600;font-size:13px;margin:0 0 4px;">${im.title}</p>
            <p style="color:#059669;font-weight:700;font-size:14px;margin:0 0 8px;">${formatarMoeda(im.rentPrice)}/mês</p>
            <a href="/imovel/${im.slug}" style="display:block;text-align:center;background:#059669;color:white;padding:6px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500;">
              Ver imóvel
            </a>
          </div>
        `);
      });

      // Ajusta zoom para mostrar todos os pins
      if (imoveis.length > 1) {
        const bounds = L.latLngBounds(imoveis.map((im) => [im.latitude, im.longitude]));
        mapa.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapaRef} className="h-full w-full rounded-xl" />
    </>
  );
}
