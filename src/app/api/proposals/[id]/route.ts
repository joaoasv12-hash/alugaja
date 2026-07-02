import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { respostaPropostaSchema } from "@/lib/validations/conversation";
import { criarNotificacao } from "@/lib/services/notification-service";
import { NotificationType, ProposalStatus } from "@/generated/prisma/enums";
import { calcularSuccessFee } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const proposta = await db.proposal.findUnique({
    where: { id },
    include: { property: { select: { title: true } } },
  });
  if (!proposta) return NextResponse.json({ erro: "Proposta não encontrada" }, { status: 404 });

  const userId = session.user.id;
  const isLocador = proposta.landlordId === userId;
  const isLocatario = proposta.tenantId === userId;

  if (!isLocador && !isLocatario) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  if (proposta.status !== ProposalStatus.PENDING && proposta.status !== ProposalStatus.COUNTER_OFFERED) {
    return NextResponse.json({ erro: "Proposta já foi encerrada" }, { status: 409 });
  }

  const body = await request.json();
  const parse = respostaPropostaSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ erro: parse.error.issues[0].message }, { status: 400 });
  }

  const { action, rentValue, entryDate, durationMonths, message } = parse.data;

  // Apenas o locador pode aceitar/rejeitar; qualquer um pode fazer contraproposta
  if ((action === "ACCEPT" || action === "REJECT") && !isLocador) {
    return NextResponse.json({ erro: "Apenas o locador pode aceitar ou rejeitar" }, { status: 403 });
  }

  if (action === "ACCEPT") {
    // Cria contrato draft e fatura de success fee
    const valorFinal = Number(proposta.rentValue);
    const fee = calcularSuccessFee(valorFinal);

    const [contrato, fatura] = await Promise.all([
      db.contract.create({
        data: {
          proposalId: id,
          propertyId: proposta.propertyId,
          templateType: "RESIDENTIAL_LONG",
          landlordId: proposta.landlordId,
          tenantId: proposta.tenantId,
          rentValue: proposta.rentValue,
          startDate: proposta.entryDate,
          durationMonths: proposta.durationMonths,
          guarantee: proposta.guarantee,
          status: "DRAFT",
        },
      }),
      db.invoice.create({
        data: {
          userId: proposta.landlordId,
          type: "SUCCESS_FEE",
          amount: fee,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: `Taxa de sucesso — ${proposta.property.title}`,
        },
      }),
    ]);

    await db.proposal.update({
      where: { id },
      data: { status: ProposalStatus.ACCEPTED },
    });

    // Mensagem automática
    const conversa = await db.conversation.findUnique({
      where: { propertyId_tenantId: { propertyId: proposta.propertyId, tenantId: proposta.tenantId } },
    });
    if (conversa) {
      await db.message.create({
        data: {
          conversationId: conversa.id,
          senderId: userId,
          content: `🎉 Proposta aceita! O contrato foi gerado e está aguardando assinaturas.`,
        },
      });
    }

    criarNotificacao({
      userId: proposta.tenantId,
      type: NotificationType.PROPOSAL_ACCEPTED,
      title: "Proposta aceita!",
      body: `O locador aceitou sua proposta para ${proposta.property.title}.`,
      data: { contractId: contrato.id },
    });

    return NextResponse.json({ proposta: { ...proposta, status: "ACCEPTED" }, contrato, fatura });
  }

  if (action === "REJECT") {
    await db.proposal.update({ where: { id }, data: { status: ProposalStatus.REJECTED } });

    const conversa = await db.conversation.findUnique({
      where: { propertyId_tenantId: { propertyId: proposta.propertyId, tenantId: proposta.tenantId } },
    });
    if (conversa) {
      await db.message.create({
        data: {
          conversationId: conversa.id,
          senderId: userId,
          content: `❌ Proposta recusada.${message ? ` Motivo: ${message}` : ""}`,
        },
      });
    }

    criarNotificacao({
      userId: proposta.tenantId,
      type: NotificationType.PROPOSAL_REJECTED,
      title: "Proposta recusada",
      body: message ?? `Sua proposta para ${proposta.property.title} foi recusada.`,
      data: { proposalId: id },
    });

    return NextResponse.json({ status: "REJECTED" });
  }

  // COUNTER
  if (!rentValue && !entryDate && !durationMonths) {
    return NextResponse.json({ erro: "Informe ao menos um campo para a contraproposta" }, { status: 400 });
  }

  const contra = await db.counterOffer.create({
    data: {
      proposalId: id,
      fromUserId: userId,
      rentValue: rentValue ?? null,
      entryDate: entryDate ? new Date(entryDate) : null,
      durationMonths: durationMonths ?? null,
      message: message ?? null,
    },
  });

  await db.proposal.update({ where: { id }, data: { status: ProposalStatus.COUNTER_OFFERED } });

  const destinatarioId = isLocador ? proposta.tenantId : proposta.landlordId;
  const conversa = await db.conversation.findUnique({
    where: { propertyId_tenantId: { propertyId: proposta.propertyId, tenantId: proposta.tenantId } },
  });
  if (conversa) {
    const partes = [];
    if (rentValue) partes.push(`Aluguel: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(rentValue)}/mês`);
    if (entryDate) partes.push(`Entrada: ${new Date(entryDate).toLocaleDateString("pt-BR")}`);
    if (durationMonths) partes.push(`Duração: ${durationMonths} meses`);
    await db.message.create({
      data: {
        conversationId: conversa.id,
        senderId: userId,
        content: `🔄 Contraproposta: ${partes.join(" · ")}${message ? `\n"${message}"` : ""}`,
      },
    });
  }

  criarNotificacao({
    userId: destinatarioId,
    type: NotificationType.PROPOSAL_RECEIVED,
    title: "Contraproposta recebida",
    body: "Uma contraproposta foi enviada. Veja os detalhes no chat.",
    data: { proposalId: id },
  });

  return NextResponse.json(contra, { status: 201 });
}
