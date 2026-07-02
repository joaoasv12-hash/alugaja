import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { avaliacaoSchema } from "@/lib/validations/review";
import { criarNotificacao } from "@/lib/services/notification-service";
import { enviarEmail, emailTemplates } from "@/lib/email";
import { formatarMoeda } from "@/lib/utils";
import { ReviewType } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");
  const contractId = searchParams.get("contractId");

  const where = {
    ...(userId && { reviewedId: userId }),
    ...(contractId && { contractId }),
  };

  const reviews = await db.review.findMany({
    where,
    include: {
      reviewer: { include: { profile: { select: { name: true, avatarUrl: true } } } },
      property: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const media =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({ reviews, media, total: reviews.length });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = avaliacaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.flatten() }, { status: 400 });
  }
  const { contractId, rating, comment } = parsed.data;

  const contrato = await db.contract.findUnique({
    where: { id: contractId },
    include: {
      landlord: { include: { profile: true } },
      tenant: { include: { profile: true } },
      property: { select: { title: true, slug: true } },
    },
  });

  if (!contrato) return NextResponse.json({ erro: "Contrato não encontrado" }, { status: 404 });

  const isLandlord = contrato.landlordId === session.user.id;
  const isTenant = contrato.tenantId === session.user.id;

  if (!isLandlord && !isTenant) {
    return NextResponse.json({ erro: "Você não faz parte deste contrato" }, { status: 403 });
  }

  if (!["ACTIVE", "TERMINATED", "EXPIRED"].includes(contrato.status)) {
    return NextResponse.json({ erro: "O contrato precisa estar ativo ou encerrado para avaliar" }, { status: 409 });
  }

  // Verifica se já avaliou
  const jaAvaliou = await db.review.findUnique({
    where: { contractId_reviewerId: { contractId, reviewerId: session.user.id } },
  });
  if (jaAvaliou) {
    return NextResponse.json({ erro: "Você já avaliou este contrato" }, { status: 409 });
  }

  const reviewedId = isLandlord ? contrato.tenantId : contrato.landlordId;
  const type = isLandlord ? ReviewType.LANDLORD_REVIEWS_TENANT : ReviewType.TENANT_REVIEWS_LANDLORD;
  const nomeAvaliador = isLandlord
    ? (contrato.landlord.profile?.name ?? "Locador")
    : (contrato.tenant.profile?.name ?? "Locatário");
  const emailAvaliado = isLandlord ? contrato.tenant.email : contrato.landlord.email;

  const review = await db.review.create({
    data: {
      contractId,
      reviewerId: session.user.id,
      reviewedId,
      propertyId: contrato.propertyId,
      rating,
      comment,
      type,
    },
  });

  // Atualiza rating médio no perfil
  const todasAvaliacoes = await db.review.findMany({ where: { reviewedId } });
  const novaMedia = todasAvaliacoes.reduce((s, r) => s + r.rating, 0) / todasAvaliacoes.length;
  await db.profile.update({
    where: { userId: reviewedId },
    data: { rating: novaMedia, reviewCount: todasAvaliacoes.length },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "";

  await criarNotificacao({
    userId: reviewedId,
    type: "REVIEW_RECEIVED",
    title: "Você recebeu uma avaliação!",
    body: `${nomeAvaliador} te avaliou com ${rating} estrela(s).`,
    data: { reviewId: review.id, contractId },
  });

  await enviarEmail({
    para: emailAvaliado ?? "",
    assunto: "Você recebeu uma nova avaliação — AlugaJá",
    html: emailTemplates.avaliacaoRecebida(
      nomeAvaliador,
      contrato.property.title,
      rating,
      `${baseUrl}/perfil`
    ),
  });

  return NextResponse.json(review, { status: 201 });
}
