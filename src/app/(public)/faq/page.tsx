"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PERGUNTAS = [
  {
    categoria: "Sobre a Plataforma",
    itens: [
      {
        pergunta: "O que é a AlugaJá?",
        resposta: "A AlugaJá é um marketplace de aluguel de imóveis que conecta locadores (proprietários) e locatários (inquilinos) diretamente, sem burocracia. Você pode anunciar, negociar, assinar contrato digital e processar pagamentos tudo em um só lugar.",
      },
      {
        pergunta: "A AlugaJá é gratuita?",
        resposta: "O cadastro e a busca de imóveis são totalmente gratuitos. Para locadores, cobramos uma Taxa de Sucesso de 50% do primeiro aluguel (mínimo R$ 150, máximo R$ 1.500) somente quando o contrato é fechado via plataforma. Existe também o plano AlugaJá Pro (R$ 49,90/mês) que zera essa taxa.",
      },
      {
        pergunta: "A AlugaJá é uma imobiliária?",
        resposta: "Não. Somos uma plataforma tecnológica de intermediação, não uma imobiliária. Não participamos como parte nos contratos de locação. Nossa função é facilitar a conexão entre as partes e fornecer as ferramentas para negociação, contrato e pagamento.",
      },
    ],
  },
  {
    categoria: "Para Locadores",
    itens: [
      {
        pergunta: "Como anuncio meu imóvel?",
        resposta: "Crie sua conta, acesse o Painel do Locador e clique em 'Novo imóvel'. Preencha as informações, adicione fotos de qualidade e publique. Seu anúncio passará por uma revisão rápida antes de ser publicado.",
      },
      {
        pergunta: "O que é a Taxa de Sucesso?",
        resposta: "É uma taxa cobrada quando um contrato de locação é fechado via AlugaJá. Corresponde a 50% do valor do primeiro aluguel, com piso de R$ 150,00 e teto de R$ 1.500,00. Usuários AlugaJá Pro não pagam essa taxa.",
      },
      {
        pergunta: "O que é o impulsionamento de anúncio?",
        resposta: "É um serviço pago que coloca seu anúncio em destaque nos resultados de busca, aumentando a visibilidade. Disponível nos planos de 7 dias (R$ 19,90), 15 dias (R$ 34,90) ou 30 dias (R$ 59,90).",
      },
      {
        pergunta: "O que é o AlugaJá Pro?",
        resposta: "É uma assinatura mensal por R$ 49,90 que oferece: isenção total da Taxa de Sucesso, um impulsionamento gratuito por mês e badge de verificado no perfil. Ideal para quem tem múltiplos imóveis ou alta rotatividade.",
      },
      {
        pergunta: "Posso usar meus próprios modelos de contrato?",
        resposta: "Sim. A AlugaJá disponibiliza 6 modelos de contrato baseados na Lei do Inquilinato (Lei 8.245/91), mas você também pode assinar contratos externos fora da plataforma. Recomendamos sempre a orientação de um advogado.",
      },
    ],
  },
  {
    categoria: "Para Locatários",
    itens: [
      {
        pergunta: "Como funciona a busca de imóveis?",
        resposta: "Acesse a página de busca, filtre por cidade, bairro, tipo de imóvel, valor, número de quartos e outros critérios. Você pode visualizar os resultados em lista ou no mapa interativo.",
      },
      {
        pergunta: "Como faço uma proposta?",
        resposta: "Ao encontrar um imóvel de interesse, inicie uma conversa com o locador e envie uma proposta com o valor, prazo de locação e garantia pretendida. O locador pode aceitar, recusar ou fazer uma contraproposta.",
      },
      {
        pergunta: "Como funciona a assinatura digital do contrato?",
        resposta: "Após a aceitação da proposta, a AlugaJá gera um contrato digital. Ambas as partes assinam eletronicamente na plataforma. A assinatura registra IP, data, hora e um hash SHA-256 do documento, com validade jurídica pela MP 2.200-2/2001.",
      },
      {
        pergunta: "Posso agendar uma visita antes de fechar?",
        resposta: "Sim. Na conversa com o locador, você pode solicitar uma visita ao imóvel. O locador confirma a data e horário disponível.",
      },
    ],
  },
  {
    categoria: "Pagamentos",
    itens: [
      {
        pergunta: "Quais formas de pagamento são aceitas?",
        resposta: "Aceitamos PIX (com QR Code) e cartão de crédito, processados com segurança pelo Mercado Pago. A AlugaJá não armazena dados de cartão.",
      },
      {
        pergunta: "Como funciona o pagamento do aluguel mensal?",
        resposta: "O pagamento de aluguel mensal é feito diretamente entre locador e locatário, fora da plataforma, conforme acordado no contrato. A AlugaJá processa apenas taxas da plataforma (Taxa de Sucesso, impulsionamentos e assinatura Pro).",
      },
      {
        pergunta: "Meu pagamento não foi confirmado. O que faço?",
        resposta: "Pagamentos via PIX são confirmados automaticamente em até 10 minutos. Para cartão de crédito, pode levar até 24h. Se após esse prazo não for confirmado, entre em contato pelo nosso suporte.",
      },
    ],
  },
  {
    categoria: "Segurança",
    itens: [
      {
        pergunta: "Como sei que o anúncio é verdadeiro?",
        resposta: "Todos os anúncios passam por revisão da nossa equipe antes de serem publicados. Locadores com perfil verificado (badge azul) tiveram identidade confirmada. Recomendamos sempre visitar o imóvel presencialmente antes de assinar qualquer documento.",
      },
      {
        pergunta: "A AlugaJá pede pagamento antecipado fora da plataforma?",
        resposta: "Nunca. Qualquer solicitação de pagamento fora da plataforma — especialmente por PIX para pessoa física ou transferência bancária — é golpe. Todos os pagamentos legítimos são feitos exclusivamente dentro da AlugaJá.",
      },
      {
        pergunta: "Como reporto um anúncio suspeito?",
        resposta: "Em qualquer anúncio há um botão 'Reportar'. Nossas equipe analisa cada denúncia e age rapidamente. Você também pode nos contatar pelo suporte.",
      },
    ],
  },
];

export default function FaqPage() {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  function toggleItem(key: string) {
    setAbertos((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Perguntas frequentes</h1>
        <p className="text-slate-500 dark:text-slate-400">Não encontrou sua dúvida? <a href="/contato" className="text-emerald-600 dark:text-emerald-400 hover:underline">Fale conosco</a>.</p>
      </div>

      <div className="space-y-8">
        {PERGUNTAS.map((cat) => (
          <div key={cat.categoria}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              {cat.categoria}
            </h2>
            <div className="space-y-2">
              {cat.itens.map((item, i) => {
                const key = `${cat.categoria}-${i}`;
                const aberto = abertos[key];
                return (
                  <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span>{item.pergunta}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} />
                    </button>
                    {aberto && (
                      <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
