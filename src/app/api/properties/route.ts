import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { imovelSchema, buscaSchema } from "@/lib/validations/property";
import { gerarSlug } from "@/lib/utils";
import { buscarImoveis } from "@/lib/services/property-service";

// GET /api/properties — busca pública com filtros
export async function GET(request: NextRequest) {
  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const filtros = buscaSchema.parse(sp);
  const resultado = await buscarImoveis(filtros);
  return NextResponse.json(resultado);
}

// POST /api/properties — cria anúncio (locador autenticado)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  if (!session.user.roles.includes("LANDLORD")) {
    return NextResponse.json({ erro: "Apenas locadores podem criar anúncios." }, { status: 403 });
  }

  // Verifica inadimplência (fatura vencida > 15 dias)
  const faturaVencida = await db.invoice.findFirst({
    where: {
      userId: session.user.id,
      status: "OVERDUE",
      dueDate: { lt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    },
  });
  if (faturaVencida) {
    return NextResponse.json(
      { erro: "Você possui uma fatura vencida há mais de 15 dias. Regularize para criar anúncios." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const resultado = imovelSchema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ erro: "Dados inválidos.", detalhes: resultado.error.flatten() }, { status: 422 });
  }

  const dados = resultado.data;
  const id = crypto.randomUUID().slice(0, 8);
  const slug = gerarSlug(dados.title, dados.city, id);

  // SUPER_ADMIN e verificados vão direto para ACTIVE; outros ficam em UNDER_REVIEW
  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  const statusInicial = session.user.roles.includes("SUPER_ADMIN") || profile?.isVerified
    ? "ACTIVE"
    : "UNDER_REVIEW";

  const imovel = await db.property.create({
    data: {
      landlordId: session.user.id,
      title: dados.title,
      description: dados.description,
      type: dados.type,
      status: statusInicial,
      slug,
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
      photos: {
        create: dados.photos.map((url, i) => ({ url, order: i })),
      },
    },
  });

  return NextResponse.json({ imovel, slug }, { status: 201 });
}
