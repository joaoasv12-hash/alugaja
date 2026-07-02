import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { carregarDadosContrato } from "@/lib/services/contract-service";
import { Role } from "@/generated/prisma/enums";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const contrato = await carregarDadosContrato(id);
  if (!contrato) return NextResponse.json({ erro: "Contrato não encontrado" }, { status: 404 });

  const userId = session.user.id;
  const isAdmin = session.user.roles.includes(Role.SUPER_ADMIN);
  if (contrato.landlordId !== userId && contrato.tenantId !== userId && !isAdmin) {
    return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
  }

  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { ContratoPDF } = await import("@/lib/pdf/contrato-pdf");
  const React = await import("react");

  const dados = {
    templateType: contrato.templateType,
    rentValue: Number(contrato.rentValue),
    startDate: contrato.startDate,
    endDate: contrato.endDate,
    durationMonths: contrato.durationMonths,
    guarantee: contrato.guarantee,
    adjustmentIndex: contrato.adjustmentIndex,
    documentHash: contrato.documentHash ?? "pendente",
    landlord: {
      name: contrato.landlord.profile?.name ?? contrato.landlord.email,
      email: contrato.landlord.email,
      cpfCnpj: contrato.landlord.profile?.cpfCnpj,
    },
    tenant: {
      name: contrato.tenant.profile?.name ?? contrato.tenant.email,
      email: contrato.tenant.email,
      cpfCnpj: contrato.tenant.profile?.cpfCnpj,
    },
    property: {
      title: contrato.property.title,
      street: contrato.property.street,
      number: contrato.property.number,
      complement: contrato.property.complement,
      neighborhood: contrato.property.neighborhood,
      city: contrato.property.city,
      state: contrato.property.state,
      zipCode: contrato.property.zipCode,
      area: contrato.property.area,
      bedrooms: contrato.property.bedrooms,
      bathrooms: contrato.property.bathrooms,
      parkingSpots: contrato.property.parkingSpots,
    },
    signatures: contrato.signatures.map((s) => ({
      role: s.role,
      signedAt: s.signedAt,
      ipAddress: s.ipAddress,
    })),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ContratoPDF as any, { dados }) as any;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-alugaja-${id.slice(0, 8)}.pdf"`,
    },
  });
}
