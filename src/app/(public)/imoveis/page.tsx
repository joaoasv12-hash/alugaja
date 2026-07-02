import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { buscaSchema } from "@/lib/validations/property";
import { buscarImoveis, buscarImoveisMapa } from "@/lib/services/property-service";
import { ImovelCard } from "@/components/property/property-card";
import { FiltrosBusca } from "@/components/search/filtros-busca";
import { Button } from "@/components/ui/button";
import { Building2, Map, List } from "lucide-react";
import Link from "next/link";

// Mapa carregado apenas no cliente (Leaflet não tem SSR)
const MapaImoveis = dynamic(
  () => import("@/components/map/mapa-imoveis").then((m) => m.MapaImoveis),
  { ssr: false, loading: () => <div className="h-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" /> }
);

export const metadata: Metadata = { title: "Buscar imóveis" };

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ImoveisPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filtros = buscaSchema.parse(sp);
  const modoMapa = sp.modo === "mapa";

  const [resultado, pinsDoMapa] = await Promise.all([
    buscarImoveis(filtros),
    modoMapa ? buscarImoveisMapa(filtros) : Promise.resolve([]),
  ]);

  const { imoveis, total, paginas, pagina } = resultado;

  return (
    <div className="min-h-screen">
      {/* Header com filtros */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 px-4 py-3">
        <div className="container mx-auto">
          <Suspense>
            <FiltrosBusca />
          </Suspense>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Barra de resultados */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-100">{total}</strong>{" "}
            {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
            {filtros.cidade && ` em ${filtros.cidade}`}
          </p>

          {/* Toggle lista/mapa */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <Link
              href={`?${new URLSearchParams({ ...sp, modo: "lista" })}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                !modoMapa
                  ? "bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </Link>
            <Link
              href={`?${new URLSearchParams({ ...sp, modo: "mapa" })}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                modoMapa
                  ? "bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Map className="h-3.5 w-3.5" /> Mapa
            </Link>
          </div>
        </div>

        {modoMapa ? (
          /* Vista de mapa */
          <div className="h-[calc(100vh-240px)] min-h-[500px]">
            <MapaImoveis
              imoveis={pinsDoMapa.map((im) => ({
                id: im.id,
                slug: im.slug,
                title: im.title,
                rentPrice: Number(im.rentPrice),
                type: im.type,
                latitude: im.latitude!,
                longitude: im.longitude!,
                fotos: im.photos,
              }))}
            />
          </div>
        ) : imoveis.length === 0 ? (
          /* Estado vazio */
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Nenhum imóvel encontrado
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Tente ajustar os filtros ou buscar em outra cidade.
            </p>
            <Link href="/imoveis">
              <Button variante="outline">Ver todos os imóveis</Button>
            </Link>
          </div>
        ) : (
          /* Grid de cards */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {imoveis.map((im) => (
                <ImovelCard
                  key={im.id}
                  id={im.id}
                  slug={im.slug}
                  title={im.title}
                  type={im.type}
                  rentPrice={Number(im.rentPrice)}
                  condoFee={im.condoFee ? Number(im.condoFee) : null}
                  area={im.area}
                  bedrooms={im.bedrooms}
                  bathrooms={im.bathrooms}
                  parkingSpots={im.parkingSpots}
                  isFurnished={im.isFurnished}
                  acceptsPets={im.acceptsPets}
                  neighborhood={im.neighborhood}
                  city={im.city}
                  state={im.state}
                  fotos={im.photos}
                  patrocinado={im.sponsorships.length > 0}
                  locador={im.landlord.profile ?? undefined}
                />
              ))}
            </div>

            {/* Paginação */}
            {paginas > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`?${new URLSearchParams({ ...sp, pagina: String(p) })}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === pagina
                        ? "bg-emerald-600 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
