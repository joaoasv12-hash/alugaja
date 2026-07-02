"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Bed, Bath, Car, Maximize2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatarMoeda } from "@/lib/utils";
import { TIPOS_IMOVEL } from "@/constants";

interface ImovelCardProps {
  id: string;
  slug: string;
  title: string;
  type: string;
  rentPrice: number;
  condoFee?: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  isFurnished: boolean;
  acceptsPets: boolean;
  neighborhood: string;
  city: string;
  state: string;
  fotos: { url: string }[];
  favoritado?: boolean;
  patrocinado?: boolean;
  locador?: {
    name?: string | null;
    isVerified?: boolean;
  };
}

export function ImovelCard({
  id,
  slug,
  title,
  type,
  rentPrice,
  condoFee,
  area,
  bedrooms,
  bathrooms,
  parkingSpots,
  isFurnished,
  acceptsPets,
  neighborhood,
  city,
  state,
  fotos,
  favoritado: favoritoInicial = false,
  patrocinado = false,
  locador,
}: ImovelCardProps) {
  const [favoritado, setFavoritado] = useState(favoritoInicial);
  const [carregando, setCarregando] = useState(false);
  const fotoUrl = fotos[0]?.url ?? "/placeholder-imovel.jpg";

  async function toggleFavorito(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCarregando(true);

    const res = await fetch(`/api/properties/${id}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFavoritado(data.favoritado);
    }
    setCarregando(false);
  }

  return (
    <Link href={`/imovel/${slug}`} className="group block">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
        {/* Foto */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-700">
          <Image
            src={fotoUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Botão favorito */}
          <button
            onClick={toggleFavorito}
            disabled={carregando}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full shadow-md transition-all",
              favoritado
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:bg-white"
            )}
            aria-label={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart className={cn("h-4 w-4", favoritado && "fill-current")} />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {patrocinado && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                Patrocinado
              </span>
            )}
            {isFurnished && (
              <span className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">
                Mobiliado
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          {/* Tipo + verificado */}
          <div className="flex items-center justify-between mb-2">
            <Badge cor="azul">{TIPOS_IMOVEL[type as keyof typeof TIPOS_IMOVEL]}</Badge>
            {locador?.isVerified && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Verificado
              </span>
            )}
          </div>

          {/* Título */}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm leading-snug mb-2">
            {title}
          </h3>

          {/* Localização */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{neighborhood}, {city}/{state}</span>
          </div>

          {/* Características */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-3">
            {bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                {bedrooms}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {bathrooms}
            </span>
            {parkingSpots > 0 && (
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                {parkingSpots}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {area}m²
            </span>
            {acceptsPets && <span className="text-emerald-600 dark:text-emerald-400">🐾</span>}
          </div>

          {/* Preço */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatarMoeda(rentPrice)}<span className="text-xs font-normal text-slate-500">/mês</span>
            </p>
            {condoFee && condoFee > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                + {formatarMoeda(condoFee)} condomínio
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
