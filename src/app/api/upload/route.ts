import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImagem } from "@/lib/storage";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const formData = await request.formData();
  const arquivo = formData.get("file") as File | null;

  if (!arquivo) return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
    return NextResponse.json({ erro: "Formato inválido. Use JPEG, PNG ou WebP." }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAX) {
    return NextResponse.json({ erro: "Arquivo muito grande. Máximo 10 MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const resultado = await uploadImagem(buffer, arquivo.name);

  return NextResponse.json(resultado);
}
