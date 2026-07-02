import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PerfilForm } from "@/components/auth/perfil-form";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const perfil = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  const usuario = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, phone: true, roles: true, status: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">Meu perfil</h1>
      <PerfilForm perfil={perfil} usuario={usuario} userId={session.user.id} />
    </div>
  );
}
