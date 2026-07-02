import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { NotificationType } from "@/generated/prisma/enums";

interface CriarNotificacaoParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}

export async function criarNotificacao(params: CriarNotificacaoParams) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data,
      },
    });
  } catch {
    // Notificações não devem interromper o fluxo principal
  }
}
