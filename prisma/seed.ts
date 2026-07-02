import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const CIDADES = [
  { cidade: "São Paulo", estado: "SP", bairros: ["Vila Mariana", "Moema", "Pinheiros", "Lapa", "Santana"] },
  { cidade: "Rio de Janeiro", estado: "RJ", bairros: ["Copacabana", "Ipanema", "Botafogo", "Tijuca"] },
  { cidade: "Belo Horizonte", estado: "MG", bairros: ["Savassi", "Funcionários", "Centro"] },
];

async function main() {
  console.log("🌱 Iniciando seed…");

  // Remove dados existentes (ordem respeitando FK)
  await db.auditLog.deleteMany();
  await db.report.deleteMany();
  await db.notification.deleteMany();
  await db.review.deleteMany();
  await db.signature.deleteMany();
  await db.inspectionReport.deleteMany();
  await db.payment.deleteMany();
  await db.invoice.deleteMany();
  await db.subscription.deleteMany();
  await db.counterOffer.deleteMany();
  await db.contract.deleteMany();
  await db.proposal.deleteMany();
  await db.message.deleteMany();
  await db.visitSchedule.deleteMany();
  await db.conversation.deleteMany();
  await db.sponsorship.deleteMany();
  await db.favorite.deleteMany();
  await db.savedSearch.deleteMany();
  await db.propertyPhoto.deleteMany();
  await db.property.deleteMany();
  await db.document.deleteMany();
  await db.profile.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.verificationToken.deleteMany();
  await db.user.deleteMany();

  const senhaHash = await bcrypt.hash("Senha@123", 12);

  // ─── 1. Usuários ──────────────────────────────────────────────────────────

  const admin = await db.user.create({
    data: {
      email: process.env.SUPER_ADMIN_EMAIL ?? "admin@alugaja.com.br",
      passwordHash: senhaHash,
      emailVerified: new Date(),
      roles: ["SUPER_ADMIN", "LANDLORD", "TENANT"],
      profile: {
        create: { name: "Admin AlugaJá", isVerified: true, verifiedAt: new Date() },
      },
    },
  });

  const locador = await db.user.create({
    data: {
      email: "locador@exemplo.com",
      passwordHash: senhaHash,
      emailVerified: new Date(),
      roles: ["LANDLORD"],
      profile: {
        create: {
          name: "Carlos Mendes",
          cpfCnpj: "123.456.789-09",
          bio: "Proprietário com 5 imóveis em São Paulo. Respondo rapidamente!",
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.8,
          reviewCount: 12,
        },
      },
    },
  });

  const locatario = await db.user.create({
    data: {
      email: "locatario@exemplo.com",
      passwordHash: senhaHash,
      emailVerified: new Date(),
      roles: ["TENANT"],
      profile: {
        create: {
          name: "Ana Lima",
          cpfCnpj: "987.654.321-00",
          bio: "Profissional buscando apartamento próximo ao metrô.",
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.9,
          reviewCount: 3,
        },
      },
    },
  });

  console.log("✅ Usuários criados:", admin.email, locador.email, locatario.email);

  // ─── 2. Imóveis ──────────────────────────────────────────────────────────

  const imoveisData = [
    {
      title: "Apartamento moderno 2 quartos Vila Mariana",
      type: "APARTMENT" as const,
      status: "ACTIVE" as const,
      rentPrice: 3200,
      condoFee: 450,
      iptu: 80,
      area: 68,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      isFurnished: false,
      acceptsPets: true,
      zipCode: "04101-300",
      street: "Rua Domingos de Morais",
      number: "123",
      neighborhood: "Vila Mariana",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5959,
      longitude: -46.6382,
    },
    {
      title: "Studio aconchegante Moema",
      type: "STUDIO" as const,
      status: "ACTIVE" as const,
      rentPrice: 2100,
      condoFee: 320,
      iptu: 50,
      area: 38,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      isFurnished: true,
      acceptsPets: false,
      zipCode: "04524-001",
      street: "Avenida Moema",
      number: "456",
      neighborhood: "Moema",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.6023,
      longitude: -46.6668,
    },
    {
      title: "Casa 3 quartos com quintal Lapa",
      type: "HOUSE" as const,
      status: "ACTIVE" as const,
      rentPrice: 4500,
      condoFee: null,
      iptu: 200,
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 2,
      isFurnished: false,
      acceptsPets: true,
      zipCode: "05064-100",
      street: "Rua Guaicurus",
      number: "789",
      neighborhood: "Lapa",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5249,
      longitude: -46.7018,
    },
    {
      title: "Quarto individual em apartamento compartilhado Pinheiros",
      type: "ROOM" as const,
      status: "ACTIVE" as const,
      rentPrice: 1200,
      condoFee: 150,
      iptu: null,
      area: 15,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      isFurnished: true,
      acceptsPets: false,
      zipCode: "05422-001",
      street: "Rua dos Pinheiros",
      number: "321",
      neighborhood: "Pinheiros",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5622,
      longitude: -46.6823,
    },
    {
      title: "Sala comercial 45m² Santana",
      type: "COMMERCIAL" as const,
      status: "ACTIVE" as const,
      rentPrice: 2800,
      condoFee: 600,
      iptu: 150,
      area: 45,
      bedrooms: 0,
      bathrooms: 1,
      parkingSpots: 1,
      isFurnished: false,
      acceptsPets: false,
      zipCode: "02401-001",
      street: "Avenida Voluntários da Pátria",
      number: "555",
      neighborhood: "Santana",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5061,
      longitude: -46.6275,
    },
    {
      title: "Cobertura duplex 3 quartos Copacabana",
      type: "APARTMENT" as const,
      status: "ACTIVE" as const,
      rentPrice: 8500,
      condoFee: 1200,
      iptu: 400,
      area: 180,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpots: 2,
      isFurnished: true,
      acceptsPets: true,
      zipCode: "22060-001",
      street: "Rua Barata Ribeiro",
      number: "777",
      neighborhood: "Copacabana",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      latitude: -22.9711,
      longitude: -43.1839,
    },
    {
      title: "Kitnet próxima ao metrô Ipanema",
      type: "STUDIO" as const,
      status: "ACTIVE" as const,
      rentPrice: 2600,
      condoFee: 200,
      iptu: 60,
      area: 32,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      isFurnished: true,
      acceptsPets: false,
      zipCode: "22411-010",
      street: "Rua Garcia d'Ávila",
      number: "100",
      neighborhood: "Ipanema",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      latitude: -22.9846,
      longitude: -43.2001,
    },
    {
      title: "Apartamento 2 quartos Botafogo",
      type: "APARTMENT" as const,
      status: "ACTIVE" as const,
      rentPrice: 3800,
      condoFee: 550,
      iptu: 90,
      area: 75,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      isFurnished: false,
      acceptsPets: true,
      zipCode: "22250-010",
      street: "Rua São Clemente",
      number: "250",
      neighborhood: "Botafogo",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      latitude: -22.9492,
      longitude: -43.1864,
    },
    {
      title: "Casa ampla 4 quartos Savassi",
      type: "HOUSE" as const,
      status: "ACTIVE" as const,
      rentPrice: 5200,
      condoFee: null,
      iptu: 250,
      area: 200,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 3,
      isFurnished: false,
      acceptsPets: true,
      zipCode: "30130-171",
      street: "Rua Pernambuco",
      number: "900",
      neighborhood: "Savassi",
      cidade: "Belo Horizonte",
      estado: "MG",
      latitude: -19.9379,
      longitude: -43.9342,
    },
    {
      title: "Flat mobiliado 1 quarto Funcionários",
      type: "APARTMENT" as const,
      status: "ACTIVE" as const,
      rentPrice: 2900,
      condoFee: 400,
      iptu: 70,
      area: 50,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 1,
      isFurnished: true,
      acceptsPets: false,
      zipCode: "30140-070",
      street: "Rua dos Aimorés",
      number: "400",
      neighborhood: "Funcionários",
      cidade: "Belo Horizonte",
      estado: "MG",
      latitude: -19.9322,
      longitude: -43.9384,
    },
    {
      title: "Apartamento 3 quartos Centro BH",
      type: "APARTMENT" as const,
      status: "PAUSED" as const,
      rentPrice: 2400,
      condoFee: 300,
      iptu: 55,
      area: 90,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 1,
      isFurnished: false,
      acceptsPets: false,
      zipCode: "30160-011",
      street: "Avenida Afonso Pena",
      number: "1200",
      neighborhood: "Centro",
      cidade: "Belo Horizonte",
      estado: "MG",
      latitude: -19.9145,
      longitude: -43.9344,
    },
    {
      title: "Studio compacto Tijuca RJ",
      type: "STUDIO" as const,
      status: "ACTIVE" as const,
      rentPrice: 1800,
      condoFee: 180,
      iptu: 40,
      area: 28,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      isFurnished: true,
      acceptsPets: false,
      zipCode: "20521-310",
      street: "Rua Haddock Lobo",
      number: "600",
      neighborhood: "Tijuca",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      latitude: -22.9227,
      longitude: -43.2423,
    },
  ];

  const imoveis = [];
  for (let i = 0; i < imoveisData.length; i++) {
    const dados = imoveisData[i];
    const slugBase = `${dados.title} ${dados.cidade}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    const slug = `${slugBase}-${String(i + 1).padStart(4, "0")}`;

    const imovel = await db.property.create({
      data: {
        landlordId: i < 2 ? admin.id : locador.id,
        title: dados.title,
        description: `Excelente ${dados.title.toLowerCase()}. Localizado em ${dados.neighborhood}, ${dados.cidade}/${dados.estado}. Ótima localização, próximo a transporte público, comércio e serviços.`,
        type: dados.type,
        status: dados.status,
        slug,
        rentPrice: dados.rentPrice,
        condoFee: dados.condoFee ?? undefined,
        iptu: dados.iptu ?? undefined,
        area: dados.area,
        bedrooms: dados.bedrooms,
        bathrooms: dados.bathrooms,
        parkingSpots: dados.parkingSpots,
        isFurnished: dados.isFurnished,
        acceptsPets: dados.acceptsPets,
        zipCode: dados.zipCode,
        street: dados.street,
        number: dados.number,
        neighborhood: dados.neighborhood,
        city: dados.cidade,
        state: dados.estado,
        latitude: dados.latitude,
        longitude: dados.longitude,
        viewCount: Math.floor(Math.random() * 200),
        photos: {
          create: [
            { url: `https://picsum.photos/seed/imovel${i}a/800/600`, order: 0 },
            { url: `https://picsum.photos/seed/imovel${i}b/800/600`, order: 1 },
            { url: `https://picsum.photos/seed/imovel${i}c/800/600`, order: 2 },
          ],
        },
      },
    });
    imoveis.push(imovel);
  }

  console.log(`✅ ${imoveis.length} imóveis criados`);

  // ─── 3. Conversa, proposta e contrato de exemplo ─────────────────────────

  const imovelContrato = imoveis[0];

  const conversa = await db.conversation.create({
    data: {
      propertyId: imovelContrato.id,
      tenantId: locatario.id,
      landlordId: imovelContrato.landlordId,
      messages: {
        create: [
          { senderId: locatario.id, content: "Olá! Vi o anúncio e tenho interesse. Posso fazer uma visita?", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { senderId: imovelContrato.landlordId, content: "Claro! Que tal sábado às 10h?", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { senderId: locatario.id, content: "Perfeito, confirmado!", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  const proposta = await db.proposal.create({
    data: {
      propertyId: imovelContrato.id,
      tenantId: locatario.id,
      landlordId: imovelContrato.landlordId,
      rentValue: 3000,
      entryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      durationMonths: 30,
      guarantee: "DEPOSIT",
      guaranteeDetails: { meses: 2, valor: 6000 },
      status: "ACCEPTED",
    },
  });

  const contrato = await db.contract.create({
    data: {
      proposalId: proposta.id,
      propertyId: imovelContrato.id,
      templateType: "RESIDENTIAL_LONG",
      landlordId: imovelContrato.landlordId,
      tenantId: locatario.id,
      rentValue: 3000,
      adjustmentIndex: "IGPM",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      durationMonths: 30,
      guarantee: "DEPOSIT",
      status: "ACTIVE",
      documentHash: "sha256-exemplo-hash-contrato-001",
      signatures: {
        create: [
          {
            userId: imovelContrato.landlordId,
            role: "LANDLORD",
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0 Seed",
            documentHash: "sha256-exemplo-hash-contrato-001",
          },
          {
            userId: locatario.id,
            role: "TENANT",
            ipAddress: "192.168.1.2",
            userAgent: "Mozilla/5.0 Seed",
            documentHash: "sha256-exemplo-hash-contrato-001",
          },
        ],
      },
    },
  });

  console.log("✅ Contrato de exemplo criado:", contrato.id);

  // ─── 4. Favoritos de demonstração ────────────────────────────────────────

  await db.favorite.createMany({
    data: imoveis.slice(1, 4).map((im) => ({
      userId: locatario.id,
      propertyId: im.id,
    })),
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log("\n📧 Contas de acesso:");
  console.log("   Admin:    ", process.env.SUPER_ADMIN_EMAIL ?? "admin@alugaja.com.br", "/ Senha@123");
  console.log("   Locador:   locador@exemplo.com / Senha@123");
  console.log("   Locatário: locatario@exemplo.com / Senha@123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
