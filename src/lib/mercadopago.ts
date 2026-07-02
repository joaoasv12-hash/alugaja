import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function criarCliente() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    // Retorna null em desenvolvimento sem credenciais configuradas
    return null;
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });
}

const config = criarCliente();

export const mpPayment = config ? new Payment(config) : null;
export const mpPreference = config ? new Preference(config) : null;

export const MP_CONFIGURADO = !!process.env.MERCADOPAGO_ACCESS_TOKEN;
