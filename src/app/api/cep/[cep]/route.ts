import { NextRequest, NextResponse } from "next/server";

// Proxy para ViaCEP — evita problemas de CORS no cliente
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep } = await params;
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return NextResponse.json({ erro: "CEP inválido" }, { status: 400 });
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
    next: { revalidate: 86400 }, // cache 24h
  });

  if (!resposta.ok) {
    return NextResponse.json({ erro: "CEP não encontrado" }, { status: 404 });
  }

  const dados = await resposta.json();

  if (dados.erro) {
    return NextResponse.json({ erro: "CEP não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    cep: dados.cep,
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    estado: dados.uf,
  });
}
