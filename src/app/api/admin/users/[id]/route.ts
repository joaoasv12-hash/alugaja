import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, registrarAudit } from "@/lib/admin";
import { db } from "@/lib/db";
import { UserStatus } from "@/generated/prisma/enums";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  const { id } = await params;

  const usuario = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      documents: true,
      properties: {
        select: { id: true, title: true, status: true, rentPrice: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      invoices: {
        select: { id: true, type: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      subscription: true,
      _count: { select: { properties: true, invoices: true, sentMessages: true } },
    },
  });

  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  return NextResponse.json(usuario);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();

  const acoesValidas = ["ACTIVE", "SUSPENDED", "BANNED", "verify", "add_landlord", "remove_landlord"];
  if (!acoesValidas.includes(body.acao)) {
    return NextResponse.json({ erro: "Ação inválida" }, { status: 400 });
  }

  if (id === session.user.id) {
    return NextResponse.json({ erro: "Não é possível modificar a própria conta" }, { status: 403 });
  }

  const usuario = await db.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });

  if (["ACTIVE", "SUSPENDED", "BANNED"].includes(body.acao)) {
    await db.user.update({
      where: { id },
      data: { status: body.acao as UserStatus },
    });
    await registrarAudit({
      adminId: session.user.id,
      action: `USER_STATUS_${body.acao}`,
      targetType: "User",
      targetId: id,
      details: { motivo: body.motivo, email: usuario.email },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.acao === "verify") {
    await db.profile.update({
      where: { userId: id },
      data: { isVerified: true, verifiedAt: new Date() },
    });
    await registrarAudit({
      adminId: session.user.id,
      action: "USER_VERIFIED",
      targetType: "User",
      targetId: id,
      details: { email: usuario.email },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.acao === "add_landlord") {
    const roles = Array.from(new Set([...usuario.roles, "LANDLORD" as const]));
    await db.user.update({ where: { id }, data: { roles } });
    await registrarAudit({
      adminId: session.user.id,
      action: "USER_ADD_LANDLORD",
      targetType: "User",
      targetId: id,
      details: { email: usuario.email },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.acao === "remove_landlord") {
    const roles = usuario.roles.filter((r) => r !== "LANDLORD");
    await db.user.update({ where: { id }, data: { roles } });
    await registrarAudit({
      adminId: session.user.id,
      action: "USER_REMOVE_LANDLORD",
      targetType: "User",
      targetId: id,
      details: { email: usuario.email },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erro: "Ação não implementada" }, { status: 400 });
}
