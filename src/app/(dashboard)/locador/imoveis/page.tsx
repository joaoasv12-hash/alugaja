import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_IMOVEL } from "@/constants";
import { ToggleStatusButton } from "@/components/property/toggle-status-button";
import {
  Plus, Eye, Pencil, Bed, Bath, Maximize2, Building2,
} from "lucide-react";
import { PropertyStatus } from "@/generated/prisma/enums";

const COR_STATUS: Record<string, "verde" | "amarelo" | "cinza" | "vermelho" | "azul"> = {
  ACTIVE: "verde",
  PAUSED: "amarelo",
  DRAFT: "cinza",
  UNDER_REVIEW: "azul",
  REJECTED: "vermelho",
  RENTED: "cinza",
};

const LABEL_STATUS: Record<string, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  DRAFT: "Rascunho",
  UNDER_REVIEW: "Em análise",
  REJECTED: "Rejeitado",
  RENTED: "Alugado",
};

export default async function MeusImoveisPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const imoveis = await db.property.findMany({
    where: { landlordId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      photos: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { favorites: true, conversations: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Meus imóveis</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {imoveis.length} {imoveis.length === 1 ? "anúncio" : "anúncios"}
          </p>
        </div>
        <Link href="/locador/imoveis/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo anúncio
          </Button>
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum imóvel cadastrado
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Publique seu primeiro anúncio e comece a receber propostas.
          </p>
          <Link href="/locador/imoveis/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar primeiro anúncio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {imoveis.map((im) => {
            const foto = im.photos[0]?.url;
            const podeToggle = im.status === PropertyStatus.ACTIVE || im.status === PropertyStatus.PAUSED;

            return (
              <Card key={im.id}>
                <CardBody className="p-0">
                  <div className="flex gap-0">
                    {/* Foto */}
                    <div className="relative w-40 h-32 shrink-0 rounded-l-2xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                      {foto ? (
                        <Image src={foto} alt={im.title} fill className="object-cover" sizes="160px" />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge cor={COR_STATUS[im.status] ?? "cinza"}>
                              {LABEL_STATUS[im.status] ?? im.status}
                            </Badge>
                            <Badge cor="azul">{TIPOS_IMOVEL[im.type as keyof typeof TIPOS_IMOVEL]}</Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{im.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {im.neighborhood}, {im.city}/{im.state}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {formatarMoeda(Number(im.rentPrice))}<span className="text-xs font-normal text-slate-500">/mês</span>
                        </p>
                      </div>

                      {/* Características e métricas */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{im.area} m²</span>
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{im.bedrooms} qto{im.bedrooms !== 1 ? "s" : ""}</span>
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{im.bathrooms} bnh</span>
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{im.viewCount} views</span>
                        <span>❤️ {im._count.favorites}</span>
                        <span>💬 {im._count.conversations}</span>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/locador/imoveis/${im.id}`}>
                          <Button variante="outline" tamanho="sm" className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/imovel/${im.slug}`} target="_blank">
                          <Button variante="ghost" tamanho="sm" className="gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Ver anúncio
                          </Button>
                        </Link>
                        {podeToggle && (
                          <ToggleStatusButton
                            propertyId={im.id}
                            statusAtual={im.status}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
