import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXTAUTH_URL ?? "https://alugaja.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const imoveis = await db.property.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/imoveis`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/pro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/entrar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/cadastro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const paginasImoveis: MetadataRoute.Sitemap = imoveis.map((i) => ({
    url: `${BASE}/imovel/${i.slug}`,
    lastModified: i.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...paginasEstaticas, ...paginasImoveis];
}
