import { formatCurrency, formatDate } from "@/lib/format";
import { percent } from "@/lib/live-format";

import { CLASS_NAME, formatQuantity, type MarketAsset, type PositionDetail } from "./live";
import { INSTRUMENT, RISK } from "@/features/investimentos/live";
import { exchangeLabel } from "@/features/mercado/live";
import type { AssetClassId } from "@/features/alocacao/live";

/*
 * "Mais detalhes" do ativo: as fichas da posição (cadastro, custos, renda fixa) e do mercado
 * (cotação e negociação), só com o que a API manda. Campo sem dado não aparece (nada de
 * "—" inventando um campo que a fonte ainda não entrega).
 */

export type FactRow = { label: string; value: string };
export type FactSection = { titulo: string; linhas: FactRow[] };

const day = (value: string | null | undefined) =>
  value ? formatDate(`${value.slice(0, 10)}T12:00:00-03:00`) : null;
const num = (value: string) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 4 });

const INDEX_LABEL: Record<string, string> = {
  cdi: "CDI",
  selic: "Selic",
  ipca: "IPCA",
  igpm: "IGP-M",
};

/** "110% do CDI", "IPCA + 6,2% a.a.", "12,5% a.a."; `null` sem taxa. */
export function rateText(p: Pick<PositionDetail, "ratePct" | "rateIndex" | "fixedAnnualRatePct">) {
  const index = p.rateIndex ? INDEX_LABEL[p.rateIndex] : undefined;
  const fixed = p.fixedAnnualRatePct ? `${num(p.fixedAnnualRatePct)}% a.a.` : null;
  if (p.rateIndex === "prefixed") return fixed ?? (p.ratePct ? `${num(p.ratePct)}% a.a.` : null);
  if (index && fixed && (index === "IPCA" || index === "IGP-M")) return `${index} + ${fixed}`;
  if (index && p.ratePct) return `${num(p.ratePct)}% do ${index}${fixed ? ` + ${fixed}` : ""}`;
  return fixed;
}

const rows = (items: [string, string | null | undefined][]): FactRow[] =>
  items.flatMap(([label, value]) => (value ? [{ label, value }] : []));

/** As seções na ordem do cadastro: Identificação, Negociação, Custos e Risco. */
export function toAssetFacts(p: PositionDetail, market: MarketAsset | null): FactSection[] {
  const abroad = Boolean(p.micCode);
  const q = market?.quote;
  const oneYear = market?.performance.find((x) => x.period === "1y");
  const sections: FactSection[] = [
    {
      titulo: "Identificação",
      linhas: rows([
        ["Nome", p.name],
        ["Ticker", p.symbol],
        ["Nome completo", market?.asset.longName],
        ["Tipo", INSTRUMENT[p.instrumentType] ?? p.instrumentType],
        ["Classe", CLASS_NAME[p.assetClass as AssetClassId] ?? p.assetClass],
        ["Setor", market?.asset.sector],
        ["Emissor", p.issuer],
        ["Origem", p.source === "manual" ? "Cadastro manual" : "Open Finance"],
      ]),
    },
    {
      titulo: "Negociação",
      linhas: rows([
        ["Bolsa", p.symbol ? (abroad ? exchangeLabel(p.micCode) : "B3") : null],
        ["Moeda", p.currency && p.currency !== "BRL" ? p.currency : null],
        ["Cotação", q?.priceCents ? formatCurrency(q.priceCents) : null],
        [
          "Mínima e máxima do dia",
          q?.dayLowCents && q.dayHighCents
            ? `${formatCurrency(q.dayLowCents)} a ${formatCurrency(q.dayHighCents)}`
            : null,
        ],
        [
          "Faixa de 52 semanas",
          q?.week52LowCents && q.week52HighCents
            ? `${formatCurrency(q.week52LowCents)} a ${formatCurrency(q.week52HighCents)}`
            : null,
        ],
        ["Cotação de", q?.quotedAt ? formatDate(q.quotedAt, "dd/MM/yyyy 'às' HH:mm") : null],
        ["Taxa", rateText(p)],
        ["Emissão", day(p.issuedOn)],
        ["Vencimento", day(p.maturesOn)],
      ]),
    },
    {
      titulo: "Custos",
      linhas: rows([
        ["Quantidade", p.symbol ? formatQuantity(p.quantity) : null],
        ["Preço médio", p.symbol ? formatCurrency(p.averagePriceCents) : null],
        ["Custo total", formatCurrency(p.costCents)],
        ["Valor hoje", p.valueCents === null ? null : formatCurrency(p.valueCents)],
        ["Data da aplicação", day(p.purchasedOn)],
        ["Cadastrada em", day(p.createdAt)],
      ]),
    },
    {
      titulo: "Risco",
      linhas: rows([
        ["Risco na carteira", RISK[p.risk]],
        [
          "Volatilidade em 12 meses",
          oneYear?.volatilityPct == null ? null : `${percent.format(oneYear.volatilityPct)}%`,
        ],
        [
          "Sharpe em 12 meses",
          oneYear?.sharpe == null
            ? null
            : oneYear.sharpe.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        ],
      ]),
    },
  ];
  return sections.filter((section) => section.linhas.length > 0);
}
