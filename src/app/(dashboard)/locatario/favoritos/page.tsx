import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ImovelCard } from "@/components/property/property-card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Meus favoritos — AlugaJá" };

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const favoritos = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        include: {
          photos: { orderBy: { order: "asc" }, take: 1 },
          landlord: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
          sponsorships: { where: { status: "ACTIVE", expiresAt: { gt: new Date() } }, take: 1 },
        },
      },
    },
  });

  const imoveis = favoritos.map((f) => f.property);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Meus favoritos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            {imoveis.length} {imoveis.length === 1 ? "imóvel salvo" : "imóveis salvos"}
          </p>
        </div>
      </div>

      {imoveis.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum favorito ainda
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Salve imóveis que te interessam para acompanhá-los facilmente.
          </p>
          <Link href="/imoveis">
            <Button variante="outline">Explorar imóveis</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      )}
    </div>
  );
}
