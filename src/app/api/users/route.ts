import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { cadastroSchema } from "@/lib/validations/auth";
import { Role } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dados = cadastroSchema.parse(body);

    const existente = await db.user.findUnique({
      where: { email: dados.email.toLowerCase() },
    });

    if (existente) {
      return NextResponse.json(
        { erro: "E-mail já cadastrado." },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(dados.password, 12);

    // Mapeia papéis do formulário para enum
    const papeis = dados.roles.map((r) => r as Role);

    // Garante que SUPER_ADMIN só pode ser definido via env
    const emailAdmin = process.env.SUPER_ADMIN_EMAIL;
    if (dados.email.toLowerCase() === emailAdmin?.toLowerCase()) {
      papeis.push(Role.SUPER_ADMIN);
    }

    const usuario = await db.user.create({
      data: {
        email: dados.email.toLowerCase(),
        passwordHash: senhaHash,
        roles: papeis,
        profile: {
          create: {
            name: dados.name,
          },
        },
      },
      select: { id: true, email: true, roles: true },
    });

    return NextResponse.json(
      { mensagem: "Conta criada com sucesso.", usuario },
      { status: 201 }
    );
  } catch (erro: unknown) {
    if (erro instanceof Error && erro.name === "ZodError") {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 422 });
    }
    console.error("Erro ao criar usuário:", erro);
    return NextResponse.json({ erro: "Erro interno." }, { status: 500 });
  }
}
