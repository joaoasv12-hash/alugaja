import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { GuaranteeType, AdjustmentIndex, ContractType } from "@/generated/prisma/enums";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, paddingHorizontal: 60, paddingVertical: 50, color: "#1a1a1a" },
  titulo: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  subtitulo: { fontSize: 9, textAlign: "center", color: "#666", marginBottom: 20 },
  secao: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  paragrafo: { lineHeight: 1.6, marginBottom: 6, textAlign: "justify" },
  negrito: { fontFamily: "Helvetica-Bold" },
  linha: { borderBottom: "1pt solid #ccc", marginTop: 20, marginBottom: 6 },
  assinatura: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  campoAssinatura: { width: "45%", borderTop: "1pt solid #333", paddingTop: 4 },
  textoAssinatura: { fontSize: 9, textAlign: "center", color: "#555" },
  rodape: { fontSize: 7, color: "#999", textAlign: "center", position: "absolute", bottom: 20, left: 60, right: 60 },
  quadro: { border: "1pt solid #ccc", padding: 10, marginVertical: 8, borderRadius: 4 },
  gridRow: { flexDirection: "row", marginBottom: 4 },
  gridLabel: { width: "38%", fontFamily: "Helvetica-Bold", fontSize: 9 },
  gridValue: { flex: 1, fontSize: 9 },
  aviso: { backgroundColor: "#fffbeb", border: "1pt solid #f59e0b", padding: 8, marginVertical: 8, borderRadius: 4 },
  avisoTexto: { fontSize: 8, color: "#92400e" },
});

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatarData(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const GARANTIA_LABEL: Record<string, string> = {
  DEPOSIT: "Caução (depósito em dinheiro)",
  GUARANTOR: "Fiança (fiador)",
  INSURANCE: "Seguro fiança",
};

const INDICE_LABEL: Record<string, string> = {
  IGPM: "IGP-M (Índice Geral de Preços do Mercado)",
  IPCA: "IPCA (Índice Nacional de Preços ao Consumidor Amplo)",
  OTHER: "Outro índice legalmente permitido",
};

const TIPO_LABEL: Record<string, string> = {
  RESIDENTIAL_LONG: "CONTRATO DE LOCAÇÃO RESIDENCIAL",
  RESIDENTIAL_SHORT: "CONTRATO DE LOCAÇÃO RESIDENCIAL",
  SEASONAL: "CONTRATO DE LOCAÇÃO POR TEMPORADA",
  ROOM_SHARING: "CONTRATO DE LOCAÇÃO DE CÔMODO/QUARTO",
  COMMERCIAL: "CONTRATO DE LOCAÇÃO COMERCIAL",
  RENEWAL_ADDENDUM: "ADITIVO DE RENOVAÇÃO CONTRATUAL",
};

interface DadosContrato {
  templateType: ContractType;
  rentValue: number;
  startDate: Date | string;
  endDate?: Date | string | null;
  durationMonths: number;
  guarantee: GuaranteeType;
  adjustmentIndex: AdjustmentIndex;
  documentHash: string;
  landlord: {
    name: string;
    email: string;
    cpfCnpj?: string | null;
  };
  tenant: {
    name: string;
    email: string;
    cpfCnpj?: string | null;
  };
  property: {
    title: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpots: number;
  };
  signatures: {
    role: string;
    signedAt: Date | string;
    ipAddress: string;
  }[];
}

function Cabecalho({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.titulo}>{TIPO_LABEL[dados.templateType]}</Text>
      <Text style={styles.subtitulo}>
        Lei do Inquilinato nº 8.245/1991 · AlugaJá Marketplace · Hash: {dados.documentHash.slice(0, 16)}…
      </Text>

      <View style={styles.quadro}>
        <Text style={[styles.secao, { marginTop: 0 }]}>Partes</Text>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>LOCADOR (Proprietário):</Text>
          <Text style={styles.gridValue}>
            {dados.landlord.name}{dados.landlord.cpfCnpj ? ` · CPF/CNPJ: ${dados.landlord.cpfCnpj}` : ""}
          </Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>LOCATÁRIO (Inquilino):</Text>
          <Text style={styles.gridValue}>
            {dados.tenant.name}{dados.tenant.cpfCnpj ? ` · CPF/CNPJ: ${dados.tenant.cpfCnpj}` : ""}
          </Text>
        </View>

        <Text style={[styles.secao, { marginTop: 8 }]}>Imóvel</Text>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Endereço:</Text>
          <Text style={styles.gridValue}>
            {dados.property.street}, {dados.property.number}
            {dados.property.complement ? `, ${dados.property.complement}` : ""} — {dados.property.neighborhood},{" "}
            {dados.property.city}/{dados.property.state} · CEP {dados.property.zipCode}
          </Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridLabel}>Características:</Text>
          <Text style={styles.gridValue}>
            {dados.property.area}m² · {dados.property.bedrooms} quartos · {dados.property.bathrooms} banheiros
            {dados.property.parkingSpots > 0 ? ` · ${dados.property.parkingSpots} vaga(s)` : ""}
          </Text>
        </View>
      </View>
    </>
  );
}

function ClausulasComuns({ dados }: { dados: DadosContrato }) {
  const dataFim = dados.endDate ?? new Date(new Date(dados.startDate).setMonth(new Date(dados.startDate).getMonth() + dados.durationMonths));

  return (
    <>
      <Text style={styles.secao}>Cláusula 1ª — Do Prazo</Text>
      <Text style={styles.paragrafo}>
        O presente contrato vigorará pelo prazo de{" "}
        <Text style={styles.negrito}>{dados.durationMonths} (
        {dados.durationMonths === 12 ? "doze" : dados.durationMonths === 24 ? "vinte e quatro" : dados.durationMonths === 30 ? "trinta" : dados.durationMonths === 36 ? "trinta e seis" : String(dados.durationMonths)}
        ) meses</Text>, com início em{" "}
        <Text style={styles.negrito}>{formatarData(dados.startDate)}</Text> e término previsto em{" "}
        <Text style={styles.negrito}>{formatarData(dataFim)}</Text>, podendo ser prorrogado na
        forma da lei mediante acordo expresso entre as partes.
      </Text>

      <Text style={styles.secao}>Cláusula 2ª — Do Aluguel</Text>
      <Text style={styles.paragrafo}>
        O LOCATÁRIO pagará mensalmente ao LOCADOR, a título de aluguel, a importância de{" "}
        <Text style={styles.negrito}>{formatarMoeda(dados.rentValue)} ({dados.rentValue.toLocaleString("pt-BR")} reais)</Text>,
        vencíveis todo dia 5 (cinco) do mês subsequente ao vencido, mediante depósito bancário
        ou transferência na conta indicada pelo LOCADOR.
      </Text>
      <Text style={styles.paragrafo}>
        Parágrafo único: O valor do aluguel será reajustado anualmente pelo índice{" "}
        <Text style={styles.negrito}>{INDICE_LABEL[dados.adjustmentIndex]}</Text>, nos termos do
        art. 18 da Lei nº 8.245/1991, observada a periodicidade mínima de 12 (doze) meses.
      </Text>

      <Text style={styles.secao}>Cláusula 3ª — Da Garantia</Text>
      <Text style={styles.paragrafo}>
        Como garantia da presente locação, nos termos do art. 37 da Lei nº 8.245/1991,
        fica estabelecida a modalidade de{" "}
        <Text style={styles.negrito}>{GARANTIA_LABEL[dados.guarantee]}</Text>.
        {dados.guarantee === "DEPOSIT" && (
          ` O LOCATÁRIO depositará quantia equivalente a 3 (três) meses de aluguel — ${formatarMoeda(dados.rentValue * 3)} — em conta corrente
          separada, a ser devolvida ao término da locação, devidamente atualizada, caso não haja débitos pendentes.`
        )}
        {dados.guarantee === "GUARANTOR" && (
          " O fiador se obriga solidariamente com o LOCATÁRIO pelas obrigações decorrentes desta locação, renunciando ao benefício de ordem previsto no art. 827 do Código Civil."
        )}
        {dados.guarantee === "INSURANCE" && (
          " O LOCATÁRIO apresentará apólice de seguro fiança vigente, cobrindo no mínimo 12 (doze) meses de aluguel, a ser renovada periodicamente enquanto durar a locação."
        )}
      </Text>

      <Text style={styles.secao}>Cláusula 4ª — Das Obrigações do Locador</Text>
      <Text style={styles.paragrafo}>
        O LOCADOR obriga-se a: (a) entregar o imóvel em estado de servir ao uso a que se destina
        (art. 22, I, Lei 8.245/91); (b) garantir o uso pacífico do imóvel durante a locação;
        (c) manter a forma e destinação do imóvel; (d) responder pelos vícios ou defeitos
        anteriores à locação; (e) fornecer ao LOCATÁRIO recibo dos valores pagos, com a
        discriminação dos valores e a identificação do imóvel.
      </Text>

      <Text style={styles.secao}>Cláusula 5ª — Das Obrigações do Locatário</Text>
      <Text style={styles.paragrafo}>
        O LOCATÁRIO obriga-se a: (a) pagar pontualmente o aluguel e encargos; (b) usar o imóvel
        para o fim convencionado; (c) restituir o imóvel no estado em que o recebeu, salvo
        deteriorações naturais; (d) não modificar a forma interna ou externa do imóvel sem
        consentimento prévio e por escrito do LOCADOR; (e) realizar a imediata reparação dos
        danos verificados no imóvel, decorrentes de seu uso; (f) não sublocar, ceder ou
        emprestar o imóvel sem anuência prévia e escrita do LOCADOR.
      </Text>

      <Text style={styles.secao}>Cláusula 6ª — Das Benfeitorias</Text>
      <Text style={styles.paragrafo}>
        As benfeitorias necessárias introduzidas pelo LOCATÁRIO, ainda que não autorizadas pelo
        LOCADOR, bem como as úteis, desde que autorizadas, serão indenizáveis, autorizando
        o direito de retenção. As benfeitorias voluptuárias não serão indenizáveis, podendo ser
        levantadas pelo LOCATÁRIO, finda a locação, desde que sua retirada não afete a estrutura
        e a substância do imóvel (art. 35-36, Lei 8.245/91).
      </Text>

      <Text style={styles.secao}>Cláusula 7ª — Da Rescisão</Text>
      <Text style={styles.paragrafo}>
        O descumprimento de qualquer cláusula do presente contrato, por qualquer das partes,
        importará em rescisão imediata, com as sanções legais cabíveis. A parte que der
        causa à rescisão responderá por perdas e danos. O LOCATÁRIO poderá devolver o imóvel
        antes do término do prazo, pagando multa proporcional ao período faltante, nos termos
        do art. 4º da Lei nº 8.245/1991.
      </Text>

      <Text style={styles.secao}>Cláusula 8ª — Do Foro</Text>
      <Text style={styles.paragrafo}>
        As partes elegem o foro da Comarca de {dados.property.city}/{dados.property.state} para
        dirimir quaisquer dúvidas oriundas do presente contrato, renunciando a qualquer outro,
        por mais privilegiado que seja.
      </Text>
    </>
  );
}

function ClausulasResidencialLonga({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.secao}>Cláusula 9ª — Da Desocupação</Text>
      <Text style={styles.paragrafo}>
        Por tratar-se de contrato com prazo igual ou superior a 30 (trinta) meses, findo o
        prazo contratual o LOCADOR poderá retomar o imóvel independentemente de notificação,
        nos termos do art. 46 da Lei nº 8.245/1991. Se o LOCATÁRIO permanecer no imóvel por
        mais de 30 dias após o término sem oposição do LOCADOR, o contrato prorrogar-se-á
        por prazo indeterminado.
      </Text>
    </>
  );
}

function ClausulasResidencialCurta({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.secao}>Cláusula 9ª — Da Desocupação (Prazo Inferior a 30 Meses)</Text>
      <Text style={styles.paragrafo}>
        Por tratar-se de contrato residencial com prazo inferior a 30 (trinta) meses, nos termos
        do art. 47 da Lei nº 8.245/1991, a retomada pelo LOCADOR somente poderá ocorrer nas
        hipóteses taxativamente previstas em lei, quais sejam: uso próprio, por cônjuge ou
        companheiro, demolição ou reparação urgente, extinção do usufruto/fideicomisso, venda do
        imóvel, denúncia vazia após 5 anos de contrato ou nas demais hipóteses legais.
      </Text>
    </>
  );
}

function ClausulasTemporada({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.secao}>Cláusula 9ª — Da Natureza por Temporada</Text>
      <Text style={styles.paragrafo}>
        A presente locação rege-se pelo disposto nos arts. 48 a 50 da Lei nº 8.245/1991,
        sendo caracterizada como locação por temporada, destinada ao lazer, realização de
        cursos, tratamento de saúde, feitura de obras no imóvel do LOCATÁRIO ou outras
        razões de natureza transitória. O prazo máximo é de 90 (noventa) dias.
      </Text>
      <Text style={styles.paragrafo}>
        Parágrafo único: Findo o prazo sem desocupação, a locação será considerada por
        prazo indeterminado, passando a viger as normas das locações residenciais comuns,
        e o aluguel devido será o fixado neste instrumento ou aquele acordado entre as partes.
      </Text>
    </>
  );
}

function ClausulasQuarto() {
  return (
    <>
      <Text style={styles.secao}>Cláusula 9ª — Da Locação de Cômodo</Text>
      <Text style={styles.paragrafo}>
        O presente contrato tem por objeto a locação de cômodo/quarto em imóvel compartilhado.
        O LOCATÁRIO terá uso exclusivo do quarto descrito e acesso compartilhado às áreas
        comuns do imóvel (cozinha, sala, banheiro(s) indicados), observando as regras de
        convivência estabelecidas de comum acordo.
      </Text>
      <Text style={styles.paragrafo}>
        Parágrafo único: É vedado ao LOCATÁRIO receber hóspedes permanentes sem anuência
        prévia do LOCADOR. O imóvel destina-se exclusivamente à moradia do LOCATÁRIO.
      </Text>
    </>
  );
}

function ClausulasComercial({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.secao}>Cláusula 9ª — Da Destinação Comercial</Text>
      <Text style={styles.paragrafo}>
        O imóvel destina-se exclusivamente ao exercício de atividade comercial/empresarial
        pelo LOCATÁRIO. Qualquer alteração de uso depende de prévia e expressa anuência do
        LOCADOR. A locação comercial rege-se pelos arts. 51 a 57 da Lei nº 8.245/1991.
      </Text>
      <Text style={styles.secao}>Cláusula 10ª — Da Ação Renovatória</Text>
      <Text style={styles.paragrafo}>
        Preenchidos os requisitos do art. 51 da Lei nº 8.245/1991 (contrato escrito com
        prazo determinado, locação por prazo mínimo de 5 anos e exploração do comércio por
        3 anos ininterruptos), o LOCATÁRIO terá direito à renovação do contrato, devendo
        propor a ação renovatória no prazo decadencial previsto em lei (entre 1 e 6 meses
        antes do vencimento do contrato).
      </Text>
    </>
  );
}

function ClausulasAditivo({ dados }: { dados: DadosContrato }) {
  return (
    <>
      <Text style={styles.secao}>Cláusula 1ª — Do Objeto</Text>
      <Text style={styles.paragrafo}>
        O presente instrumento constitui aditivo ao Contrato de Locação original, firmado
        entre as partes identificadas acima, prorrogando o prazo da locação pelo período
        adicional de <Text style={styles.negrito}>{dados.durationMonths} meses</Text>, com
        início em <Text style={styles.negrito}>{formatarData(dados.startDate)}</Text>.
      </Text>
      <Text style={styles.secao}>Cláusula 2ª — Do Novo Valor</Text>
      <Text style={styles.paragrafo}>
        As partes acordam o novo valor de aluguel em{" "}
        <Text style={styles.negrito}>{formatarMoeda(dados.rentValue)}/mês</Text>, reajustado
        conforme o índice <Text style={styles.negrito}>{INDICE_LABEL[dados.adjustmentIndex]}</Text>.
      </Text>
      <Text style={styles.secao}>Cláusula 3ª — Da Manutenção das Demais Cláusulas</Text>
      <Text style={styles.paragrafo}>
        Permanecem em vigor todas as demais cláusulas e condições do contrato original,
        não alteradas pelo presente aditivo.
      </Text>
    </>
  );
}

function Assinaturas({ dados }: { dados: DadosContrato }) {
  const locadorSign = dados.signatures.find((s) => s.role === "LANDLORD");
  const locatarioSign = dados.signatures.find((s) => s.role === "TENANT");

  return (
    <>
      <View style={styles.linha} />
      <Text style={[styles.paragrafo, { textAlign: "center", fontSize: 9, marginBottom: 4 }]}>
        {dados.property.city}, {formatarData(new Date())}
      </Text>
      <View style={styles.assinatura}>
        <View style={styles.campoAssinatura}>
          <Text style={styles.textoAssinatura}>LOCADOR</Text>
          <Text style={[styles.textoAssinatura, { fontFamily: "Helvetica-Bold" }]}>{dados.landlord.name}</Text>
          {locadorSign ? (
            <Text style={[styles.textoAssinatura, { color: "#059669" }]}>
              ✓ Assinado em {formatarData(locadorSign.signedAt)} · IP: {locadorSign.ipAddress}
            </Text>
          ) : (
            <Text style={[styles.textoAssinatura, { color: "#d97706" }]}>⏳ Assinatura pendente</Text>
          )}
        </View>
        <View style={styles.campoAssinatura}>
          <Text style={styles.textoAssinatura}>LOCATÁRIO</Text>
          <Text style={[styles.textoAssinatura, { fontFamily: "Helvetica-Bold" }]}>{dados.tenant.name}</Text>
          {locatarioSign ? (
            <Text style={[styles.textoAssinatura, { color: "#059669" }]}>
              ✓ Assinado em {formatarData(locatarioSign.signedAt)} · IP: {locatarioSign.ipAddress}
            </Text>
          ) : (
            <Text style={[styles.textoAssinatura, { color: "#d97706" }]}>⏳ Assinatura pendente</Text>
          )}
        </View>
      </View>

      <View style={styles.aviso}>
        <Text style={styles.avisoTexto}>
          Documento gerado digitalmente pela plataforma AlugaJá. Hash SHA-256: {dados.documentHash}
          {"\n"}As assinaturas eletrônicas possuem validade jurídica nos termos da MP 2.200-2/2001 e da Lei 14.063/2020.
        </Text>
      </View>
    </>
  );
}

export function ContratoPDF({ dados }: { dados: DadosContrato }) {
  const isAditivo = dados.templateType === "RENEWAL_ADDENDUM";

  return (
    <Document
      title={TIPO_LABEL[dados.templateType]}
      author="AlugaJá"
      subject="Contrato de Locação"
    >
      <Page size="A4" style={styles.page}>
        <Cabecalho dados={dados} />

        {isAditivo ? (
          <ClausulasAditivo dados={dados} />
        ) : (
          <>
            <ClausulasComuns dados={dados} />
            {dados.templateType === "RESIDENTIAL_LONG" && <ClausulasResidencialLonga dados={dados} />}
            {dados.templateType === "RESIDENTIAL_SHORT" && <ClausulasResidencialCurta dados={dados} />}
            {dados.templateType === "SEASONAL" && <ClausulasTemporada dados={dados} />}
            {dados.templateType === "ROOM_SHARING" && <ClausulasQuarto />}
            {dados.templateType === "COMMERCIAL" && <ClausulasComercial dados={dados} />}
          </>
        )}

        <Assinaturas dados={dados} />

        <Text style={styles.rodape} fixed>
          AlugaJá · Contrato {dados.templateType} · {dados.documentHash.slice(0, 8)}… · Gerado em {new Date().toLocaleDateString("pt-BR")}
        </Text>
      </Page>
    </Document>
  );
}
