import { Metadata } from "next";
import { ShieldCheck, AlertTriangle, Eye, CreditCard, FileText, Phone, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = { title: "Dicas de Segurança — Proteja-se de Golpes" };

export default function DicasSegurancaPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4">
          <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Dicas contra golpes</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          O aluguel de imóveis é um dos alvos favoritos de golpistas. Conheça os sinais de alerta e saiba como se proteger.
        </p>
      </div>

      {/* Alerta principal */}
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-10 flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800 dark:text-red-300">Atenção: a AlugaJá NUNCA pedirá pagamento fora da plataforma.</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">Qualquer solicitação de PIX ou transferência para pessoa física é golpe. Todos os pagamentos legítimos são feitos exclusivamente dentro do nosso site.</p>
        </div>
      </div>

      {/* Sinais de alerta */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
          <Eye className="h-5 w-5 text-amber-500" /> Sinais de alerta — desconfie se:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "O preço está muito abaixo do mercado da região",
            "O locador diz estar viajando ou no exterior e pede depósito antes da visita",
            "Pedem pagamento por PIX para pessoa física antes de qualquer contrato",
            "As fotos do imóvel parecem de catálogo ou de outro país",
            "O locador evita marcar visita presencial ao imóvel",
            "Pedem cópia de documentos sem nenhuma identificação em contrapartida",
            "O anúncio está em vários sites com preços e detalhes diferentes",
            "Pressa excessiva: 'tem outros interessados, pague agora para garantir'",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
              <XCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boas práticas */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Boas práticas — sempre faça:
        </h2>
        <div className="space-y-3">
          {[
            { titulo: "Visite o imóvel pessoalmente", desc: "Nunca feche negócio sem visitar o imóvel. Confirme que o imóvel existe e está nas condições anunciadas." },
            { titulo: "Exija documentação do locador", desc: "Peça comprovante de propriedade (matrícula do imóvel no Cartório de Registro de Imóveis) e RG/CPF do proprietário." },
            { titulo: "Assine contrato antes de pagar", desc: "Nunca pague qualquer valor antes de ter um contrato assinado em mãos. Use a assinatura digital da AlugaJá." },
            { titulo: "Confira se o locador é dono do imóvel", desc: "A matrícula do imóvel é pública e pode ser consultada no Cartório de Registro de Imóveis da região." },
            { titulo: "Faça vistorias documentadas", desc: "Registre o estado do imóvel com fotos no dia da entrada. Isso protege tanto o locatário quanto o locador." },
            { titulo: "Pague apenas pela plataforma", desc: "Todos os pagamentos de taxas da AlugaJá são feitos dentro do site, com comprovante automático." },
          ].map((item) => (
            <Card key={item.titulo}>
              <CardBody className="p-4 flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.titulo}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Golpes comuns */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-red-500" /> Golpes mais comuns no aluguel
        </h2>
        <div className="space-y-4">
          <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Golpe do Falso Locador</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">O golpista posta fotos de imóveis de outras plataformas ou do exterior como se fossem seus. Pede depósito ou taxa de reserva antes da visita e some com o dinheiro. <strong>Solução:</strong> nunca pague antes de visitar e confirmar a propriedade.</p>
          </div>
          <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Golpe do Proprietário Ausente</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">O "locador" afirma estar viajando e envia a chave pelo correio após pagamento. As chaves nunca chegam ou não abrem nada. <strong>Solução:</strong> insista em visita presencial. Se impossível, desista da negociação.</p>
          </div>
          <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Golpe do Imóvel Alugado por Inquilino</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">O próprio inquilino anuncia o imóvel como se fosse proprietário, recebe o valor do novo inquilino e desaparece. <strong>Solução:</strong> exija a matrícula do imóvel e confirme a identidade do verdadeiro proprietário.</p>
          </div>
        </div>
      </section>

      {/* Denúncia */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-500" /> Fui vítima de golpe. E agora?
        </h2>
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">1. Registre um Boletim de Ocorrência</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Na delegacia virtual do seu estado ou presencialmente na Delegacia de Crimes Digitais.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">2. Reporte na AlugaJá</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Use o botão "Reportar" no anúncio ou <Link href="/contato" className="underline">entre em contato</Link> com nosso suporte. Agimos rapidamente para remover anúncios fraudulentos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">3. Contate o Procon</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">O Procon pode ajudar na defesa dos seus direitos como consumidor. Ligue 151.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
