import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { obterImovelPorSlug } from "@/lib/services/property-service";
import { GaleriaFotos } from "@/components/property/galeria-fotos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_IMOVEL } from "@/constants";
import {
  Bed, Bath, Car, Maximize2, MapPin, CheckCircle2,
  MessageSquare, Star, Shield, AlertTriangle,
} from "lucide-react";
import { BotaoFavorito } from "@/components/property/botao-favorito";
import { SimuladorCustos } from "@/components/property/simulador-custos";
import { MapaCliente } from "@/components/map/mapa-cliente";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const imovel = await obterImovelPorSlug(slug);
  if (!imovel) return { title: "Imóvel não encontrado" };

  return {
    title: imovel.title,
    description: imovel.description.slice(0, 160),
    openGraph: {
      title: imovel.title,
      description: imovel.description.slice(0, 160),
      images: imovel.photos[0]?.url ? [imovel.photos[0].url] : [],
    },
  };
}

export default async function ImovelPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const imovel = await obterImovelPorSlug(slug, session?.user.id);
  if (!imovel) notFound();

  const totalCusto = Number(imovel.rentPrice) + Number(imovel.condoFee ?? 0) + Number(imovel.iptu ?? 0);
  const isProprietario = session?.user.id === imovel.landlordId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <Link href="/" className="hover:text-emerald-600">Início</Link>
        <span>/</span>
        <Link href="/imoveis" className="hover:text-emerald-600">Imóveis</Link>
        <span>/</span>
        <Link href={`/imoveis?cidade=${imovel.city}`} className="hover:text-emerald-600">{imovel.city}</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-100 truncate max-w-48">{imovel.title}</span>
      </nav>

      {/* Galeria */}
      <div className="relative mb-8">
        <GaleriaFotos fotos={imovel.photos} titulo={imovel.title} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título e badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge cor="azul">{TIPOS_IMOVEL[imovel.type as keyof typeof TIPOS_IMOVEL]}</Badge>
              {imovel.sponsorships.length > 0 && <Badge cor="amarelo">Patrocinado</Badge>}
              {imovel.isFurnished && <Badge cor="verde">Mobiliado</Badge>}
              {imovel.acceptsPets && <Badge cor="verde">Aceita pets 🐾</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {imovel.title}
            </h1>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              <span>{imovel.street}, {imovel.number}{imovel.complement ? `, ${imovel.complement}` : ""} — {imovel.neighborhood}, {imovel.city}/{imovel.state}</span>
            </div>
          </div>

          {/* Características */}
          <Card>
            <CardBody>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icone: Maximize2, label: `${imovel.area} m²`, sub: "Área" },
                  { icone: Bed, label: `${imovel.bedrooms} quarto${imovel.bedrooms !== 1 ? "s" : ""}`, sub: "Quartos" },
                  { icone: Bath, label: `${imovel.bathrooms} banheiro${imovel.bathrooms !== 1 ? "s" : ""}`, sub: "Banheiros" },
                  { icone: Car, label: `${imovel.parkingSpots} vaga${imovel.parkingSpots !== 1 ? "s" : ""}`, sub: "Estacionamento" },
                ].map(({ icone: Icone, label, sub }) => (
                  <div key={sub} className="flex flex-col items-center text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Icone className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Descrição */}
          <Card>
            <CardBody>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Descrição</h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {imovel.description}
              </p>
            </CardBody>
          </Card>

          {/* Simulador de custos */}
          <SimuladorCustos
            aluguel={Number(imovel.rentPrice)}
            condominio={Number(imovel.condoFee ?? 0)}
            iptu={Number(imovel.iptu ?? 0)}
          />

          {/* Mapa */}
          {imovel.latitude && imovel.longitude && (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Localização
                </h2>
                <div className="h-64 rounded-xl overflow-hidden">
                  <MapaCliente
                    imoveis={[{
                      id: imovel.id,
                      slug: imovel.slug,
                      title: imovel.title,
                      rentPrice: Number(imovel.rentPrice),
                      type: imovel.type,
                      latitude: imovel.latitude,
                      longitude: imovel.longitude,
                      fotos: imovel.photos,
                    }]}
                    centro={[imovel.latitude, imovel.longitude]}
                    zoom={15}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Endereço exato compartilhado após agendamento de visita.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Avaliações do locador */}
          {imovel.landlord.reviewsReceived.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  Avaliações do locador
                </h2>
                <div className="space-y-4">
                  {imovel.landlord.reviewsReceived.map((av) => (
                    <div key={av.id} className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                        {av.reviewer.profile?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {av.reviewer.profile?.name ?? "Usuário"}
                        </p>
                        <div className="flex gap-0.5 my-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < av.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                          ))}
                        </div>
                        {av.comment && <p className="text-sm text-slate-600 dark:text-slate-400">{av.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Denuncia */}
          <div className="text-center">
            <Link href={`/denunciar?propertyId=${imovel.id}`} className="text-xs text-slate-400 hover:text-red-500 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Denunciar este anúncio
            </Link>
          </div>
        </div>

        {/* Sidebar de contato */}
        <div className="space-y-4">
          {/* Card de preço e ação */}
          <Card className="sticky top-24">
            <CardBody className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(Number(imovel.rentPrice))}
                  <span className="text-base font-normal text-slate-500">/mês</span>
                </p>
                {(imovel.condoFee || imovel.iptu) && (
                  <div className="mt-1 text-sm text-slate-500 space-y-0.5">
                    {imovel.condoFee && <p>+ {formatarMoeda(Number(imovel.condoFee))} condomínio</p>}
                    {imovel.iptu && <p>+ {formatarMoeda(Number(imovel.iptu))} IPTU</p>}
                    <p className="font-medium text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                      Total: {formatarMoeda(totalCusto)}/mês
                    </p>
                  </div>
                )}
              </div>

              {isProprietario ? (
                <Alert tipo="info">
                  Este é o seu anúncio.{" "}
                  <Link href={`/locador/imoveis/${imovel.id}`} className="underline font-medium">
                    Gerenciar
                  </Link>
                </Alert>
              ) : (
                <>
                  <BotaoFavorito propertyId={imovel.id} favoritoInicial={imovel.favoritado} />

                  {session ? (
                    <Link href={`/mensagens?propertyId=${imovel.id}`}>
                      <Button className="w-full gap-2" tamanho="lg">
                        <MessageSquare className="h-4 w-4" />
                        Entrar em contato
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/login?callbackUrl=/imovel/${imovel.slug}`}>
                      <Button className="w-full gap-2" tamanho="lg">
                        <MessageSquare className="h-4 w-4" />
                        Fazer login para contatar
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Locador */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Anunciado por</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm shrink-0">
                    {imovel.landlord.profile?.name?.[0]?.toUpperCase() ?? "L"}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1">
                      {imovel.landlord.profile?.name ?? "Locador"}
                      {imovel.landlord.profile?.isVerified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </p>
                    {imovel.landlord.profile?.rating && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        {imovel.landlord.profile.rating.toFixed(1)} ({imovel.landlord.profile.reviewCount} avaliações)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                  <Shield className="h-4 w-4" />
                  <p className="text-xs font-semibold">Negocie com segurança</p>
                </div>
                <ul className="text-xs text-emerald-700/80 dark:text-emerald-400 space-y-1">
                  <li>• Nunca pague antes de visitar o imóvel</li>
                  <li>• Use o chat da plataforma</li>
                  <li>• Assine contratos digitais pelo AlugaJá</li>
                  <li>
                    <Link href="/dicas-seguranca" className="underline">
                      Ver mais dicas de segurança
                    </Link>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
