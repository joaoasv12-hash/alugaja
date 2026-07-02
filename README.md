# AlugaJá

Marketplace de aluguel de imóveis que conecta locadores e locatários diretamente — o "iFood das imobiliárias".

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Estilo | Tailwind CSS v4 |
| Banco de dados | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Autenticação | NextAuth.js v4 (e-mail/senha + Google) |
| Validação | Zod + React Hook Form |
| Ícones | Lucide React |

## Pré-requisitos

- Node.js 20.9+
- PostgreSQL 14+

## Configuração local

### 1. Instale dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/alugaja"
NEXTAUTH_SECRET="string-aleatoria-de-32-chars"
NEXTAUTH_URL="http://localhost:3000"
SUPER_ADMIN_EMAIL="seu@email.com"
```

### 3. Crie as tabelas

```bash
npm run db:push
```

### 4. Popule com dados de demonstração

```bash
npm run db:seed
```

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `SUPER_ADMIN_EMAIL` do .env | `Senha@123` |
| Locador | locador@exemplo.com | `Senha@123` |
| Locatário | locatario@exemplo.com | `Senha@123` |

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura de pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, cadastro, recuperar senha
│   ├── (dashboard)/        # Área autenticada
│   ├── admin/              # Painel SUPER_ADMIN
│   └── api/                # Route Handlers
├── components/
│   ├── ui/                 # Primitivos (Button, Input, Card, Badge, Alert)
│   ├── layout/             # Header, Footer
│   └── auth/               # Formulários
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma singleton
│   ├── utils/              # Utilitários
│   └── validations/        # Schemas Zod
├── constants/              # Preços, planos, labels PT-BR
└── types/                  # Tipos TypeScript
prisma/
├── schema.prisma           # 21 modelos
├── seed.ts                 # Dados de demonstração
└── prisma.config.ts        # Config Prisma 7
```

## Comandos

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run db:push      # Aplica schema ao banco (dev)
npm run db:migrate   # Cria migration (produção)
npm run db:seed      # Popula banco
npm run db:studio    # GUI do banco
npm run db:reset     # Reseta banco
```

## Decisões de arquitetura

**Prisma 7:** Exige driver adapter explícito. Usamos `@prisma/adapter-pg`.
O cliente gerado fica em `src/generated/prisma/`.

**Next.js 16:** `params`, `searchParams`, `cookies()` são 100% assíncronos.
```ts
const { slug } = await props.params
const cookieStore = await cookies()
```

**SUPER_ADMIN:** Concedido apenas ao e-mail em `SUPER_ADMIN_EMAIL`.
Nenhum usuário pode se autopromover.

**Modelo de cobrança:**
- Anunciar: gratuito
- Locatário: R$ 0
- Success fee: 50% do aluguel (piso R$ 150, teto R$ 1.500)
- Impulsionamento: R$ 19,90 / R$ 34,90 / R$ 59,90
- AlugaJá Pro: R$ 49,90/mês

## Roadmap de etapas

- [x] **Etapa 1** — Setup, banco, autenticação, perfil, dashboards
- [ ] **Etapa 2** — Anúncios, busca, filtros, mapa, favoritos
- [ ] **Etapa 3** — Chat, visitas, propostas
- [ ] **Etapa 4** — Contratos (7 modelos), PDF, assinatura digital
- [ ] **Etapa 5** — Pagamentos (Mercado Pago)
- [ ] **Etapa 6** — Admin completo
- [ ] **Etapa 7** — Avaliações, notificações, LGPD, SEO, testes

> Os modelos de contrato são referências e não substituem a orientação de um advogado.
