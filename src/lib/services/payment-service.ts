import { db } from "@/lib/db";
import { mpPayment, mpPreference, MP_CONFIGURADO } from "@/lib/mercadopago";
import { InvoiceStatus, PaymentMethod, PaymentStatus, SponsorshipStatus } from "@/generated/prisma/enums";

const URL_BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

interface CriarPagamentoPixParams {
  fatura: { id: string; amount: string | number; description?: string | null };
  pagador: { nome: string; email: string; cpf?: string | null };
}

export interface ResultadoPix {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export async function criarPagamentoPix(params: CriarPagamentoPixParams): Promise<ResultadoPix> {
  const { fatura, pagador } = params;
  const valor = Number(fatura.amount);

  if (!MP_CONFIGURADO || !mpPayment) {
    // Mock para dev sem credenciais
    const paymentId = `mock-pix-${fatura.id}`;
    await db.payment.create({
      data: {
        invoiceId: fatura.id,
        userId: (await db.invoice.findUnique({ where: { id: fatura.id } }))!.userId,
        amount: valor,
        method: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        externalId: paymentId,
      },
    });
    return {
      paymentId,
      qrCode: "00020126580014BR.GOV.BCB.PIX0136mock-pix-qrcode-alugaja-dev5204000053039865802BR5924ALUGAJA MARKETPLACE LTDA6009SAO PAULO62190515ALUGAJA" + fatura.id.slice(0, 8) + "6304ABCD",
      qrCodeBase64: "",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  const pagamento = await mpPayment.create({
    body: {
      transaction_amount: valor,
      description: fatura.description ?? `AlugaJá — Fatura ${fatura.id.slice(0, 8)}`,
      payment_method_id: "pix",
      payer: {
        email: pagador.email,
        first_name: pagador.nome.split(" ")[0],
        last_name: pagador.nome.split(" ").slice(1).join(" ") || pagador.nome,
        identification: pagador.cpf ? { type: "CPF", number: pagador.cpf.replace(/\D/g, "") } : undefined,
      },
      notification_url: `${URL_BASE}/api/payments/webhook`,
      external_reference: fatura.id,
    },
  });

  const pixData = (pagamento as any).point_of_interaction?.transaction_data;

  const userId = (await db.invoice.findUnique({ where: { id: fatura.id } }))!.userId;
  await db.payment.create({
    data: {
      invoiceId: fatura.id,
      userId,
      amount: valor,
      method: PaymentMethod.PIX,
      status: PaymentStatus.PENDING,
      externalId: String(pagamento.id),
    },
  });

  return {
    paymentId: String(pagamento.id),
    qrCode: pixData?.qr_code ?? "",
    qrCodeBase64: pixData?.qr_code_base64 ?? "",
    expiresAt: (pagamento as any).date_of_expiration ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

interface CriarPreferenceParams {
  fatura: { id: string; amount: string | number; description?: string | null };
  pagador: { nome: string; email: string };
  tipoRetorno: "fatura" | "pro";
}

export async function criarPreferenceCartao(params: CriarPreferenceParams): Promise<{ checkoutUrl: string }> {
  const { fatura, pagador, tipoRetorno } = params;
  const valor = Number(fatura.amount);
  const successUrl = tipoRetorno === "pro" ? `${URL_BASE}/pro/sucesso` : `${URL_BASE}/fatura/${fatura.id}/sucesso`;

  if (!MP_CONFIGURADO || !mpPreference) {
    return { checkoutUrl: successUrl };
  }

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: fatura.id,
        title: fatura.description ?? "AlugaJá — Pagamento",
        quantity: 1,
        unit_price: valor,
        currency_id: "BRL",
      }],
      payer: { name: pagador.nome, email: pagador.email },
      back_urls: {
        success: successUrl,
        failure: `${URL_BASE}/fatura/${fatura.id}?status=falhou`,
        pending: `${URL_BASE}/fatura/${fatura.id}?status=pendente`,
      },
      auto_return: "approved",
      external_reference: fatura.id,
      notification_url: `${URL_BASE}/api/payments/webhook`,
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }],
        installments: 1,
      },
    },
  });

  const userId = (await db.invoice.findUnique({ where: { id: fatura.id } }))!.userId;
  await db.payment.create({
    data: {
      invoiceId: fatura.id,
      userId,
      amount: valor,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PENDING,
      externalId: String(preference.id),
    },
  });

  return { checkoutUrl: preference.init_point ?? successUrl };
}

export async function processarPagamentoConcluido(params: {
  externalPaymentId: string;
  externalReference: string;
  status: string;
  method?: string;
}) {
  const { externalPaymentId, externalReference, status, method } = params;

  const fatura = await db.invoice.findUnique({
    where: { id: externalReference },
    include: { sponsorships: true, subscription: true },
  });
  if (!fatura) return;

  const aprovado = status === "approved";
  const novoStatus = aprovado ? PaymentStatus.PAID : status === "pending" ? PaymentStatus.PENDING : PaymentStatus.FAILED;

  await db.payment.updateMany({
    where: { invoiceId: fatura.id },
    data: { status: novoStatus, externalId: externalPaymentId },
  });

  if (aprovado) {
    await db.invoice.update({
      where: { id: fatura.id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });

    // Ativa patrocínio se for do tipo SPONSORSHIP
    if (fatura.type === "SPONSORSHIP" && fatura.sponsorships.length > 0) {
      const sponsor = fatura.sponsorships[0];
      const inicio = new Date();
      const fim = new Date(inicio.getTime() + sponsor.planDays * 24 * 60 * 60 * 1000);
      await db.sponsorship.update({
        where: { id: sponsor.id },
        data: { status: SponsorshipStatus.ACTIVE, startsAt: inicio, expiresAt: fim },
      });
    }

    // Ativa assinatura Pro se for do tipo SUBSCRIPTION
    if (fatura.type === "SUBSCRIPTION" && fatura.subscriptionId) {
      const proxFaturamento = new Date();
      proxFaturamento.setMonth(proxFaturamento.getMonth() + 1);
      await db.subscription.update({
        where: { id: fatura.subscriptionId },
        data: { status: "ACTIVE", nextBilling: proxFaturamento },
      });
    }
  }
}
