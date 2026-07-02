"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type Input = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(dados: Input) {
    setErro(null);
    setCarregando(true);
    // Por ora simula envio — integração SMTP pendente
    await new Promise((r) => setTimeout(r, 800));
    setCarregando(false);
    setEnviado(true);
    // TODO: implementar POST /api/auth/recuperar-senha quando SMTP configurado
    void dados;
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-xl">
        <CardBody className="p-8">
          {enviado ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                E-mail enviado!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Se <strong>{getValues("email")}</strong> estiver cadastrado, você receberá
                as instruções em alguns minutos. Verifique a caixa de spam.
              </p>
              <Link href="/login">
                <Button variante="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Recuperar senha
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Informe seu e-mail e enviaremos as instruções de redefinição.
                </p>
              </div>

              {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="E-mail cadastrado"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  iconeEsquerda={<Mail className="h-4 w-4" />}
                  erro={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" className="w-full" tamanho="lg" carregando={carregando}>
                  Enviar instruções
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
