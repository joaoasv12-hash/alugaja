"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { MapPin, Home, DollarSign, Info } from "lucide-react";
import { imovelSchema, ImovelInput } from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { UploadFotos } from "./upload-fotos";
import { TIPOS_IMOVEL, ESTADOS_BR } from "@/constants";

interface ImovelFormProps {
  imovelId?: string;
  valoresIniciais?: Partial<ImovelInput>;
}

export function ImovelForm({ imovelId, valoresIniciais }: ImovelFormProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImovelInput>({
    resolver: zodResolver(imovelSchema) as unknown as Resolver<ImovelInput>,
    defaultValues: {
      isFurnished: false,
      acceptsPets: false,
      parkingSpots: 0,
      bedrooms: 1,
      bathrooms: 1,
      photos: [],
      ...valoresIniciais,
    },
  });

  const fotos = watch("photos");
  const isEdicao = !!imovelId;

  async function buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    const res = await fetch(`/api/cep/${cepLimpo}`);
    if (res.ok) {
      const dados = await res.json();
      setValue("street", dados.logradouro ?? "");
      setValue("neighborhood", dados.bairro ?? "");
      setValue("city", dados.cidade ?? "");
      setValue("state", dados.estado ?? "");
    }
    setBuscandoCep(false);
  }

  async function onSubmit(dados: ImovelInput) {
    setErro(null);
    setCarregando(true);

    const url = isEdicao ? `/api/properties/${imovelId}` : "/api/properties";
    const method = isEdicao ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao salvar anúncio.");
      return;
    }

    router.push("/locador/imoveis");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {erro && <Alert tipo="erro">{erro}</Alert>}

      {/* Fotos */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Home className="h-4 w-4" /> Fotos do imóvel
          </h2>
        </CardHeader>
        <CardBody>
          <UploadFotos
            fotos={fotos}
            onChange={(urls) => setValue("photos", urls)}
            erro={errors.photos?.message}
          />
        </CardBody>
      </Card>

      {/* Informações básicas */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info className="h-4 w-4" /> Informações do imóvel
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Título do anúncio"
            placeholder="Ex: Apartamento 2 quartos com churrasqueira Vila Mariana"
            required
            erro={errors.title?.message}
            {...register("title")}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={5}
              placeholder="Descreva o imóvel: características, localização, diferenciais, regras da casa…"
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tipo de imóvel <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              {...register("type")}
            >
              <option value="">Selecione</option>
              {Object.entries(TIPOS_IMOVEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Quartos"
              type="number"
              min={0}
              max={20}
              required
              erro={errors.bedrooms?.message}
              {...register("bedrooms")}
            />
            <Input
              label="Banheiros"
              type="number"
              min={1}
              max={20}
              required
              erro={errors.bathrooms?.message}
              {...register("bathrooms")}
            />
            <Input
              label="Vagas"
              type="number"
              min={0}
              max={20}
              erro={errors.parkingSpots?.message}
              {...register("parkingSpots")}
            />
            <Input
              label="Área (m²)"
              type="number"
              min={1}
              required
              erro={errors.area?.message}
              {...register("area")}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                {...register("isFurnished")}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Mobiliado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                {...register("acceptsPets")}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Aceita pets 🐾</span>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Valores
          </h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Aluguel (R$/mês)"
            type="number"
            min={1}
            step="0.01"
            required
            iconeEsquerda={<span className="text-xs">R$</span>}
            erro={errors.rentPrice?.message}
            {...register("rentPrice")}
          />
          <Input
            label="Condomínio (R$/mês)"
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            iconeEsquerda={<span className="text-xs">R$</span>}
            erro={errors.condoFee?.message}
            hint="Deixe em branco se não houver"
            {...register("condoFee")}
          />
          <Input
            label="IPTU (R$/mês)"
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            iconeEsquerda={<span className="text-xs">R$</span>}
            erro={errors.iptu?.message}
            hint="Valor mensal (anual ÷ 12)"
            {...register("iptu")}
          />
        </CardBody>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Endereço
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CEP"
              placeholder="00000-000"
              required
              erro={errors.zipCode?.message}
              hint={buscandoCep ? "Buscando…" : undefined}
              {...register("zipCode", {
                onBlur: (e) => buscarCep(e.target.value),
              })}
            />
            <Input
              label="Número"
              placeholder="123"
              required
              erro={errors.number?.message}
              {...register("number")}
            />
          </div>
          <Input
            label="Rua/Avenida"
            placeholder="Rua das Flores"
            required
            erro={errors.street?.message}
            {...register("street")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bairro"
              placeholder="Centro"
              required
              erro={errors.neighborhood?.message}
              {...register("neighborhood")}
            />
            <Input
              label="Complemento"
              placeholder="Apto 42, bloco B"
              {...register("complement")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade"
              required
              erro={errors.city?.message}
              {...register("city")}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register("state")}
              >
                <option value="">UF</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <Alert tipo="info">
            As coordenadas geográficas (latitude/longitude) serão determinadas automaticamente a partir do endereço após a aprovação do anúncio.
          </Alert>
        </CardBody>
      </Card>

      {/* Aviso */}
      <Alert tipo="aviso" titulo="Análise do anúncio">
        Após enviar, seu anúncio será analisado pela nossa equipe antes de ser publicado (geralmente em até 24h). Perfis verificados são publicados imediatamente.
      </Alert>

      <div className="flex gap-3 justify-end">
        <Button type="button" variante="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" carregando={carregando} tamanho="lg">
          {isEdicao ? "Salvar alterações" : "Enviar para aprovação"}
        </Button>
      </div>
    </form>
  );
}
