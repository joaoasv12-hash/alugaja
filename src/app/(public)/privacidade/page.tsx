import { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Política de Privacidade</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">Última atualização: 1º de julho de 2026</p>

      <div className="space-y-8 text-slate-700 dark:text-slate-300">

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">1. Quem somos</h2>
          <p>A AlugaJá é uma plataforma digital de intermediação imobiliária. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei n.º 13.709/2018)</strong> e o <strong>Marco Civil da Internet (Lei n.º 12.965/2014)</strong>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">2. Dados que coletamos</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">2.1 Dados fornecidos por você</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo, e-mail e senha (no cadastro);</li>
                <li>CPF/CNPJ, telefone e endereço (para contratos e faturamento);</li>
                <li>Fotos de imóveis e documentos enviados;</li>
                <li>Mensagens trocadas na Plataforma;</li>
                <li>Avaliações e comentários publicados.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">2.2 Dados coletados automaticamente</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Endereço IP e dados de geolocalização aproximada;</li>
                <li>Informações do dispositivo e navegador;</li>
                <li>Páginas visitadas, buscas realizadas e tempo de sessão;</li>
                <li>Cookies e tecnologias similares.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">2.3 Dados de terceiros</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Quando você faz login com Google, recebemos nome, e-mail e foto de perfil.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Prestação do serviço:</strong> criar e gerenciar sua conta, exibir anúncios, viabilizar a comunicação entre locadores e locatários e processar pagamentos;</li>
            <li><strong>Contratos digitais:</strong> identificar as partes e registrar assinaturas eletrônicas;</li>
            <li><strong>Segurança:</strong> detectar fraudes, verificar identidades e monitorar atividades suspeitas;</li>
            <li><strong>Comunicação:</strong> enviar notificações sobre a sua conta, alertas de mensagens, atualizações de contratos e novidades da Plataforma;</li>
            <li><strong>Melhoria do produto:</strong> analisar padrões de uso para aprimorar funcionalidades;</li>
            <li><strong>Obrigações legais:</strong> cumprir determinações judiciais, fiscais e regulatórias.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">4. Base legal para o tratamento</h2>
          <p>Tratamos seus dados com as seguintes bases legais previstas na LGPD:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Execução de contrato</strong> (art. 7º, V): para prestar os serviços solicitados;</li>
            <li><strong>Legítimo interesse</strong> (art. 7º, IX): para segurança, prevenção a fraudes e melhoria da Plataforma;</li>
            <li><strong>Consentimento</strong> (art. 7º, I): para envio de comunicações de marketing;</li>
            <li><strong>Cumprimento de obrigação legal</strong> (art. 7º, II): para atender exigências legais e regulatórias.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">5. Compartilhamento de dados</h2>
          <p>Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Entre usuários:</strong> informações do perfil e anúncios são visíveis para outros usuários conforme a natureza da Plataforma;</li>
            <li><strong>Processadores de pagamento:</strong> Mercado Pago, para processamento seguro de transações;</li>
            <li><strong>Armazenamento em nuvem:</strong> Cloudinary (fotos) e Neon/PostgreSQL (dados);</li>
            <li><strong>Autoridades públicas:</strong> quando exigido por lei, ordem judicial ou para proteção de direitos.</li>
          </ul>
          <p className="mt-3">Todos os parceiros com acesso a dados pessoais assinam acordos de confidencialidade e tratamento de dados.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">6. Cookies</h2>
          <p>Utilizamos cookies para:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Sessão:</strong> manter você conectado;</li>
            <li><strong>Preferências:</strong> salvar configurações como tema (claro/escuro);</li>
            <li><strong>Análise:</strong> entender como os usuários utilizam a Plataforma.</li>
          </ul>
          <p className="mt-3">Você pode desabilitar cookies no seu navegador, mas algumas funcionalidades podem deixar de funcionar.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">7. Retenção de dados</h2>
          <p>Mantemos seus dados pelo tempo necessário para:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Prestar os serviços contratados;</li>
            <li>Cumprir obrigações legais (prazo mínimo de 5 anos para dados de transações financeiras);</li>
            <li>Resolver disputas e fazer cumprir nossos acordos.</li>
          </ul>
          <p className="mt-3">Após o encerramento da conta, os dados são anonimizados ou excluídos, salvo quando a retenção for legalmente obrigatória.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">8. Seus direitos (LGPD)</h2>
          <p>Como titular de dados, você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Acesso:</strong> saber quais dados temos sobre você;</li>
            <li><strong>Correção:</strong> atualizar informações incorretas ou desatualizadas;</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado (exportação disponível em <a href="/configuracoes/privacidade" className="text-emerald-600 dark:text-emerald-400 hover:underline">Configurações → Privacidade</a>);</li>
            <li><strong>Exclusão:</strong> solicitar a anonimização ou exclusão dos seus dados (mesma página);</li>
            <li><strong>Revogação de consentimento:</strong> cancelar autorizações de marketing a qualquer momento;</li>
            <li><strong>Oposição:</strong> contestar o tratamento baseado em legítimo interesse.</li>
          </ul>
          <p className="mt-3">Exercite seus direitos diretamente em <a href="/configuracoes/privacidade" className="text-emerald-600 dark:text-emerald-400 hover:underline">Configurações → Privacidade</a> ou pelo e-mail <strong>privacidade@alugaja.com.br</strong>. Responderemos em até 15 dias úteis.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">9. Segurança</h2>
          <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Criptografia TLS para dados em trânsito;</li>
            <li>Senhas armazenadas com hash bcrypt (nunca em texto puro);</li>
            <li>Controle de acesso por funções (RBAC);</li>
            <li>Monitoramento de acessos e log de auditoria;</li>
            <li>Banco de dados em ambiente cloud com backups automáticos.</li>
          </ul>
          <p className="mt-3">Em caso de incidente de segurança que possa afetar seus dados, você será notificado conforme exigido pela LGPD.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">10. Encarregado de Dados (DPO)</h2>
          <p>Nosso Encarregado de Proteção de Dados pode ser contatado pelo e-mail <strong>privacidade@alugaja.com.br</strong>. Você também pode registrar reclamações perante a <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> em gov.br/anpd.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">11. Alterações nesta Política</h2>
          <p>Esta Política pode ser atualizada periodicamente. Notificaremos você por e-mail ou aviso na Plataforma quando houver alterações relevantes. A data de última atualização está sempre indicada no topo desta página.</p>
        </section>

      </div>
    </div>
  );
}
