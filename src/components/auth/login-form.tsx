"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(dados: LoginInput) {
    setErro(null);
    setCarregando(true);

    const resultado = await signIn("credentials", {
      email: dados.email,
      password: dados.password,
      redirect: false,
    });

    setCarregando(false);

    if (resultado?.error) {
      setErro(
        resultado.error === "Conta suspensa ou banida."
          ? resultado.error
          : "E-mail ou senha incorretos."
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  async function loginGoogle() {
    setCarregandoGoogle(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <Card className="shadow-xl">
      <CardBody className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo de volta</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Login Google */}
        <Button
          variante="outline"
          className="w-full mb-6"
          carregando={carregandoGoogle}
          onClick={loginGoogle}
          type="button"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-800 px-3 text-slate-500">ou com e-mail</span>
          </div>
        </div>

        {erro && (
          <Alert tipo="erro" className="mb-4">
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            placeholder="••••••••"
            autoComplete="current-password"
            required
            iconeEsquerda={<Lock className="h-4 w-4" />}
            iconeDireita={
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="pointer-events-auto text-slate-400 hover:text-slate-600"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            erro={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              href="/recuperar-senha"
              className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" className="w-full" tamanho="lg" carregando={carregando}>
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-emerald-600 hover:underline dark:text-emerald-400 font-medium">
            Cadastre-se grátis
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
