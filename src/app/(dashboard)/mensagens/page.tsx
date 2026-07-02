import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageSquare, Building2 } from "lucide-react";

export const metadata = { title: "Mensagens — AlugaJá" };

export default async function MensagensPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const sp = await searchParams;

  // Se vier de /imovel/:slug com propertyId, cria/acha a conversa e redireciona
  if (sp.propertyId) {
    const imovel = await db.property.findUnique({
      where: { id: sp.propertyId },
      select: { id: true, landlordId: true, status: true },
    });

    if (imovel && imovel.status === "ACTIVE" && imovel.landlordId !== session.user.id) {
      const conversa = await db.conversation.upsert({
        where: { propertyId_tenantId: { propertyId: imovel.id, tenantId: session.user.id } },
        create: { propertyId: imovel.id, tenantId: session.user.id, landlordId: imovel.landlordId },
        update: {},
      });
      redirect(`/mensagens/${conversa.id}`);
    }
  }

  const userId = session.user.id;

  const conversas = await db.conversation.findMany({
    where: { OR: [{ tenantId: userId }, { landlordId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      property: {
        select: { title: true, slug: true, photos: { orderBy: { order: "asc" }, take: 1 } },
      },
      tenant: { include: { profile: { select: { name: true, avatarUrl: true } } } },
      landlord: { include: { profile: { select: { name: true, avatarUrl: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { readAt: null, senderId: { not: userId } } } } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Mensagens
      </h1>

      {conversas.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhuma conversa ainda
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Entre em contato com um locador a partir de um anúncio.
          </p>
          <Link
            href="/imoveis"
            className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
          >
            Explorar imóveis
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversas.map((c) => {
            const outroUsuario = c.tenantId === userId ? c.landlord : c.tenant;
            const ultima = c.messages[0];
            const naoLidas = c._count.messages;
            const foto = c.property.photos[0]?.url;

            return (
              <Link key={c.id} href={`/mensagens/${c.id}`}>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-400 hover:shadow-sm transition-all">
                  {/* Foto do imóvel */}
                  <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                    {foto ? (
                      <Image src={foto} alt={c.property.title} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {outroUsuario.profile?.name ?? "Usuário"}
                      </p>
                      {ultima && (
                        <p className="text-xs text-slate-400 shrink-0">
                          {new Date(ultima.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                      {c.property.title}
                    </p>
                    {ultima && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {ultima.senderId === userId ? "Você: " : ""}
                        {ultima.content}
                      </p>
                    )}
                  </div>

                  {naoLidas > 0 && (
                    <div className="h-5 min-w-5 px-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {naoLidas > 99 ? "99+" : naoLidas}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
