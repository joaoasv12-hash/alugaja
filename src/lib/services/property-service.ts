import { db } from "@/lib/db";
import { BuscaInput } from "@/lib/validations/property";
import { PropertyStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

const POR_PAGINA = 12;

export async function buscarImoveis(filtros: BuscaInput) {
  const { cidade, bairro, tipo, precoMin, precoMax, quartos, aceitaPets, mobiliado, ordenar, pagina } = filtros;

  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.ACTIVE,
    ...(cidade && { city: { contains: cidade, mode: "insensitive" } }),
    ...(bairro && { neighborhood: { contains: bairro, mode: "insensitive" } }),
    ...(tipo && { type: tipo }),
    ...(precoMin !== undefined && { rentPrice: { gte: precoMin } }),
    ...(precoMax !== undefined && { rentPrice: { lte: precoMax } }),
    ...(quartos !== undefined && quartos > 0 && { bedrooms: { gte: quartos } }),
    ...(aceitaPets !== undefined && { acceptsPets: aceitaPets }),
    ...(mobiliado !== undefined && { isFurnished: mobiliado }),
  };

  const orderBy: Prisma.PropertyOrderByWithRelationInput = (() => {
    switch (ordenar) {
      case "preco_asc": return { rentPrice: "asc" as const };
      case "preco_desc": return { rentPrice: "desc" as const };
      case "visualizacoes": return { viewCount: "desc" as const };
      default: return { createdAt: "desc" as const };
    }
  })();

  const skip = (pagina - 1) * POR_PAGINA;

  const [imoveis, total] = await Promise.all([
    db.property.findMany({
      where,
      orderBy,
      skip,
      take: POR_PAGINA,
      include: {
        photos: { orderBy: { order: "asc" }, take: 1 },
        landlord: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
        sponsorships: { where: { status: "ACTIVE", expiresAt: { gt: new Date() } }, take: 1 },
        _count: { select: { favorites: true } },
      },
    }),
    db.property.count({ where }),
  ]);

  return {
    imoveis,
    total,
    paginas: Math.ceil(total / POR_PAGINA),
    pagina,
  };
}

export async function buscarImoveisMapa(filtros: Omit<BuscaInput, "pagina" | "ordenar">) {
  const { cidade, bairro, tipo, precoMin, precoMax, quartos, aceitaPets, mobiliado } = filtros;

  return db.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      latitude: { not: null },
      longitude: { not: null },
      ...(cidade && { city: { contains: cidade, mode: "insensitive" } }),
      ...(bairro && { neighborhood: { contains: bairro, mode: "insensitive" } }),
      ...(tipo && { type: tipo }),
      ...(precoMin !== undefined && { rentPrice: { gte: precoMin } }),
      ...(precoMax !== undefined && { rentPrice: { lte: precoMax } }),
      ...(quartos !== undefined && quartos > 0 && { bedrooms: { gte: quartos } }),
      ...(aceitaPets !== undefined && { acceptsPets: aceitaPets }),
      ...(mobiliado !== undefined && { isFurnished: mobiliado }),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      rentPrice: true,
      type: true,
      latitude: true,
      longitude: true,
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
    take: 200,
  });
}

export async function obterImovelPorSlug(slug: string, userId?: string) {
  const imovel = await db.property.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { order: "asc" } },
      landlord: {
        include: {
          profile: true,
          reviewsReceived: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { reviewer: { include: { profile: { select: { name: true, avatarUrl: true } } } } },
          },
        },
      },
      sponsorships: { where: { status: "ACTIVE", expiresAt: { gt: new Date() } }, take: 1 },
      _count: { select: { favorites: true } },
    },
  });

  if (!imovel) return null;

  // Incrementa visualizações (fire-and-forget)
  db.property.update({ where: { id: imovel.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // Verifica se o usuário favoritou
  let favoritado = false;
  if (userId) {
    const fav = await db.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId: imovel.id } },
    });
    favoritado = !!fav;
  }

  return { ...imovel, favoritado };
}
