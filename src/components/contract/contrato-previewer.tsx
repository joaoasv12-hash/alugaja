"use client";

import { useState } from "react";
import { AssinarModal } from "./assinar-modal";
import { Button } from "@/components/ui/button";
import { Shield, Building2 } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { TIPOS_CONTRATO, GARANTIAS } from "@/constants";

interface DadosContrato {
  id: string;
  templateType: string;
  rentValue: string | number;
  startDate: Date | string;
  endDate?: Date | string | null;
  durationMonths: number;
  guarantee: string;
  adjustmentIndex: string;
  documentHash?: string | null;
  status: string;
  landlord: {
    email: string;
    profile?: { name?: string | null; cpfCnpj?: string | null } | null;
  };
  tenant: {
    email: string;
    profile?: { name?: string | null; cpfCnpj?: string | null } | null;
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
  signatures: { role: string; signedAt: Date | string; ipAddress: string; userId: string }[];
}

interface ContratoPreviewerProps {
  contrato: DadosContrato;
}

function formatarDataPT(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const TIPO_TITULO: Record<string, string> = {
  RESIDENTIAL_LONG: "CONTRATO DE LOCAÇÃO RESIDENCIAL (PRAZO ≥ 30 MESES)",
  RESIDENTIAL_SHORT: "CONTRATO DE LOCAÇÃO RESIDENCIAL (PRAZO < 30 MESES)",
  SEASONAL: "CONTRATO DE LOCAÇÃO POR TEMPORADA",
  ROOM_SHARING: "CONTRATO DE LOCAÇÃO DE CÔMODO / QUARTO",
  COMMERCIAL: "CONTRATO DE LOCAÇÃO PARA FINS COMERCIAIS",
  RENEWAL_ADDENDUM: "ADITIVO DE RENOVAÇÃO CONTRATUAL",
};

const INDICE_LABEL: Record<string, string> = {
  IGPM: "IGP-M",
  IPCA: "IPCA",
  OTHER: "Outro índice legal",
};

function PreviewHTML({ contrato }: { contrato: DadosContrato }) {
  const locador = contrato.landlord.profile?.name ?? contrato.landlord.email;
  const locatario = contrato.tenant.profile?.name ?? contrato.tenant.email;
  const inicio = formatarDataPT(contrato.startDate);
  const fimDate = contrato.endDate ?? new Date(new Date(contrato.startDate).setMonth(new Date(contrato.startDate).getMonth() + contrato.durationMonths));
  const fim = formatarDataPT(fimDate);
  const aluguel = formatarMoeda(Number(contrato.rentValue));
  const prop = contrato.property;
  const garantia = GARANTIAS[contrato.guarantee as keyof typeof GARANTIAS] ?? contrato.guarantee;
  const indice = INDICE_LABEL[contrato.adjustmentIndex] ?? contrato.adjustmentIndex;

  const clausulasEspecificas: Record<string, string> = {
    RESIDENTIAL_LONG: `<strong>Cláusula 9ª — Da Desocupação (Art. 46, Lei 8.245/91):</strong> Por tratar-se de contrato com prazo igual ou superior a 30 (trinta) meses, findo o prazo contratual o LOCADOR poderá retomar o imóvel independentemente de notificação. Se o LOCATÁRIO permanecer no imóvel por mais de 30 dias após o término sem oposição, o contrato prorrogar-se-á por prazo indeterminado.`,
    RESIDENTIAL_SHORT: `<strong>Cláusula 9ª — Da Desocupação (Art. 47, Lei 8.245/91):</strong> Por tratar-se de contrato com prazo inferior a 30 (trinta) meses, a retomada pelo LOCADOR somente ocorrerá nas hipóteses previstas em lei (uso próprio, demolição, venda, denúncia vazia após 5 anos etc.).`,
    SEASONAL: `<strong>Cláusula 9ª — Da Natureza por Temporada (Arts. 48-50, Lei 8.245/91):</strong> Destinada ao lazer, realização de cursos ou razões de natureza transitória. Prazo máximo de 90 dias. Findo o prazo sem desocupação, converte-se em locação por prazo indeterminado.`,
    ROOM_SHARING: `<strong>Cláusula 9ª — Da Locação de Cômodo:</strong> O LOCATÁRIO terá uso exclusivo do quarto descrito e acesso compartilhado às áreas comuns. Vedado receber hóspedes permanentes sem anuência do LOCADOR.`,
    COMMERCIAL: `<strong>Cláusula 9ª — Da Destinação Comercial (Arts. 51-57, Lei 8.245/91):</strong> Destinado exclusivamente ao exercício de atividade empresarial. O LOCATÁRIO terá direito à ação renovatória preenchidos os requisitos do art. 51 da Lei 8.245/91.`,
    RENEWAL_ADDENDUM: `<strong>Cláusula 1ª — Do Objeto:</strong> O presente aditivo renova o contrato de locação vigente entre as partes pelo prazo adicional de ${contrato.durationMonths} meses, com início em ${inicio}. As demais cláusulas permanecem vigentes.`,
  };

  return (
    <div className="font-serif text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-4">
      <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-600">
        <p className="font-bold text-base">{TIPO_TITULO[contrato.templateType]}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Lei do Inquilinato nº 8.245/1991 · AlugaJá
          {contrato.documentHash && ` · Hash: ${contrato.documentHash.slice(0, 12)}…`}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 space-y-2 text-sm">
        <p><strong>LOCADOR:</strong> {locador}{contrato.landlord.profile?.cpfCnpj ? ` · CPF/CNPJ: ${contrato.landlord.profile.cpfCnpj}` : ""}</p>
        <p><strong>LOCATÁRIO:</strong> {locatario}{contrato.tenant.profile?.cpfCnpj ? ` · CPF/CNPJ: ${contrato.tenant.profile.cpfCnpj}` : ""}</p>
        <p className="pt-2 border-t border-slate-200 dark:border-slate-600">
          <strong>IMÓVEL:</strong> {prop.street}, {prop.number}{prop.complement ? `, ${prop.complement}` : ""} — {prop.neighborhood}, {prop.city}/{prop.state} · CEP {prop.zipCode}<br />
          <strong>Características:</strong> {prop.area}m² · {prop.bedrooms} quartos · {prop.bathrooms} banheiros{prop.parkingSpots > 0 ? ` · ${prop.parkingSpots} vaga(s)` : ""}
        </p>
      </div>

      {contrato.templateType !== "RENEWAL_ADDENDUM" && (
        <>
          <div><strong>Cláusula 1ª — Do Prazo:</strong> O presente contrato vigorará pelo prazo de <strong>{contrato.durationMonths} meses</strong>, com início em <strong>{inicio}</strong> e término previsto em <strong>{fim}</strong>, podendo ser prorrogado mediante acordo expresso entre as partes.</div>

          <div><strong>Cláusula 2ª — Do Aluguel:</strong> O LOCATÁRIO pagará mensalmente ao LOCADOR a importância de <strong>{aluguel}</strong>, vencíveis todo dia 5 do mês subsequente, mediante depósito bancário ou transferência. O valor será reajustado anualmente pelo índice <strong>{indice}</strong>, nos termos do art. 18 da Lei nº 8.245/1991.</div>

          <div><strong>Cláusula 3ª — Da Garantia:</strong> Como garantia, na modalidade de <strong>{garantia}</strong>, nos termos do art. 37 da Lei nº 8.245/1991.
            {contrato.guarantee === "DEPOSIT" && ` O LOCATÁRIO depositará ${formatarMoeda(Number(contrato.rentValue) * 3)} (três meses de aluguel), a ser devolvido ao término, corrigido monetariamente.`}
            {contrato.guarantee === "GUARANTOR" && " O fiador se obriga solidariamente, renunciando ao benefício de ordem (art. 827, CC)."}
            {contrato.guarantee === "INSURANCE" && " O LOCATÁRIO apresentará apólice de seguro fiança vigente, cobrindo no mínimo 12 meses de aluguel."}
          </div>

          <div><strong>Cláusula 4ª — Das Obrigações do Locador:</strong> O LOCADOR obriga-se a: (a) entregar o imóvel em estado de servir ao uso destinado; (b) garantir o uso pacífico durante a locação; (c) manter a forma e destinação do imóvel; (d) responder pelos vícios anteriores à locação; (e) fornecer recibos discriminados dos valores pagos.</div>

          <div><strong>Cláusula 5ª — Das Obrigações do Locatário:</strong> O LOCATÁRIO obriga-se a: (a) pagar pontualmente o aluguel e encargos; (b) usar o imóvel para o fim convencionado; (c) restituir o imóvel no estado em que o recebeu; (d) não modificar a forma do imóvel sem consentimento prévio; (e) não sublocar, ceder ou emprestar sem anuência escrita do LOCADOR.</div>

          <div><strong>Cláusula 6ª — Das Benfeitorias:</strong> Benfeitorias necessárias e úteis autorizadas serão indenizáveis, autorizando retenção. Benfeitorias voluptuárias não serão indenizadas (arts. 35-36, Lei 8.245/91).</div>

          <div><strong>Cláusula 7ª — Da Rescisão:</strong> O descumprimento de qualquer cláusula importará em rescisão imediata. O LOCATÁRIO poderá devolver o imóvel antes do prazo pagando multa proporcional (art. 4º, Lei 8.245/91).</div>

          <div><strong>Cláusula 8ª — Do Foro:</strong> As partes elegem o foro da Comarca de {prop.city}/{prop.state} para dirimir quaisquer dúvidas.</div>
        </>
      )}

      {clausulasEspecificas[contrato.templateType] && (
        <div dangerouslySetInnerHTML={{ __html: clausulasEspecificas[contrato.templateType] }} />
      )}

      {/* Assinaturas */}
      <div className="border-t border-slate-200 dark:border-slate-600 pt-6 mt-6">
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
          {prop.city}, {formatarDataPT(new Date())}
        </p>
        <div className="grid grid-cols-2 gap-8">
          {[
            { nome: locador, role: "LANDLORD", titulo: "LOCADOR" },
            { nome: locatario, role: "TENANT", titulo: "LOCATÁRIO" },
          ].map((parte) => {
            const sig = contrato.signatures.find((s) => s.role === parte.role);
            return (
              <div key={parte.role} className="text-center">
                <div className={`border-t-2 pt-2 ${sig ? "border-emerald-400" : "border-slate-300 dark:border-slate-600"}`}>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{parte.titulo}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{parte.nome}</p>
                  {sig ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      ✓ Assinado em {formatarDataPT(sig.signedAt)}<br />
                      IP: {sig.ipAddress}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⏳ Aguardando assinatura</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BotaoAssinar({ contratoId, documentHash, nomeAssinante }: {
  contratoId: string;
  documentHash: string;
  nomeAssinante: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button onClick={() => setAberto(true)} className="w-full mt-4 gap-2">
        <Shield className="h-4 w-4" />
        Assinar contrato
      </Button>
      {aberto && (
        <AssinarModal
          contratoId={contratoId}
          documentHash={documentHash}
          nomeAssinante={nomeAssinante}
          onClose={() => setAberto(false)}
        />
      )}
    </>
  );
}

export function ContratoPreviewer({ contrato }: ContratoPreviewerProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
      <PreviewHTML contrato={contrato} />
    </div>
  );
}

ContratoPreviewer.BotaoAssinar = BotaoAssinar;
