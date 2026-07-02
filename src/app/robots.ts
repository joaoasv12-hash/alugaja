import { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://alugaja.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/imoveis", "/imovel/", "/pro"],
        disallow: [
          "/admin",
          "/api/",
          "/locador/",
          "/locatario/",
          "/mensagens",
          "/contratos",
          "/fatura/",
          "/pagamentos",
          "/notificacoes",
          "/configuracoes/",
          "/avaliar/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
