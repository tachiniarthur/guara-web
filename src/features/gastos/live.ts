"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, capitalize, formatWhole, monthLabels, relativeDay } from "@/lib/live-format";

import { scaleTop, type GastosData } from "./context";
import {
  forecastFrom,
  type CategorySpending,
  type LedgerEntry,
  type MonthlySpending,
  type SpendingPace,
  type TetoProgress,
  type WeekdaySpending,
} from "./data";

/*
 * Gastos com os dados da API (modo real), no mesmo formato dos dados de exemplo. Valores em
 * reais inteiros nos gráficos (como no design); textos montados com os números calculados aqui.
 */

const cents = z.number().int();

const DailySchema = z.object({
  hasAccounts: z.boolean(),
  month: z.string(),
  daysInMonth: z.number().int(),
  throughDay: z.number().int(),
  days: z.array(z.object({ day: z.number().int(), incomeCents: cents, spentCents: cents })),
});
type Daily = z.infer<typeof DailySchema>;

const MonthlySchema = z.object({
  hasAccounts: z.boolean(),
  months: z.array(z.object({ month: z.string(), spentCents: cents.nullable() }).loose()),
});
type Monthly = z.infer<typeof MonthlySchema>;

const SummarySchema = z.object({
  hasAccounts: z.boolean(),
  spentCents: cents.nullable(),
  categories: z.array(
    z.object({
      categoryId: z.string().nullable(),
      name: z.string(),
      spentCents: cents,
      count: z.number().int(),
      sharePct: z.number().nullable(),
    }),
  ),
});
type Summary = z.infer<typeof SummarySchema>;

const BudgetSummarySchema = z.object({
  items: z.array(
    z.object({
      budget: z.object({ id: z.string(), categoryId: z.string().nullable(), limitCents: cents }),
      categoryName: z.string().nullable(),
      spentCents: cents.nullable(),
      usedPct: z.number().nullable(),
      status: z.enum(["ok", "attention", "exceeded"]).nullable(),
      noticesSent: z.array(z.number().int()),
    }),
  ),
});
type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

const TransactionsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      accountId: z.string(),
      occurredOn: z.string(),
      occurredAt: z.string().nullable(),
      amountCents: cents,
      direction: z.enum(["debit", "credit"]),
      description: z.string(),
      merchantName: z.string().nullable(),
      categoryId: z.string().nullable(),
    }),
  ),
});
type Transactions = z.infer<typeof TransactionsSchema>;

const AnomaliesSchema = z.object({
  data: z.array(z.object({ transaction: z.object({ id: z.string() }).loose() }).loose()),
});
type Anomalies = z.infer<typeof AnomaliesSchema>;

const AccountsSchema = z.object({
  data: z.array(
    z.object({ id: z.string(), type: z.string(), institutionName: z.string() }).loose(),
  ),
});
type Accounts = z.infer<typeof AccountsSchema>;

const CategoriesSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        subcategories: z.array(z.object({ id: z.string(), name: z.string() })),
      })
      .loose(),
  ),
});
type Categories = z.infer<typeof CategoriesSchema>;

/** Cores das categorias na ordem do maior gasto (as mesmas do design); o resto é "outros". */
const CATEGORY_COLORS = ["#6DB3EC", "#FF6A50", "#F2C230", "#6CC08E", "#93A198"];
const OTHER_COLOR = "#34443B";
const WEEKDAYS = [
  { rotulo: "dom", nome: "Dom", longo: "domingo" },
  { rotulo: "seg", nome: "Seg", longo: "segunda" },
  { rotulo: "ter", nome: "Ter", longo: "terça" },
  { rotulo: "qua", nome: "Qua", longo: "quarta" },
  { rotulo: "qui", nome: "Qui", longo: "quinta" },
  { rotulo: "sex", nome: "Sex", longo: "sexta" },
  { rotulo: "sáb", nome: "Sáb", longo: "sábado" },
];

const reais = (centsValue: number) => Math.round(centsValue / 100);
const monthName = (month: string) => MONTHS[Number(month.slice(5)) - 1]!;
const shortMonth = (month: string) => monthName(month).slice(0, 3);

/** Gasto acumulado dia a dia, em reais (estornos podem baixar o acumulado, nunca abaixo de 0). */
function cumulative(daily: Daily) {
  let total = 0;
  return daily.days.map((item) => {
    total += item.spentCents;
    return reais(Math.max(total, 0));
  });
}

/** Trecho de texto do rodapé dos gráficos; `forte` vai em negrito. */
export type FooterPart = { texto: string; forte?: boolean };

export interface GastosView extends GastosData {
  mes: ReturnType<typeof monthLabels>;
  gastosNoMes: number;
  bancos: string[];
  rodapes: { ritmo: FooterPart[]; meses: FooterPart[]; semana: FooterPart[] };
  semDados: boolean;
}

export interface GastosResponses {
  current: Daily;
  previous: Daily;
  older: Daily[];
  monthly: Monthly;
  summary: Summary;
  budgets: BudgetSummary;
  transactions: Transactions;
  anomalies: Anomalies;
  accounts: Accounts;
  categories: Categories;
}

function buildPace(current: Daily, previous: Daily): SpendingPace {
  const atual = cumulative(current);
  const anterior = cumulative(previous);
  const nomeAtual = capitalize(monthName(current.month));
  const nomeAnterior = capitalize(monthName(previous.month));
  const hoje = current.throughDay;
  const ateHoje = atual[hoje - 1] ?? 0;
  const mesmoDia = anterior[Math.min(hoje, anterior.length) - 1] ?? 0;
  return {
    hoje,
    atual,
    anterior,
    nomeAtual,
    nomeAnterior,
    maximo: scaleTop([...atual, ...anterior], 3000, 3000),
    descricao:
      `Gasto acumulado dia a dia. ${nomeAtual}: ${formatWhole(ateHoje * 100)} até o dia ${hoje}. ` +
      `${nomeAnterior}, no mesmo dia: ${formatWhole(mesmoDia * 100)}; fechou em ${formatWhole((anterior.at(-1) ?? 0) * 100)}.`,
  };
}

function buildMonthly(monthly: Monthly, current: Daily): MonthlySpending {
  const rows = monthly.months.filter((row) => row.spentCents !== null);
  const meses = rows.map((row) => ({
    rotulo: shortMonth(row.month),
    nome: capitalize(shortMonth(row.month)),
    valor: reais(row.spentCents!),
  }));
  const closed = meses.slice(0, -1);
  const media = closed.length
    ? Math.round(closed.reduce((sum, m) => sum + m.valor, 0) / closed.length)
    : null;
  // Previsão do mês atual: o ritmo por dia até hoje, levado até o fim do mês.
  const spent = meses.at(-1)?.valor ?? 0;
  const previsao =
    current.throughDay > 0 && current.throughDay < current.daysInMonth
      ? Math.round((spent / current.throughDay) * current.daysInMonth)
      : spent;
  const first = closed[0]?.rotulo;
  const last = closed.at(-1)?.rotulo;
  const nomeAtual = monthName(current.month);
  return {
    meses,
    previsao: meses.length ? previsao : null,
    media,
    rotuloMedia: first && last ? `Média de ${first} a ${last}` : "Média",
    rotuloPrevisao: `Previsão de ${nomeAtual}`,
    maximo: scaleTop([...meses.map((m) => m.valor), previsao, media ?? 0], 3000, 3000),
    descricao:
      `Gasto por mês: ${meses.map((m) => `${m.nome} ${formatWhole(m.valor * 100)}`).join(", ")}` +
      `; previsão de ${nomeAtual} ${formatWhole(previsao * 100)}.` +
      (media === null ? "" : ` Média dos meses fechados ${formatWhole(media * 100)}.`),
  };
}

/** Gasto médio por dia da semana nos meses fechados mostrados (dias sem gasto contam como zero). */
function buildWeekday(months: Daily[]): WeekdaySpending {
  const sums = Array(7).fill(0) as number[];
  const counts = Array(7).fill(0) as number[];
  for (const daily of months) {
    for (const item of daily.days) {
      const weekday = new Date(
        `${daily.month}-${String(item.day).padStart(2, "0")}T12:00:00Z`,
      ).getUTCDay();
      sums[weekday]! += Math.max(item.spentCents, 0);
      counts[weekday]! += 1;
    }
  }
  const dias = WEEKDAYS.map((day, i) => ({
    rotulo: day.rotulo,
    nome: day.nome,
    valor: counts[i] ? reais(sums[i]! / counts[i]!) : 0,
  }));
  return {
    dias,
    maximo: scaleTop(
      dias.map((d) => d.valor),
      100,
      200,
    ),
    descricao: `Gasto médio por dia da semana: ${dias
      .map((d, i) => `${WEEKDAYS[i]!.longo} ${formatWhole(d.valor * 100)}`)
      .join(", ")}.`,
  };
}

function buildCategories(summary: Summary) {
  const sorted = [...summary.categories].sort((a, b) => b.spentCents - a.spentCents);
  const shown = sorted.filter((item) => item.categoryId !== null).slice(0, 5);
  const rest = sorted.filter((item) => !shown.includes(item));
  const restCents = rest.reduce((sum, item) => sum + item.spentCents, 0);
  const categorySpending: CategorySpending[] = shown.map((item, i) => ({
    id: item.categoryId!,
    nome: item.name,
    lancamentos: item.count,
    percentual: Math.round(item.sharePct ?? 0),
    valor: item.spentCents / 100,
    valorFormatado: formatCurrency(item.spentCents),
    cor: CATEGORY_COLORS[i]!,
  }));
  return {
    categorySpending,
    otherSpending: {
      valor: restCents / 100,
      valorFormatado: formatCurrency(restCents),
      cor: OTHER_COLOR,
    },
    totalSaidas: formatWhole(summary.spentCents),
  };
}

const TETO_STATE: Record<"ok" | "attention" | "exceeded", TetoProgress["estado"]> = {
  ok: "tranquilo",
  attention: "atenção",
  exceeded: "apertado",
};

/** Tetos por categoria com os avisos de 80% e 100% (✓ quando já enviados no mês). */
function buildTetos(budgets: BudgetSummary): TetoProgress[] {
  return budgets.items
    .filter((item) => item.budget.categoryId !== null)
    .map((item) => {
      const limit = item.budget.limitCents;
      return {
        id: item.budget.id,
        categoria: item.categoryName ?? "—",
        gasto: formatWhole(item.spentCents),
        teto: formatWhole(limit),
        percentual: item.usedPct ?? 0,
        estado: item.status ? TETO_STATE[item.status] : "tranquilo",
        marcos: [
          {
            percentual: 80,
            rotulo: formatWhole(limit * 0.8)
              .replace("R$ ", "")
              .replace("R$ ", ""),
            atingido: item.noticesSent.includes(80),
          },
          {
            percentual: 100,
            rotulo: `teto ${formatWhole(limit).replace("R$ ", "").replace("R$ ", "")}`,
            atingido: item.noticesSent.includes(100),
          },
        ],
      };
    });
}

function accountLabel(account: Accounts["data"][number] | undefined) {
  if (!account) return "—";
  return account.type === "credit_card"
    ? `${account.institutionName} crédito`
    : account.type === "savings"
      ? `${account.institutionName} poupança`
      : account.institutionName;
}

function buildLedger(
  transactions: Transactions,
  anomalies: Anomalies,
  accounts: Accounts,
  categories: Categories,
  now: Date,
): LedgerEntry[] {
  const names = new Map<string, string>();
  for (const category of categories.data) {
    names.set(category.id, category.name);
    for (const child of category.subcategories) names.set(child.id, child.name);
  }
  const byId = new Map(accounts.data.map((account) => [account.id, account]));
  const unusual = new Set(anomalies.data.map((item) => item.transaction.id));
  return transactions.data.map((item) => {
    const out = item.direction === "debit";
    const when =
      relativeDay(item.occurredOn, now) +
      (item.occurredAt ? `, ${formatDate(item.occurredAt, "HH:mm")}` : "");
    const account = accountLabel(byId.get(item.accountId));
    const category = (item.categoryId && names.get(item.categoryId)) || "Sem categoria";
    return {
      id: item.id,
      descricao: item.merchantName ?? item.description,
      detalhe: `${when} · ${account} · ${category}`,
      detalheCurto: `${when} · ${account}`,
      valor: `${out ? "−" : "+"}${formatCurrency(item.amountCents)}`,
      tipo: out ? "saida" : "entrada",
      foraDoPadrao: unusual.has(item.id) || undefined,
    };
  });
}

function paceFooter(pace: SpendingPace): FooterPart[] {
  const ateHoje = pace.atual[pace.hoje - 1] ?? 0;
  const mesmoDia = pace.anterior[Math.min(pace.hoje, pace.anterior.length) - 1] ?? 0;
  const diff = ateHoje - mesmoDia;
  if (diff === 0) return [{ texto: `Igual a ${pace.nomeAnterior.toLowerCase()} no mesmo dia.` }];
  return [
    { texto: `${formatWhole(Math.abs(diff) * 100)} ${diff > 0 ? "acima" : "abaixo"}`, forte: true },
    { texto: ` de ${pace.nomeAnterior.toLowerCase()} no mesmo dia.` },
  ];
}

function monthsFooter(monthly: MonthlySpending, month: string): FooterPart[] {
  if (monthly.previsao === null) return [{ texto: "—" }];
  const parts: FooterPart[] = [
    { texto: `${capitalize(monthName(month))} deve fechar perto de ` },
    { texto: formatWhole(monthly.previsao * 100), forte: true },
  ];
  if (monthly.media) {
    const pct = Math.round((monthly.previsao / monthly.media - 1) * 100);
    parts.push({
      texto:
        pct === 0
          ? ", na média dos últimos meses."
          : `, ${Math.abs(pct)}% ${pct > 0 ? "acima" : "abaixo"} da média dos últimos meses.`,
    });
  } else {
    parts.push({ texto: "." });
  }
  return parts;
}

function weekdayFooter(weekday: WeekdaySpending): FooterPart[] {
  const total = weekday.dias.reduce((sum, d) => sum + d.valor, 0);
  if (total === 0) return [{ texto: "—" }];
  const top = weekday.dias
    .map((d, i) => ({ ...d, i }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 2);
  const share = Math.round(((top[0]!.valor + top[1]!.valor) / total) * 100);
  return [
    {
      texto: `${capitalize(WEEKDAYS[top[0]!.i]!.longo)} e ${WEEKDAYS[top[1]!.i]!.longo} concentram `,
    },
    { texto: `${share}%`, forte: true },
    { texto: " do gasto médio da semana." },
  ];
}

/** Converte as respostas da API no que a tela Gastos mostra (função pura, testada). */
export function toGastosView(responses: GastosResponses, now: Date): GastosView {
  const {
    current,
    previous,
    older,
    monthly,
    summary,
    budgets,
    transactions,
    anomalies,
    accounts,
    categories,
  } = responses;
  const spendingPace = buildPace(current, previous);
  const monthlySpending = buildMonthly(monthly, current);
  const weekdaySpending = buildWeekday([previous, ...older]);
  const { categorySpending, otherSpending, totalSaidas } = buildCategories(summary);
  return {
    spendingPace,
    monthlySpending,
    weekdaySpending,
    categorySpending,
    otherSpending,
    totalSaidas,
    ledger: buildLedger(transactions, anomalies, accounts, categories, now),
    tetos: buildTetos(budgets),
    monthForecast: forecastFrom(spendingPace, monthlySpending, current.daysInMonth),
    mes: monthLabels(now),
    gastosNoMes: summary.categories.reduce((sum, item) => sum + item.count, 0),
    bancos: [...new Set(accounts.data.map((account) => account.institutionName))],
    rodapes: {
      ritmo: paceFooter(spendingPace),
      meses: monthsFooter(monthlySpending, current.month),
      semana: weekdayFooter(weekdaySpending),
    },
    semDados: !summary.hasAccounts,
  };
}

const monthOf = (now: Date, back: number) => {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const date = new Date(Date.UTC(year, month - 1 - back, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** Busca tudo o que a tela Gastos mostra. `data` fica `undefined` enquanto carrega. */
export function useGastosView({ enabled }: { enabled: boolean }) {
  const now = new Date();
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>, staleTime = 60_000) => ({
    queryKey: ["gastos", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime,
  });
  const daily = (back: number) =>
    get(`/v1/insights/spending/daily?month=${monthOf(now, back)}`, DailySchema);
  const results = useQueries({
    queries: [
      daily(0),
      daily(1),
      daily(2),
      daily(3),
      get("/v1/insights/spending/monthly?months=6", MonthlySchema),
      get(`/v1/insights/spending?month=${monthOf(now, 0)}`, SummarySchema),
      get("/v1/budgets/summary", BudgetSummarySchema),
      get("/v1/transactions?limit=8", TransactionsSchema),
      get("/v1/anomalies?status=pending", AnomaliesSchema),
      get("/v1/accounts", AccountsSchema),
      get("/v1/categories", CategoriesSchema, 30 * 60_000),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) {
    return { data: undefined, error };
  }
  const [
    current,
    previous,
    older2,
    older3,
    monthly,
    summary,
    budgets,
    transactions,
    anomalies,
    accounts,
    categories,
  ] = results.map((result) => result.data) as [
    Daily,
    Daily,
    Daily,
    Daily,
    Monthly,
    Summary,
    BudgetSummary,
    Transactions,
    Anomalies,
    Accounts,
    Categories,
  ];
  return {
    data: toGastosView(
      {
        current,
        previous,
        older: [older2, older3],
        monthly,
        summary,
        budgets,
        transactions,
        anomalies,
        accounts,
        categories,
      },
      now,
    ),
    error: null,
  };
}
