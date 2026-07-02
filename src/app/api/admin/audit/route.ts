import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const pagina = Number(searchParams.get("pagina") ?? "1");
  const acao = searchParams.get("acao") ?? "";
  const porPagina = 30;

  const where = acao ? { action: { contains: acao } } : {};

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        admin: { include: { profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, paginas: Math.ceil(total / porPagina) });
}
