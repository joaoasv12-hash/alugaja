import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const REMETENTE = `"AlugaJá" <${process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@alugaja.com.br"}>`;

interface EnviarEmailParams {
  para: string;
  assunto: string;
  html: string;
}

export async function enviarEmail({ para, assunto, html }: EnviarEmailParams) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    await transporter.sendMail({ from: REMETENTE, to: para, subject: assunto, html });
  } catch (e) {
    console.error("[email]", e);
  }
}

function base(conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="background:#10b981;padding:24px 32px">
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">AlugaJá</h1>
</td></tr>
<tr><td style="padding:32px">${conteudo}</td></tr>
<tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
  <p style="margin:0;font-size:12px;color:#94a3b8">
    AlugaJá — Marketplace de aluguel de imóveis<br>
    Para cancelar e-mails, acesse suas <a href="${process.env.NEXTAUTH_URL ?? ""}/configuracoes/privacidade" style="color:#10b981">configurações de privacidade</a>.
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export const emailTemplates = {
  novaMensagem: (nomeRemetente: string, imovelTitulo: string, mensagem: string, link: string) =>
    base(`
      <p style="color:#475569;margin:0 0 16px">Você recebeu uma nova mensagem de <strong>${nomeRemetente}</strong> sobre <strong>${imovelTitulo}</strong>:</p>
      <blockquote style="border-left:3px solid #10b981;margin:0 0 24px;padding:12px 16px;background:#f0fdf4;border-radius:0 8px 8px 0;color:#374151;font-style:italic">${mensagem}</blockquote>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Ver conversa</a>
    `),

  propostaRecebida: (nomeTenant: string, imovelTitulo: string, valor: string, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Nova proposta recebida!</h2>
      <p style="color:#475569;margin:0 0 16px"><strong>${nomeTenant}</strong> enviou uma proposta para <strong>${imovelTitulo}</strong> no valor de <strong>${valor}/mês</strong>.</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Ver proposta</a>
    `),

  propostaAceita: (nomeLocador: string, imovelTitulo: string, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Sua proposta foi aceita!</h2>
      <p style="color:#475569;margin:0 0 16px"><strong>${nomeLocador}</strong> aceitou sua proposta para <strong>${imovelTitulo}</strong>. Um contrato foi gerado e aguarda assinatura.</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Assinar contrato</a>
    `),

  contratoAssinado: (nomeOutro: string, imovelTitulo: string, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Contrato assinado por ambas as partes!</h2>
      <p style="color:#475569;margin:0 0 16px"><strong>${nomeOutro}</strong> assinou o contrato de <strong>${imovelTitulo}</strong>. O contrato está agora ativo.</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Ver contrato</a>
    `),

  faturaGerada: (descricao: string, valor: string, vencimento: string, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Nova fatura disponível</h2>
      <p style="color:#475569;margin:0 0 4px"><strong>${descricao}</strong></p>
      <p style="color:#475569;margin:0 0 4px">Valor: <strong>${valor}</strong></p>
      <p style="color:#475569;margin:0 0 24px">Vencimento: <strong>${vencimento}</strong></p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Pagar agora</a>
    `),

  imovelAprovado: (imovelTitulo: string, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Seu imóvel foi aprovado!</h2>
      <p style="color:#475569;margin:0 0 24px"><strong>${imovelTitulo}</strong> está agora visível para todos os usuários da plataforma.</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Ver anúncio</a>
    `),

  avaliacaoRecebida: (nomeAvaliador: string, imovelTitulo: string, estrelas: number, link: string) =>
    base(`
      <h2 style="margin:0 0 8px;color:#1e293b">Você recebeu uma avaliação!</h2>
      <p style="color:#475569;margin:0 0 8px"><strong>${nomeAvaliador}</strong> te avaliou após a locação de <strong>${imovelTitulo}</strong>.</p>
      <p style="font-size:28px;margin:0 0 24px">${"⭐".repeat(estrelas)}</p>
      <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">Ver avaliação</a>
    `),
};
