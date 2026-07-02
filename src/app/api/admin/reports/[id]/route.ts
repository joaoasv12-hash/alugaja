import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, registrarAudit } from "@/lib/admin";
import { db } from "@/lib/db";
import { ReportStatus } from "@/generated/prisma/enums";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  const { id } = await params;
  const { acao, adminNotes } = await request.json();

  const acaoStatusMap: Record<string, ReportStatus> = {
    revisar: ReportStatus.UNDER_REVIEW,
    resolver: ReportStatus.RESOLVED,
    dispensar: ReportStatus.DISMISSED,
  };

  if (!acaoStatusMap[acao]) {
    return NextResponse.json({ erro: "Ação inválida" }, { status: 400 });
  }

  const denuncia = await db.report.findUnique({ where: { id } });
  if (!denuncia) return NextResponse.json({ erro: "Denúncia não encontrada" }, { status: 404 });

  await db.report.update({
    where: { id },
    data: {
      status: acaoStatusMap[acao],
      adminNotes,
      ...(["resolver", "dispensar"].includes(acao) && { resolvedAt: new Date() }),
    },
  });

  await registrarAudit({
    adminId: session.user.id,
    action: `REPORT_${acao.toUpperCase()}`,
    targetType: "Report",
    targetId: id,
    details: { adminNotes },
  });

  return NextResponse.json({ ok: true });
}
