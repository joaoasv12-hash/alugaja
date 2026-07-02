import { Metadata } from "next";
import { CadastroForm } from "@/components/auth/cadastro-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <div className="w-full max-w-lg">
      <CadastroForm />
    </div>
  );
}
