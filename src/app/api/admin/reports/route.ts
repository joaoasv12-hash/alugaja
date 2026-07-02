import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") ?? "PENDING";
  const pagina = Number(searchParams.get("pagina") ?? "1");
  const porPagina = 20;

  const where: Prisma.ReportWhereInput = {
    status: status as Prisma.EnumReportStatusFilter,
  };

  const [denuncias, total] = await Promise.all([
    db.report.findMany({
      where,
      include: {
        reporter: { include: { profile: { select: { name: true } } } },
        property: { select: { id: true, title: true, slug: true } },
        targetUser: { include: { profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: "asc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.report.count({ where }),
  ]);

  return NextResponse.json({ denuncias, total, paginas: Math.ceil(total / porPagina) });
}
