import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ImovelForm } from "@/components/property/imovel-form";
import { Home } from "lucide-react";

export const metadata = { title: "Novo anúncio — AlugaJá" };

export default async function NovoImovelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Home className="h-6 w-6" />
          Novo anúncio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Preencha as informações do imóvel. Perfis verificados são publicados imediatamente.
        </p>
      </div>

      <ImovelForm />
    </div>
  );
}
