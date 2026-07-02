import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { propostaSchema } from "@/lib/validations/conversation";
import { criarNotificacao } from "@/lib/services/notification-service";
import { NotificationType } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const parse = propostaSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.issues[0].message }, { status: 400 });
  }

  const { propertyId, landlordId, rentValue, entryDate, durationMonths, guarantee, guaranteeDetails } = parse.data;

  // Verifica que o imóvel existe e o locador é correto
  const imovel = await db.property.findFirst({
    where: { id: propertyId, landlordId, status: "ACTIVE" },
  });
  if (!imovel) {
    return NextResponse.json({ erro: "Imóvel não encontrado ou inativo" }, { status: 404 });
  }

  // Cancela propostas anteriores pendentes para o mesmo imóvel
  await db.proposal.updateMany({
    where: {
      propertyId,
      tenantId: session.user.id,
      status: { in: ["PENDING", "COUNTER_OFFERED"] },
    },
    data: { status: "CANCELLED" },
  });

  const proposta = await db.proposal.create({
    data: {
      propertyId,
      tenantId: session.user.id,
      landlordId,
      rentValue,
      entryDate: new Date(entryDate),
      durationMonths,
      guarantee: guarantee as "DEPOSIT" | "GUARANTOR" | "INSURANCE",
      guaranteeDetails: guaranteeDetails as Prisma.InputJsonValue | undefined,
    },
    include: { counterOffers: true },
  });

  // Mensagem automática na conversa
  const conversa = await db.conversation.findUnique({
    where: { propertyId_tenantId: { propertyId, tenantId: session.user.id } },
  });
  if (conversa) {
    await db.message.create({
      data: {
        conversationId: conversa.id,
        senderId: session.user.id,
        content: `📋 Proposta enviada: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(rentValue)}/mês · Entrada: ${new Date(entryDate).toLocaleDateString("pt-BR")} · ${durationMonths} meses`,
      },
    });
  }

  criarNotificacao({
    userId: landlordId,
    type: NotificationType.PROPOSAL_RECEIVED,
    title: "Nova proposta recebida!",
    body: `Um locatário enviou uma proposta para ${imovel.title}.`,
    data: { proposalId: proposta.id, propertyId },
  });

  return NextResponse.json(proposta, { status: 201 });
}
