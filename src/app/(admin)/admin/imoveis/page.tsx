export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { formatarData, formatarMoeda } from "@/lib/utils";
import Link from "next/link";
import { Home, MapPin, User } from "lucide-react";
import { PropertyModerationActions } from "@/components/admin/property-moderation-actions";
import { Prisma } from "@/generated/prisma/client";

interface Props {
  searchParams: Promise<{ status?: string; q?: string; pagina?: string }>;
}

const statusCor: Record<string, string> = {
  UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  PAUSED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  RENTED: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default async function AdminImoveisPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status ?? "UNDER_REVIEW";
  const busca = sp.q ?? "";
  const pagina = Number(sp.pagina ?? "1");
  const porPagina = 20;

  const where: Prisma.PropertyWhereInput = {
    status: status as Prisma.EnumPropertyStatusFilter,
    ...(busca && {
      OR: [
        { title: { contains: busca, mode: "insensitive" } },
        { city: { contains: busca, mode: "insensitive" } },
      ],
    }),
  };

  const [imoveis, total] = await Promise.all([
    db.property.findMany({
      where,
      include: {
        landlord: { include: { profile: { select: { name: true } } } },
        photos: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.property.count({ where }),
  ]);

  const paginas = Math.ceil(total / porPagina);
  const pendentes = await db.property.count({ where: { status: "UNDER_REVIEW" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Moderação de imóveis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pendentes > 0 ? `${pendentes} imóvel(is) aguardando aprovação` : "Nenhum pendente"} · {total} neste filtro
        </p>
      </div>

      {/* Filtros rápidos de status */}
      <div className="flex gap-2 flex-wrap">
        {["UNDER_REVIEW", "ACTIVE", "DRAFT", "PAUSED", "RENTED"].map((s) => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              status === s
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            {s === "UNDER_REVIEW" ? "Aguardando revisão" : s}
          </Link>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {imoveis.length === 0 && (
          <div className="text-center py-16">
            <Home className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum imóvel com este status.</p>
          </div>
        )}
        {imoveis.map((imovel) => (
          <div
            key={imovel.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
          >
            <div className="flex gap-4">
              {/* Foto */}
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                {imovel.photos[0] ? (
                  <img src={imovel.photos[0].url} alt={imovel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    href={`/imovel/${imovel.slug}`}
                    target="_blank"
                    className="font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 truncate"
                  >
                    {imovel.title}
                  </Link>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusCor[imovel.status]}`}>
                    {imovel.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                  <MapPin className="h-3 w-3" />
                  {imovel.city}, {imovel.state}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                  <User className="h-3 w-3" />
                  {imovel.landlord.profile?.name ?? imovel.landlord.email}
                  <span className="mx-1">·</span>
                  {formatarMoeda(Number(imovel.rentPrice))}/mês
                  <span className="mx-1">·</span>
                  Enviado em {formatarData(imovel.createdAt)}
                </div>

                {status === "UNDER_REVIEW" && (
                  <PropertyModerationActions propertyId={imovel.id} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginas > 1 && (
        <div className="flex gap-2 justify-end text-sm">
          {pagina > 1 && (
            <Link href={`?status=${status}&pagina=${pagina - 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Anterior
            </Link>
          )}
          {pagina < paginas && (
            <Link href={`?status=${status}&pagina=${pagina + 1}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
