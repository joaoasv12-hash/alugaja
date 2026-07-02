import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ImovelForm } from "@/components/property/imovel-form";
import { Pencil } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar anúncio — AlugaJá" };

export default async function EditarImovelPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const imovel = await db.property.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (!imovel || imovel.landlordId !== session.user.id) notFound();

  const valoresIniciais = {
    title: imovel.title,
    description: imovel.description,
    type: imovel.type,
    bedrooms: imovel.bedrooms,
    bathrooms: imovel.bathrooms,
    parkingSpots: imovel.parkingSpots,
    area: imovel.area,
    isFurnished: imovel.isFurnished,
    acceptsPets: imovel.acceptsPets,
    rentPrice: Number(imovel.rentPrice),
    condoFee: imovel.condoFee ? Number(imovel.condoFee) : undefined,
    iptu: imovel.iptu ? Number(imovel.iptu) : undefined,
    zipCode: imovel.zipCode,
    street: imovel.street,
    number: imovel.number,
    complement: imovel.complement ?? undefined,
    neighborhood: imovel.neighborhood,
    city: imovel.city,
    state: imovel.state,
    photos: imovel.photos.map((p) => p.url),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Pencil className="h-6 w-6" />
          Editar anúncio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{imovel.title}</p>
      </div>

      <ImovelForm imovelId={id} valoresIniciais={valoresIniciais} />
    </div>
  );
}
