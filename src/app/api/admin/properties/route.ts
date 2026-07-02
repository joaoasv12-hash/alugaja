import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") ?? "UNDER_REVIEW";
  const busca = searchParams.get("q") ?? "";
  const pagina = Number(searchParams.get("pagina") ?? "1");
  const porPagina = 20;

  const where: Prisma.PropertyWhereInput = {
    status: status as Prisma.EnumPropertyStatusFilter,
    ...(busca && {
      OR: [
        { title: { contains: busca, mode: "insensitive" } },
        { city: { contains: busca, mode: "insensitive" } },
        { landlord: { profile: { name: { contains: busca, mode: "insensitive" } } } },
      ],
    }),
  };

  const [imoveis, total] = await Promise.all([
    db.property.findMany({
      where,
      include: {
        landlord: { include: { profile: { select: { name: true, avatarUrl: true } } } },
        photos: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { favorites: true, conversations: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.property.count({ where }),
  ]);

  return NextResponse.json({ imoveis, total, paginas: Math.ceil(total / porPagina) });
}
