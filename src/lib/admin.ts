import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { headers } from "next/headers";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.roles?.includes(Role.SUPER_ADMIN)) {
    return null;
  }
  return session;
}

export async function registrarAudit(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Prisma.InputJsonValue;
}) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? undefined;
  await db.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details ?? {},
      ipAddress: ip,
    },
  });
}
