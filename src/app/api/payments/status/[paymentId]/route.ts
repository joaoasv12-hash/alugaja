import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const payment = await db.payment.findFirst({
    where: { externalId: paymentId, userId: session.user.id },
    include: { invoice: { select: { status: true } } },
  });

  if (!payment) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  return NextResponse.json({ status: payment.status, invoiceStatus: payment.invoice.status });
}
