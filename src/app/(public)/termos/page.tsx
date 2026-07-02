import { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermosPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Termos de Uso</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">Última atualização: 1º de julho de 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">1. Aceitação dos Termos</h2>
          <p>Ao acessar ou utilizar a plataforma AlugaJá, você concorda integralmente com estes Termos de Uso e com nossa <a href="/privacidade" className="text-emerald-600 dark:text-emerald-400 hover:underline">Política de Privacidade</a>. Caso não concorde com qualquer disposição, pedimos que não utilize nossos serviços.</p>
          <p className="mt-3">A AlugaJá é uma plataforma digital que conecta locadores (proprietários) e locatários (inquilinos) de imóveis residenciais e comerciais, atuando exclusivamente como intermediadora tecnológica. Não somos parte nos contratos de locação celebrados entre os usuários.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">2. Definições</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Plataforma:</strong> o site e aplicativos da AlugaJá.</li>
            <li><strong>Locador:</strong> usuário que anuncia imóvel para locação.</li>
            <li><strong>Locatário:</strong> usuário que busca imóvel para alugar.</li>
            <li><strong>Anúncio:</strong> publicação de imóvel feita pelo Locador na Plataforma.</li>
            <li><strong>Contrato Digital:</strong> instrumento de locação gerado e assinado eletronicamente via Plataforma.</li>
            <li><strong>Taxa de Sucesso:</strong> remuneração cobrada pela AlugaJá ao Locador quando há fechamento de contrato via Plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">3. Cadastro e Conta</h2>
          <p>Para utilizar funcionalidades completas da Plataforma, é necessário criar uma conta fornecendo informações verdadeiras, precisas e atualizadas. Você é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
          <p className="mt-3">É vedado:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Criar contas com dados falsos ou de terceiros sem autorização;</li>
            <li>Utilizar a Plataforma para fins ilícitos ou contrários à boa-fé;</li>
            <li>Cadastrar o mesmo imóvel mais de uma vez;</li>
            <li>Utilizar meios automatizados (bots, scrapers) para acessar a Plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">4. Responsabilidades do Locador</h2>
          <p>O Locador declara e garante que:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>É proprietário ou possui autorização legal para anunciar o imóvel;</li>
            <li>As informações do anúncio (fotos, descrição, valores, metragem) são verídicas e atualizadas;</li>
            <li>O imóvel está em condições legais de habitabilidade e em conformidade com as normas municipais;</li>
            <li>Cumprirá os contratos firmados com os Locatários nos termos da Lei n.º 8.245/1991 (Lei do Inquilinato);</li>
            <li>Pagará a Taxa de Sucesso devida à AlugaJá nos prazos estabelecidos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">5. Responsabilidades do Locatário</h2>
          <p>O Locatário declara e garante que:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Utilizará o imóvel exclusivamente para a finalidade declarada no contrato;</li>
            <li>Pagará os valores de aluguel e encargos nos prazos acordados;</li>
            <li>Conservará o imóvel em bom estado e restituirá ao término da locação nas mesmas condições recebidas;</li>
            <li>Não sublocará o imóvel sem autorização expressa do Locador.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">6. Taxas e Pagamentos</h2>
          <p><strong>Anúncio:</strong> o cadastro de imóveis na Plataforma é gratuito.</p>
          <p className="mt-3"><strong>Taxa de Sucesso:</strong> cobrada do Locador ao fechamento de contrato via Plataforma, correspondente a 50% do valor do primeiro aluguel, com piso de R$ 150,00 e teto de R$ 1.500,00.</p>
          <p className="mt-3"><strong>Impulsionamento:</strong> serviço pago e opcional para destacar anúncios nos resultados de busca, disponível nos planos de 7, 15 ou 30 dias.</p>
          <p className="mt-3"><strong>AlugaJá Pro:</strong> assinatura mensal que isenta o Locador da Taxa de Sucesso e concede benefícios adicionais, incluindo um impulsionamento gratuito por mês.</p>
          <p className="mt-3">Todos os pagamentos são processados por meios seguros via Mercado Pago. A AlugaJá não armazena dados de cartão de crédito.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">7. Contratos de Locação Digitais</h2>
          <p>A AlugaJá disponibiliza modelos de contrato de locação para uso pelas partes. Estes modelos têm caráter meramente referencial e não substituem a orientação de um advogado especializado. A assinatura eletrônica realizada na Plataforma é válida nos termos da Medida Provisória n.º 2.200-2/2001 e do Marco Civil da Internet (Lei n.º 12.965/2014).</p>
          <p className="mt-3">A AlugaJá não é parte no contrato de locação e não se responsabiliza pelo cumprimento das obrigações contratuais pelas partes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">8. Limitação de Responsabilidade</h2>
          <p>A AlugaJá não se responsabiliza por:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Informações falsas prestadas por usuários em seus anúncios ou perfis;</li>
            <li>Inadimplemento de qualquer das partes nos contratos de locação;</li>
            <li>Danos ao imóvel causados pelo Locatário;</li>
            <li>Indisponibilidade temporária da Plataforma por manutenção ou falhas técnicas;</li>
            <li>Prejuízos decorrentes de uso indevido das credenciais de acesso pelo usuário.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">9. Propriedade Intelectual</h2>
          <p>Todos os elementos da Plataforma — incluindo marca, logotipo, layout, textos, funcionalidades e código-fonte — são de propriedade exclusiva da AlugaJá e protegidos pela Lei n.º 9.610/1998 (Lei de Direitos Autorais). É vedada a reprodução, distribuição ou uso comercial sem autorização prévia e expressa.</p>
          <p className="mt-3">Ao publicar fotos e conteúdos na Plataforma, o Locador concede à AlugaJá licença não exclusiva, gratuita e mundial para exibição nos serviços da Plataforma.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">10. Moderação e Encerramento de Conta</h2>
          <p>A AlugaJá reserva-se o direito de remover anúncios, suspender ou encerrar contas que violem estes Termos, sem necessidade de aviso prévio, nos seguintes casos:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Fraude, falsidade ideológica ou uso de dados de terceiros;</li>
            <li>Anúncios com conteúdo enganoso, ofensivo ou ilegal;</li>
            <li>Reincidência em reclamações fundamentadas por outros usuários;</li>
            <li>Tentativa de burlar o sistema de pagamentos da Plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">11. Disposições Gerais</h2>
          <p>Estes Termos são regidos pelas leis brasileiras. Qualquer controvérsia será dirimida no foro da comarca de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado que seja. A AlugaJá pode alterar estes Termos a qualquer tempo, sendo o usuário notificado por e-mail ou aviso na Plataforma. O uso continuado após a notificação implica aceitação das alterações.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">12. Contato</h2>
          <p>Dúvidas sobre estes Termos podem ser enviadas pelo nosso <a href="/contato" className="text-emerald-600 dark:text-emerald-400 hover:underline">formulário de contato</a> ou pelo e-mail <strong>juridico@alugaja.com.br</strong>.</p>
        </section>

      </div>
    </div>
  );
}
