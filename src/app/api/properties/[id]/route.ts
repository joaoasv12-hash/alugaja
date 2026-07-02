import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { imovelSchema } from "@/lib/validations/property";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/properties/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const imovel = await db.property.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } }, landlord: { include: { profile: true } } },
  });
  if (!imovel) return NextResponse.json({ erro: "Imóvel não encontrado." }, { status: 404 });
  return NextResponse.json(imovel);
}

// PATCH /api/properties/[id]
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const imovel = await db.property.findUnique({ where: { id } });

  if (!imovel) return NextResponse.json({ erro: "Imóvel não encontrado." }, { status: 404 });
  if (imovel.landlordId !== session.user.id && !session.user.roles.includes("SUPER_ADMIN")) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json();
  const resultado = imovelSchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ erro: "Dados inválidos.", detalhes: resultado.error.flatten() }, { status: 422 });
  }

  const dados = resultado.data;

  await db.$transaction([
    db.propertyPhoto.deleteMany({ where: { propertyId: id } }),
    db.property.update({
      where: { id },
      data: {
        title: dados.title,
        description: dados.description,
        type: dados.type,
        rentPrice: dados.rentPrice,
        condoFee: dados.condoFee ?? null,
        iptu: dados.iptu ?? null,
        area: dados.area,
        bedrooms: dados.bedrooms,
        bathrooms: dados.bathrooms,
        parkingSpots: dados.parkingSpots,
        isFurnished: dados.isFurnished,
        acceptsPets: dados.acceptsPets,
        zipCode: dados.zipCode.replace(/\D/g, ""),
        street: dados.street,
        number: dados.number,
        complement: dados.complement ?? null,
        neighborhood: dados.neighborhood,
        city: dados.city,
        state: dados.state,
        latitude: dados.latitude ?? null,
        longitude: dados.longitude ?? null,
        photos: { create: dados.photos.map((url, i) => ({ url, order: i })) },
        // Volta para revisão se não for admin
        status: session.user.roles.includes("SUPER_ADMIN") ? imovel.status : "UNDER_REVIEW",
      },
    }),
  ]);

  return NextResponse.json({ mensagem: "Imóvel atualizado." });
}

// DELETE /api/properties/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const imovel = await db.property.findUnique({ where: { id } });

  if (!imovel) return NextResponse.json({ erro: "Imóvel não encontrado." }, { status: 404 });
  if (imovel.landlordId !== session.user.id && !session.user.roles.includes("SUPER_ADMIN")) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  await db.property.delete({ where: { id } });
  return NextResponse.json({ mensagem: "Imóvel removido." });
}
