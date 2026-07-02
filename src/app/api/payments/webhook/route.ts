import { NextRequest, NextResponse } from "next/server";
import { processarPagamentoConcluido } from "@/lib/services/payment-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Mercado Pago envia topic=payment com id do pagamento
  const topic = body.type ?? request.nextUrl.searchParams.get("topic");
  const paymentId = body.data?.id ?? request.nextUrl.searchParams.get("id");

  if (topic !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Busca detalhes do pagamento no MP
    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpToken) return NextResponse.json({ ok: true });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });

    if (!mpRes.ok) return NextResponse.json({ ok: true });
    const payment = await mpRes.json();

    if (payment.external_reference) {
      await processarPagamentoConcluido({
        externalPaymentId: String(paymentId),
        externalReference: payment.external_reference,
        status: payment.status,
        method: payment.payment_method_id,
      });
    }
  } catch (e) {
    console.error("[webhook]", e);
  }

  return NextResponse.json({ ok: true });
}

// MP also sends GET to verify the webhook URL
export async function GET() {
  return NextResponse.json({ ok: true });
}
