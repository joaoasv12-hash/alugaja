import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatWindow } from "@/components/chat/chat-window";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_IMOVEL } from "@/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const conversa = await db.conversation.findUnique({
    where: { id },
    include: { property: { select: { title: true } } },
  });
  return { title: conversa ? `Chat — ${conversa.property.title}` : "Chat" };
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const conversa = await db.conversation.findUnique({
    where: { id },
    include: {
      property: {
        include: { photos: { orderBy: { order: "asc" }, take: 1 } },
      },
      tenant: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
      landlord: { include: { profile: { select: { name: true, avatarUrl: true, isVerified: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { include: { profile: { select: { name: true, avatarUrl: true } } } } },
      },
      visits: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!conversa) notFound();

  const userId = session.user.id;
  if (conversa.tenantId !== userId && conversa.landlordId !== userId) notFound();

  const isLocador = conversa.landlordId === userId;
  const outroUsuario = isLocador ? conversa.tenant : conversa.landlord;

  // Propostas desta negociação
  const propostas = await db.proposal.findMany({
    where: { propertyId: conversa.propertyId, tenantId: conversa.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      counterOffers: {
        orderBy: { createdAt: "asc" },
        include: { fromUser: { include: { profile: { select: { name: true } } } } },
      },
    },
  });

  // Marca mensagens como lidas
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  const foto = conversa.property.photos[0]?.url;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header da conversa */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl">
        <Link href="/mensagens" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Foto do imóvel */}
        <div className="relative h-12 w-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
          {foto && <Image src={foto} alt={conversa.property.title} fill className="object-cover" sizes="64px" />}
        </div>

        {/* Info do imóvel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {conversa.property.title}
            </p>
            <Link href={`/imovel/${conversa.property.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-600" />
            </Link>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {formatarMoeda(Number(conversa.property.rentPrice))}/mês
          </p>
        </div>

        {/* Perfil do outro usuário */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1 justify-end">
              {outroUsuario.profile?.name ?? "Usuário"}
              {outroUsuario.profile?.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLocador ? "Locatário" : "Locador"}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
            {outroUsuario.profile?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
      </div>

      {/* Janela de chat */}
      <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-700">
        <ChatWindow
          conversationId={id}
          currentUserId={userId}
          isLocador={isLocador}
          property={{
            id: conversa.property.id,
            title: conversa.property.title,
            rentPrice: Number(conversa.property.rentPrice),
            landlordId: conversa.landlordId,
          }}
          mensagensIniciais={conversa.messages.map((m) => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            createdAt: m.createdAt.toISOString(),
            sender: {
              profile: m.sender.profile
                ? { name: m.sender.profile.name, avatarUrl: m.sender.profile.avatarUrl }
                : null,
            },
          }))}
          visitasIniciais={conversa.visits.map((v) => ({
            id: v.id,
            proposedTimes: v.proposedTimes.map((t) => t.toISOString()),
            confirmedTime: v.confirmedTime?.toISOString() ?? null,
            status: v.status,
            notes: v.notes,
          }))}
          propostasIniciais={propostas.map((p) => ({
            id: p.id,
            rentValue: Number(p.rentValue),
            entryDate: p.entryDate.toISOString(),
            durationMonths: p.durationMonths,
            guarantee: p.guarantee,
            status: p.status,
            counterOffers: p.counterOffers.map((co) => ({
              id: co.id,
              rentValue: co.rentValue ? Number(co.rentValue) : null,
              entryDate: co.entryDate?.toISOString() ?? null,
              durationMonths: co.durationMonths,
              message: co.message,
              createdAt: co.createdAt.toISOString(),
              fromUser: { profile: co.fromUser.profile },
            })),
          }))}
        />
      </div>
    </div>
  );
}
