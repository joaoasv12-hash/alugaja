import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const busca = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const role = searchParams.get("role") ?? "";
  const pagina = Number(searchParams.get("pagina") ?? "1");
  const porPagina = 20;

  const where: Prisma.UserWhereInput = {
    ...(busca && {
      OR: [
        { email: { contains: busca, mode: "insensitive" } },
        { profile: { name: { contains: busca, mode: "insensitive" } } },
      ],
    }),
    ...(status && { status: status as Prisma.EnumUserStatusFilter }),
    ...(role && { roles: { has: role as "TENANT" | "LANDLORD" | "SUPER_ADMIN" } }),
  };

  const [usuarios, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        profile: { select: { name: true, avatarUrl: true, isVerified: true } },
        _count: { select: { properties: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ usuarios, total, paginas: Math.ceil(total / porPagina) });
}
