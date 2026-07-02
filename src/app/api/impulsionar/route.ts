import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { precoImpulsionamento } from "@/lib/utils";
import { SponsorshipStatus } from "@/generated/prisma/enums";

const DIAS_VALIDOS = [7, 15, 30] as const;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { propertyId, dias } = await request.json();

  if (!propertyId || !DIAS_VALIDOS.includes(dias)) {
    return NextResponse.json({ erro: "propertyId e dias (7, 15 ou 30) são obrigatórios" }, { status: 400 });
  }

  const imovel = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, landlordId: true, title: true },
  });

  if (!imovel || imovel.landlordId !== session.user.id) {
    return NextResponse.json({ erro: "Imóvel não encontrado" }, { status: 404 });
  }

  // Verifica se já há patrocínio ativo
  const patrocinioAtivo = await db.sponsorship.findFirst({
    where: { propertyId, status: SponsorshipStatus.ACTIVE, expiresAt: { gt: new Date() } },
  });
  if (patrocinioAtivo) {
    return NextResponse.json({ erro: "Já existe um patrocínio ativo para este imóvel" }, { status: 409 });
  }

  const preco = precoImpulsionamento(dias as 7 | 15 | 30);
  const vencimento = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias para pagar

  // Cria fatura + patrocínio pendente de forma atômica
  const [fatura, patrocinio] = await db.$transaction([
    db.invoice.create({
      data: {
        userId: session.user.id,
        type: "SPONSORSHIP",
        amount: preco,
        dueDate: vencimento,
        description: `Impulsionamento ${dias} dias — ${imovel.title}`,
      },
    }),
    db.sponsorship.create({
      data: {
        propertyId,
        planDays: dias,
        price: preco,
        status: SponsorshipStatus.PENDING,
      },
    }),
  ]);

  // Vincula o patrocínio à fatura
  await db.sponsorship.update({
    where: { id: patrocinio.id },
    data: { invoiceId: fatura.id },
  });

  return NextResponse.json({ faturaId: fatura.id, patrocinioId: patrocinio.id }, { status: 201 });
}
