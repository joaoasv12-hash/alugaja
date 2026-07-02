"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { User, Shield, CheckCircle2, Clock } from "lucide-react";
import { perfilSchema, PerfilInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mascararCPF, mascararCNPJ } from "@/lib/utils/cpf";
import { PAPEIS_LABELS } from "@/constants";

interface PerfilFormProps {
  perfil: {
    name: string;
    cpfCnpj: string | null;
    birthDate: Date | null;
    bio: string | null;
    isVerified: boolean;
    avatarUrl: string | null;
  } | null;
  usuario: {
    email: string;
    phone: string | null;
    roles: string[];
    status: string;
    createdAt: Date;
  } | null;
  userId: string;
}

export function PerfilForm({ perfil, usuario, userId }: PerfilFormProps) {
  const { update } = useSession();
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      name: perfil?.name ?? "",
      cpfCnpj: perfil?.cpfCnpj ?? "",
      bio: perfil?.bio ?? "",
      phone: usuario?.phone ?? "",
    },
  });

  async function onSubmit(dados: PerfilInput) {
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    const resposta = await fetch(`/api/users/${userId}/perfil`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setCarregando(false);

    if (!resposta.ok) {
      const json = await resposta.json();
      setErro(json.erro ?? "Erro ao salvar perfil.");
      return;
    }

    setSucesso("Perfil atualizado com sucesso!");
    await update();
  }

  function formatarDocumento(doc: string | null): string {
    if (!doc) return "";
    const num = doc.replace(/\D/g, "");
    if (num.length === 11) return mascararCPF(num);
    if (num.length === 14) return mascararCNPJ(num);
    return doc;
  }

  return (
    <div className="space-y-6">
      {/* Status de verificação */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xl font-bold">
            {perfil?.name?.[0]?.toUpperCase() ?? <User className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{perfil?.name ?? "Sem nome"}</p>
            <p className="text-sm text-slate-500">{usuario?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {usuario?.roles.map((role) => (
                <Badge key={role} cor="azul">
                  {PAPEIS_LABELS[role as keyof typeof PAPEIS_LABELS] ?? role}
                </Badge>
              ))}
              {perfil?.isVerified ? (
                <Badge cor="verde">
                  <CheckCircle2 className="h-3 w-3" />
                  Perfil Verificado
                </Badge>
              ) : (
                <Badge cor="amarelo">
                  <Clock className="h-3 w-3" />
                  Não verificado
                </Badge>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Verificação de documentos */}
      {!perfil?.isVerified && (
        <Alert tipo="info" titulo="Obtenha o Selo de Perfil Verificado">
          Envie um documento de identidade e uma selfie para verificar seu perfil. O selo aumenta a confiança de locadores e locatários.{" "}
          <a href="/configuracoes/verificacao" className="underline font-medium">
            Verificar agora
          </a>
        </Alert>
      )}

      {/* Formulário */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados pessoais
          </h2>
        </CardHeader>
        <CardBody>
          {sucesso && <Alert tipo="sucesso" className="mb-4">{sucesso}</Alert>}
          {erro && <Alert tipo="erro" className="mb-4">{erro}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              required
              placeholder="Seu nome completo"
              erro={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="CPF ou CNPJ"
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              hint="Necessário para assinar contratos"
              erro={errors.cpfCnpj?.message}
              {...register("cpfCnpj")}
            />

            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              {...register("phone")}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
                placeholder="Conte um pouco sobre você (máx. 500 caracteres)"
                maxLength={500}
                {...register("bio")}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
            </div>

            <Button type="submit" carregando={carregando}>
              Salvar alterações
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Senha</p>
              <p className="text-xs text-slate-500">Altere sua senha de acesso</p>
            </div>
            <a href="/recuperar-senha" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
              Alterar
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dados pessoais (LGPD)</p>
              <p className="text-xs text-slate-500">Exporte ou solicite exclusão dos seus dados</p>
            </div>
            <a href="/configuracoes/dados-lgpd" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
              Gerenciar
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
