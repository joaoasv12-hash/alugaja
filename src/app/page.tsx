import Link from "next/link";
import { Search, Shield, FileText, Star, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-800 dark:to-emerald-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-300 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-20 md:py-28 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <Building2 className="h-4 w-4" />
                <span>O marketplace de aluguel do Brasil</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Aluguel <span className="text-emerald-200">direto</span>,{" "}
                sem burocracia e sem taxa de entrada
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                Conectamos locadores e locatários diretamente. Anuncie grátis, negocie com segurança e assine o contrato digital — tudo em um lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/imoveis">
                  <Button tamanho="lg" variante="secondary" className="w-full sm:w-auto gap-2">
                    <Search className="h-5 w-5" />
                    Buscar imóveis
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button tamanho="lg" className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 gap-2">
                    Anunciar meu imóvel grátis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Busca rápida */}
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Cidade, bairro ou endereço…"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Tipo de imóvel</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="STUDIO">Kitnet/Studio</option>
                <option value="ROOM">Quarto</option>
                <option value="COMMERCIAL">Comercial</option>
              </select>
              <Link href="/imoveis">
                <Button tamanho="lg" className="w-full md:w-auto gap-2">
                  <Search className="h-5 w-5" />
                  Buscar
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Como funciona</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Simples, rápido e seguro</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                passo: "01",
                titulo: "Busque ou anuncie",
                descricao: "Locatários buscam imóveis com filtros avançados. Locadores anunciam grátis com até 20 fotos.",
                icone: Search,
              },
              {
                passo: "02",
                titulo: "Negocie com segurança",
                descricao: "Chat interno, agendamento de visitas e proposta formal — tudo rastreado na plataforma.",
                icone: Shield,
              },
              {
                passo: "03",
                titulo: "Contrato digital",
                descricao: "7 modelos em conformidade com a Lei do Inquilinato. Assine digitalmente com validade jurídica.",
                icone: FileText,
              },
            ].map(({ passo, titulo, descricao, icone: Icone }) => (
              <div key={passo} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Icone className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {passo}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{titulo}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por que AlugaJá */}
        <section className="bg-slate-100 dark:bg-slate-800/50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                  Por que o AlugaJá?
                </h2>
                <ul className="space-y-4">
                  {[
                    "Anunciar é 100% grátis — só paga se fechar negócio",
                    "Locatário não paga nenhuma taxa à plataforma",
                    "Contratos digitais com 7 modelos jurídicos",
                    "Verificação de perfil com selo de confiança",
                    "Chat, visitas e propostas em um só lugar",
                    "Avaliações mútuas — reputação real",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { numero: "Grátis", label: "para anunciar" },
                  { numero: "7", label: "modelos de contrato" },
                  { numero: "R$ 0", label: "taxa para locatário" },
                  { numero: "100%", label: "digital e seguro" },
                ].map(({ numero, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm"
                  >
                    <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{numero}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Pronto para encontrar seu próximo imóvel?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Cadastre-se agora, é grátis. Sem cartão de crédito.
            </p>
            <Link href="/cadastro">
              <Button tamanho="lg" className="gap-2">
                Começar agora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
