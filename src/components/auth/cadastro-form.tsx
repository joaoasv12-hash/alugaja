"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Home, Building2 } from "lucide-react";
import { cadastroSchema, CadastroInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PAPEIS = [
  {
    valor: "TENANT" as const,
    label: "Locatário",
    descricao: "Quero alugar um imóvel",
    icone: Home,
  },
  {
    valor: "LANDLORD" as const,
    label: "Locador",
    descricao: "Quero anunciar meu imóvel",
    icone: Building2,
  },
];

export function CadastroForm() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { roles: ["TENANT"], aceitouTermos: false, aceitouLGPD: false },
  });

  const rolesSelecionados = watch("roles");

  function alternarPapel(papel: "TENANT" | "LANDLORD") {
    const atual = rolesSelecionados ?? [];
    if (atual.includes(papel)) {
      if (atual.length === 1) return; // precisa de ao menos um
      setValue("roles", atual.filter((r) => r !== papel));
    } else {
      setValue("roles", [...atual, papel]);
    }
  }

  async function onSubmit(dados: CadastroInput) {
    setErro(null);
    setCarregando(true);

    const resposta = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const json = await resposta.json();

    if (!resposta.ok) {
      setErro(json.erro ?? "Erro ao criar conta.");
      setCarregando(false);
      return;
    }

    // Faz login automático após cadastro
    await signIn("credentials", {
      email: dados.email,
      password: dados.password,
      redirect: false,
    });

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="shadow-xl">
      <CardBody className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Criar sua conta</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Grátis e sem cartão de crédito
          </p>
        </div>

        {erro && (
          <Alert tipo="erro" className="mb-4">
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Seleção de papel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quero me cadastrar como <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAPEIS.map(({ valor, label, descricao, icone: Icone }) => {
                const selecionado = rolesSelecionados?.includes(valor);
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => alternarPapel(valor)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm transition-all",
                      selecionado
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300"
                    )}
                  >
                    <Icone className="h-6 w-6" />
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-xs opacity-75">{descricao}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.roles && (
              <p className="mt-1 text-xs text-red-500">{errors.roles.message}</p>
            )}
            <p className="mt-1.5 text-xs text-slate-500">
              Pode marcar os dois — você pode ser locatário e locador ao mesmo tempo.
            </p>
          </div>

          <Input
            label="Nome completo"
            type="text"
            placeholder="João da Silva"
            autoComplete="name"
            required
            iconeEsquerda={<User className="h-4 w-4" />}
            erro={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            iconeEsquerda={<Mail className="h-4 w-4" />}
            erro={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Senha"
            type={mostrarSenha ? "text" : "password"}
            placeholder="Mín. 8 caracteres, 1 maiúscula e 1 número"
            autoComplete="new-password"
            required
            iconeEsquerda={<Lock className="h-4 w-4" />}
            iconeDireita={
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="pointer-events-auto text-slate-400 hover:text-slate-600"
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            erro={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirmar senha"
            type={mostrarSenha ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            iconeEsquerda={<Lock className="h-4 w-4" />}
            erro={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Consentimentos LGPD */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register("aceitouTermos")}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="text-emerald-600 hover:underline">
                  Termos de Uso
                </Link>
              </span>
            </label>
            {errors.aceitouTermos && (
              <p className="text-xs text-red-500 ml-7">{errors.aceitouTermos.message}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register("aceitouLGPD")}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Li e aceito a{" "}
                <Link href="/privacidade" target="_blank" className="text-emerald-600 hover:underline">
                  Política de Privacidade
                </Link>{" "}
                (LGPD)
              </span>
            </label>
            {errors.aceitouLGPD && (
              <p className="text-xs text-red-500 ml-7">{errors.aceitouLGPD.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" tamanho="lg" carregando={carregando}>
            Criar conta grátis
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-emerald-600 hover:underline dark:text-emerald-400 font-medium">
            Entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
