"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import {
  AccountsSchema,
  AnomaliesSchema,
  ApiTransactionSchema,
  CategoriesSchema,
  accountLabel,
  categoryNames,
  type Accounts,
  type Anomalies,
  type ApiTransaction,
  type Categories,
} from "@/features/gastos/live-ledger";
import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTHS, apiPercent, buildView, capitalize, formatWhole } from "@/lib/live-format";

import type {
  BalanceEvent,
  BalanceSeries,
  CategoryChange,
  FlowSeries,
  MonthComparisonGroup,
  ReportStat,
  ReportView,
  TextPart,
  TimelineEntry,
} from "./view";

/*
 * Relatório com os dados da API (modo real), no mesmo formato do protótipo (`ReportView`).
 * Valores dos gráficos em reais; textos montados com os números calculados aqui.
 */

export type ReportPeriodId = "7d" | "mes" | "3m" | "12m";

const cents = z.number().int();

const DashboardSchema = z
  .object({
    accounts: z.object({ data: z.object({ totalCents: cents.nullable() }).loose().nullable() }),
  })
  .loose();
type Dashboard = z.infer<typeof DashboardSchema>;

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
  months: z.array(
    z
      .object({ month: z.string(), spentCents: cents.nullable(), incomeCents: cents.nullable() })
      .loose(),
  ),
});
type Monthly = z.infer<typeof MonthlySchema>;

const SummarySchema = z.object({
  month: z.string(),
  hasAccounts: z.boolean(),
  spentCents: cents.nullable(),
  incomeCents: cents.nullable(),
  categories: z.array(
    z
      .object({
        categoryId: z.string().nullable(),
        name: z.string(),
        spentCents: cents,
        averageCents: cents.nullable(),
        changePct: apiPercent.nullable(),
      })
      .loose(),
  ),
});
type Summary = z.infer<typeof SummarySchema>;

const TransactionsSchema = z.object({
  data: z.array(ApiTransactionSchema),
  nextCursor: z.string().nullable(),
});
type Transactions = z.infer<typeof TransactionsSchema>;

export interface ReportResponses {
  dashboard: Dashboard;
  current: Daily;
  previous: Daily;
  monthly: Monthly;
  summaries: Summary[];
  transactions: Transactions;
  accounts: Accounts;
  categories: Categories;
  anomalies: Anomalies;
}

// --- Datas -------------------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (now: Date) =>
  formatDate(now, "yyyy-MM-dd").split("-").map(Number) as [number, number, number];

/** "2026-11" do mês de `back` meses atrás. */
export function monthOf(now: Date, back: number) {
  const [year, month] = ymd(now);
  const date = new Date(Date.UTC(year, month - 1 - back, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** "2026-11-11" de `back` dias atrás (calendário de São Paulo). */
function dayOf(now: Date, back: number) {
  const [year, month, day] = ymd(now);
  const date = new Date(Date.UTC(year, month - 1, day - back));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const monthName = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1]!;
const short = (iso: string) => monthName(iso).slice(0, 3);
const dayLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${short(iso)}`;

/** Quantos meses cada período cobre (com o atual) e o primeiro dia dele. */
const MONTHS_IN: Record<ReportPeriodId, number> = { "7d": 1, mes: 1, "3m": 3, "12m": 12 };

export function periodStart(now: Date, period: ReportPeriodId) {
  if (period === "7d") return dayOf(now, 6);
  return `${monthOf(now, MONTHS_IN[period] - 1)}-01`;
}

/** Endereços que o Relatório lê no período (os de "Este mês" vão no pré-carregamento). */
export function reportPaths(now: Date, period: ReportPeriodId) {
  return {
    dashboard: "/v1/dashboard",
    current: `/v1/insights/spending/daily?month=${monthOf(now, 0)}`,
    previous: `/v1/insights/spending/daily?month=${monthOf(now, 1)}`,
    monthly: "/v1/insights/spending/monthly?months=12",
    summaries: Array.from(
      { length: period === "7d" ? 1 : MONTHS_IN[period] },
      (_, back): ApiPath => `/v1/insights/spending?month=${monthOf(now, back)}`,
    ),
    transactions: `/v1/transactions?from=${periodStart(now, period)}&limit=100`,
    accounts: "/v1/accounts",
    categories: "/v1/categories",
    anomalies: "/v1/anomalies?status=pending",
  } satisfies Record<string, ApiPath | ApiPath[]>;
}

// --- Montagem ----------------------------------------------------------------------------------

/** Transferência entre contas próprias e pagamento de fatura não são entrada nem saída. */
const IGNORED_KINDS = new Set(["transfer_own", "card_bill_payment"]);
const counts = (t: ApiTransaction) => !IGNORED_KINDS.has(t.kind);

type Unit = {
  /** Dia ("2026-11-17") ou mês ("2026-11"). */
  key: string;
  income: number;
  spent: number;
};

const reais = (centsValue: number) => centsValue / 100;
const money = (centsValue: number) => formatCurrency(Math.round(centsValue));
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const BREAKDOWN_COLORS = [
  "var(--guara-arara)",
  "var(--guara-urucum)",
  "var(--guara-tucano)",
  "var(--guara-folha)",
];

/** Os 4 maiores gastos e "Outros", com a parte de cada um no total. */
function breakdownOf(byName: Map<string, number>) {
  const sorted = [...byName.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, v]) => sum + v, 0);
  const top = sorted.slice(0, sorted.length > 5 ? 4 : 5);
  const rest = sorted.slice(top.length).reduce((sum, [, v]) => sum + v, 0);
  const rows = top.map(([label, value], i) => ({
    label,
    value: reais(value),
    percent: `${pct(value, total)}%`,
    color: BREAKDOWN_COLORS[i] ?? "var(--guara-mist)",
  }));
  if (rest > 0) {
    rows.push({
      label: "Outros",
      value: reais(rest),
      percent: `${pct(rest, total)}%`,
      color: "var(--guara-caption)",
    });
  }
  return rows;
}

function dailyUnits(daily: Daily): Unit[] {
  return daily.days.map((d) => ({
    key: `${daily.month}-${pad(d.day)}`,
    income: d.incomeCents,
    spent: d.spentCents,
  }));
}

/** Maior lançamento de um dia, para dar nome ao ponto do gráfico. */
function biggestOn(transactions: ApiTransaction[], key: string, direction: "credit" | "debit") {
  return transactions
    .filter((t) => counts(t) && t.direction === direction && t.occurredOn === key)
    .sort((a, b) => b.amountCents - a.amountCents)[0];
}

const titleOf = (t: ApiTransaction) => t.merchantName ?? t.description;
const clip = (text: string, max = 22) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** As 2 maiores entradas e a maior saída, com nome, em linhas alternadas. */
function eventsOf(
  units: Unit[],
  name: (unit: Unit, direction: "credit" | "debit") => string,
): BalanceEvent[] {
  const ranked = (field: "income" | "spent") =>
    units
      .map((unit, index) => ({ unit, index }))
      .filter(({ unit }) => unit[field] > 0)
      .sort((a, b) => b.unit[field] - a.unit[field]);
  const incomes = ranked("income").slice(0, 2);
  const spent = ranked("spent").find(({ index }) => !incomes.some((i) => i.index === index));
  const events = [
    ...incomes.map(({ unit, index }) => ({
      index,
      label: clip(name(unit, "credit")),
      tone: "arara" as const,
    })),
    ...(spent
      ? [{ index: spent.index, label: clip(name(spent.unit, "debit")), tone: "urucum" as const }]
      : []),
  ].sort((a, b) => a.index - b.index);
  return events.map((event, i) => ({ ...event, labelRow: (i % 2) as 0 | 1 }));
}

const sumOf = (units: Unit[], field: "income" | "spent") =>
  units.reduce((sum, unit) => sum + unit[field], 0);

function rangeLabel(now: Date, period: ReportPeriodId) {
  const start = periodStart(now, period);
  const today = dayOf(now, 0);
  const [, , day] = ymd(now);
  if (period === "mes") return `1 a ${day} de ${monthName(today)}`;
  if (period === "7d") {
    return start.slice(0, 7) === today.slice(0, 7)
      ? `${Number(start.slice(8))} a ${day} de ${monthName(today)}`
      : `${Number(start.slice(8))} de ${monthName(start)} a ${day} de ${monthName(today)}`;
  }
  const sameYear = start.slice(0, 4) === today.slice(0, 4);
  return `${monthName(start)}${sameYear ? "" : ` de ${start.slice(0, 4)}`} a ${monthName(today)} de ${today.slice(0, 4)}`;
}

/** Variação em texto ("+12%", "−8%", "igual") com o tom (subir gasto é ruim). */
function change(current: number, previous: number, spending: boolean) {
  if (previous <= 0) {
    return current > 0
      ? { text: "novo", tone: "tucano" as const, icon: "info-lg" as const }
      : { text: "igual", tone: "caption" as const, icon: "check" as const };
  }
  const value = Math.round(((current - previous) / previous) * 100);
  if (Math.abs(value) < 3)
    return { text: "igual", tone: "caption" as const, icon: "check" as const };
  const up = value > 0;
  return {
    text: `${up ? "+" : "−"}${Math.abs(value)}%`,
    tone: up === spending ? ("urucum" as const) : ("folha" as const),
    icon: up ? ("arrow-up" as const) : ("arrow-down" as const),
  };
}

/** Monta o Relatório do período (função pura, testada). */
export function toReportView(
  responses: ReportResponses,
  period: ReportPeriodId,
  now: Date,
): ReportView {
  const { dashboard, current, previous, monthly, summaries, transactions, accounts } = responses;
  const today = dayOf(now, 0);
  const start = periodStart(now, period);
  const daily = period === "7d" || period === "mes";
  const names = categoryNames(responses.categories);
  const accountsById = new Map(accounts.data.map((account) => [account.id, account]));
  const unusual = new Set(responses.anomalies.data.map((item) => item.transaction.id));
  const inPeriod = transactions.data.filter(
    (t) => counts(t) && t.occurredOn >= start && t.occurredOn <= today,
  );

  // Pontos do período: dias (7 dias, este mês) ou meses (3 e 12 meses).
  const units: Unit[] = daily
    ? [...dailyUnits(previous), ...dailyUnits(current)].filter(
        (unit) => unit.key >= start && unit.key <= today,
      )
    : monthly.months.slice(-MONTHS_IN[period]).map((row) => ({
        key: row.month,
        income: row.incomeCents ?? 0,
        spent: row.spentCents ?? 0,
      }));
  const income = sumOf(units, "income");
  const spent = sumOf(units, "spent");
  const left = income - spent;
  const empty =
    !current.hasAccounts || units.every((unit) => unit.income === 0 && unit.spent === 0);

  // Para onde foi o que saiu: as categorias do mês (ou dos meses); em 7 dias, os lançamentos.
  const byName = new Map<string, number>();
  if (period === "7d") {
    for (const t of inPeriod) {
      if (t.direction !== "debit" || t.kind === "income") continue;
      const label = (t.categoryId && names.get(t.categoryId)) ?? "Sem categoria";
      byName.set(label, (byName.get(label) ?? 0) + t.amountCents);
    }
  } else {
    for (const summary of summaries) {
      for (const category of summary.categories) {
        byName.set(category.name, (byName.get(category.name) ?? 0) + category.spentCents);
      }
    }
  }

  // Saldo: o de hoje nas contas, voltando pelo que entrou e saiu depois de cada ponto. Sem saldo
  // das contas, a linha é a sobra acumulada no período (começa em zero).
  const balanceToday = dashboard.accounts.data?.totalCents ?? null;
  const base = balanceToday ?? left;
  const ends: number[] = [];
  let after = 0;
  for (let i = units.length - 1; i >= 0; i--) {
    ends[i] = base - after;
    after += units[i]!.income - units[i]!.spent;
  }
  const startBalance = base - left;

  // Previsão (só em "Este mês"): o gasto médio por dia até o fim do mês, sem novas entradas.
  const remaining = period === "mes" ? current.daysInMonth - current.throughDay : 0;
  const perDay = current.throughDay > 0 ? sumOf(units, "spent") / current.throughDay : 0;
  const projection =
    remaining > 0 ? Array.from({ length: remaining + 1 }, (_, k) => base - perDay * k) : [];
  const closing = projection.at(-1);

  const unitTitle = (unit: Unit) =>
    daily
      ? unit.key === today
        ? "Hoje"
        : `${dayLabel(unit.key)}`
      : `${capitalize(monthName(unit.key))} ${unit.key.slice(0, 4)}${unit.key === today.slice(0, 7) ? " (até hoje)" : ""}`;
  const eventName = (unit: Unit, direction: "credit" | "debit") => {
    if (!daily) return direction === "credit" ? "Mais entrou" : "Mais saiu";
    const biggest = biggestOn(inPeriod, unit.key, direction);
    return biggest ? titleOf(biggest) : direction === "credit" ? "Entradas" : "Saídas";
  };
  const axis = (() => {
    if (period === "mes") {
      const last = units.length - 1;
      const marks = [1, 5, 10, 15, 20, 25, current.daysInMonth]
        .map((day) => day - 1)
        .filter((index) => Math.abs(index - last) >= 2);
      return [
        ...marks.map((index) => ({ index, label: String(index + 1) })),
        { index: last, label: "hoje", strong: true },
      ];
    }
    if (period === "7d") {
      return units.map((unit, index) => ({
        index,
        label: unit.key === today ? "hoje" : String(Number(unit.key.slice(8))),
        strong: unit.key === today,
      }));
    }
    const step = units.length > 6 ? 2 : 1;
    return units
      .map((unit, index) => ({ index, label: short(unit.key) }))
      .filter((_, index) => (units.length - 1 - index) % step === 0);
  })();

  const series: BalanceSeries = {
    values: ends.map(reais),
    projection: projection.map(reais),
    titles: units.map((unit) =>
      period === "mes" && unit.key === today
        ? `Hoje, dia ${Number(unit.key.slice(8))}`
        : unitTitle(unit),
    ),
    projectionTitles: projection
      .slice(1)
      .map((_, k) => `Dia ${current.throughDay + k + 1} (previsão)`),
    events: eventsOf(units, eventName),
    axis,
    label: `${balanceToday === null ? "Sobra acumulada" : "Saldo"} de ${rangeLabel(now, period)}: começou em ${formatWhole(startBalance)} e está em ${formatWhole(base)}${closing === undefined ? "" : `; previsão de ${formatWhole(closing)} no dia ${current.daysInMonth}`}.`,
  };

  const startLabel = period === "mes" ? "Começou o mês" : "Começou o período";
  const balanceStats: ReportStat[] = [
    { label: startLabel, value: money(startBalance), tone: "sand" },
    { label: "Hoje", value: money(base), tone: "sand" },
    closing === undefined
      ? {
          label: daily ? "Sobra por dia" : "Sobra por mês",
          value: formatWhole(units.length > 0 ? left / units.length : 0),
          tone: "arara",
        }
      : {
          label: `Previsão dia ${current.daysInMonth}`,
          value: `≈ ${formatWhole(closing)}`,
          tone: "arara",
        },
  ];
  const diff = (closing ?? base) - startBalance;
  const balanceFooter: TextPart[] = [
    { texto: closing === undefined ? "O saldo está " : "O saldo deve fechar " },
    { texto: `${formatWhole(Math.abs(diff))} ${diff >= 0 ? "acima" : "abaixo"}`, forte: true },
    { texto: period === "mes" ? " do começo do mês." : " do começo do período." },
  ];

  // Entradas e saídas: por dia (7 dias), semana (este mês) ou mês.
  const groups: FlowSeries["groups"] = (() => {
    if (period === "7d") {
      return units.map((unit) => ({
        label: unit.key === today ? "Hoje" : dayLabel(unit.key),
        short: String(Number(unit.key.slice(8))),
        entrou: reais(unit.income),
        saiu: reais(unit.spent),
      }));
    }
    if (period === "mes") {
      const weeks: FlowSeries["groups"] = [];
      const mon = short(today);
      for (let first = 1; first <= current.throughDay; first += 7) {
        const last = Math.min(first + 6, current.throughDay);
        const partial = last < first + 6 && last < current.daysInMonth;
        const slice = units.slice(first - 1, last);
        const mark = partial ? "*" : "";
        weeks.push({
          label: first === last ? `${first} ${mon}${mark}` : `${first} a ${last} ${mon}${mark}`,
          short: first === last ? `${first}${mark}` : `${first}–${last}${mark}`,
          entrou: reais(sumOf(slice, "income")),
          saiu: reais(sumOf(slice, "spent")),
        });
      }
      return weeks;
    }
    return units.map((unit) => {
      const mark = unit.key === today.slice(0, 7) ? "*" : "";
      return {
        label: `${short(unit.key)} ${unit.key.slice(2, 4)}${mark}`,
        short: `${short(unit.key)}${mark}`,
        entrou: reais(unit.income),
        saiu: reais(unit.spent),
      };
    });
  })();
  const groupWord = period === "7d" ? "dia" : period === "mes" ? "semana" : "mês";
  const priciest = [...groups].sort((a, b) => b.saiu - a.saiu)[0];
  const flowFooter: TextPart[] =
    priciest && priciest.saiu > 0
      ? [
          {
            texto: `${groupWord === "semana" ? "A semana mais cara" : groupWord === "dia" ? "O dia mais caro" : "O mês mais caro"} foi `,
          },
          { texto: priciest.label.replace("*", ""), forte: true },
          { texto: `, com ${formatWhole(priciest.saiu * 100)} de saídas.` },
        ]
      : [{ texto: "Nenhuma saída no período." }];
  const flowOf =
    period === "mes"
      ? `de ${monthName(today)}`
      : period === "7d"
        ? "dos últimos 7 dias"
        : `de ${rangeLabel(now, period)}`;

  // Linha do tempo: os 5 maiores movimentos do período, do mais recente.
  const entries: TimelineEntry[] = [...inPeriod]
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5)
    .sort((a, b) => (b.occurredAt ?? b.occurredOn).localeCompare(a.occurredAt ?? a.occurredOn))
    .map((t) => {
      const outlier = unusual.has(t.id);
      const credit = t.direction === "credit";
      const time = t.occurredAt ? ` · ${formatDate(t.occurredAt, "HH:mm")}` : "";
      return {
        date: dayLabel(t.occurredOn),
        title: titleOf(t),
        detail: `${accountLabel(accountsById.get(t.accountId))}${time}`,
        amount: `${credit ? "+" : "−"}${money(t.amountCents)}`,
        tone: outlier ? "urucum" : credit ? "arara" : "neutral",
        outlier,
      };
    });
  const more = transactions.nextCursor
    ? "Ver todos os lançamentos"
    : `Ver ${inPeriod.length === 1 ? "1 lançamento" : `${inPeriod.length} lançamentos`}`;

  // Comparação: este mês até hoje contra o mês passado até o mesmo dia; as categorias contra a
  // média dos 3 meses anteriores (o que a API calcula).
  const until = current.throughDay;
  const sumUntil = (d: Daily, field: "incomeCents" | "spentCents") =>
    d.days.filter((row) => row.day <= until).reduce((sum, row) => sum + row[field], 0);
  const previousName = capitalize(monthName(previous.month));
  const currentName = capitalize(monthName(current.month));
  const groupsCompared: MonthComparisonGroup[] = (
    [
      { label: "Entradas", field: "incomeCents", spending: false, color: "var(--guara-arara)" },
      { label: "Saídas", field: "spentCents", spending: true, color: "var(--guara-urucum)" },
    ] as const
  ).map(({ label, field, spending, color }) => {
    const now_ = sumUntil(current, field);
    const before = sumUntil(previous, field);
    const top = Math.max(now_, before, 1);
    const delta = change(now_, before, spending);
    return {
      label,
      change: delta.text,
      tone: delta.tone,
      color,
      current: { month: currentName, value: formatWhole(now_), width: (now_ / top) * 100 },
      previous: { month: previousName, value: formatWhole(before), width: (before / top) * 100 },
    };
  });
  const summary = summaries[0];
  const compared = (summary?.categories ?? [])
    .filter((category) => category.spentCents > 0 || (category.averageCents ?? 0) > 0)
    .map((category) => ({
      category,
      gap: category.spentCents - (category.averageCents ?? 0),
    }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 4);
  const categories: CategoryChange[] = compared.map(({ category }) => {
    const average = category.averageCents ?? 0;
    const delta = change(category.spentCents, average, true);
    return {
      label: category.name,
      detail:
        average > 0
          ? `${formatWhole(category.spentCents)} contra média de ${formatWhole(average)}`
          : "Sem gasto nos 3 meses anteriores",
      change: delta.text,
      icon: delta.icon,
      tone: delta.tone,
    };
  });
  const rising = compared.filter(
    ({ gap, category }) => gap > 0 && (category.averageCents ?? 0) > 0,
  )[0];
  const comparisonFooter: TextPart[] = rising
    ? [
        { texto: `${rising.category.name} é o gasto que mais subiu: ` },
        { texto: `${formatWhole(rising.gap)} acima`, forte: true },
        { texto: " da média dos 3 meses anteriores." },
      ]
    : [{ texto: "Nenhuma categoria acima da média dos 3 meses anteriores." }];

  return {
    period: {
      title: "O que aconteceu com seu dinheiro",
      range: rangeLabel(now, period),
      scope: "todos os bancos",
    },
    empty,
    totals: [
      { label: "Entrou", value: money(income), tone: "arara" },
      { label: "Saiu", value: money(spent), tone: "sand" },
      {
        label: left < 0 ? "Faltou" : "Sobrou",
        value: money(Math.abs(left)),
        tone: left < 0 ? "urucum" : "folha",
        ...(income > 0 && left >= 0 ? { note: `${pct(left, income)}% do que entrou` } : {}),
      },
    ],
    breakdown: breakdownOf(byName),
    balance: {
      title:
        balanceToday === null ? "Sobra acumulada" : daily ? "Saldo dia a dia" : "Saldo mês a mês",
      subtitle:
        balanceToday === null
          ? "O que entrou menos o que saiu, somado no período"
          : "Sobe com o que entra e desce com o que sai",
      stats: balanceStats,
      series,
      projectionLegend:
        projection.length > 1
          ? `Projeção até o dia ${current.daysInMonth}, sem novas entradas`
          : null,
      footer: balanceFooter,
    },
    flow: {
      title: `Entradas e saídas por ${groupWord}`,
      subtitle: {
        short: `Em R$ mil, por ${groupWord} ${flowOf}`,
        long: `Quanto entrou e saiu em cada ${groupWord} ${flowOf}`,
      },
      stats: [
        { label: "Entrou", value: money(income), tone: "arara" },
        { label: "Saiu", value: money(spent), tone: "urucum" },
        {
          label: `${groupWord === "semana" ? "Semana mais cara" : groupWord === "dia" ? "Dia mais caro" : "Mês mais caro"}`,
          value: priciest && priciest.saiu > 0 ? priciest.label.replace("*", "") : "—",
          tone: "sand",
        },
      ],
      series: {
        groups,
        label: `Entradas e saídas por ${groupWord}: ${groups
          .map(
            (g) =>
              `${g.label.replace("*", "")}, entrou ${formatWhole(g.entrou * 100)} e saiu ${formatWhole(g.saiu * 100)}`,
          )
          .join("; ")}.`,
      },
      partialNote: groups.some((g) => g.label.endsWith("*")) ? `*${groupWord} em andamento` : null,
      footer: flowFooter,
    },
    timeline: {
      entries,
      more,
      dayEnds: daily ? Object.fromEntries(units.map((unit, i) => [unit.key, money(ends[i]!)])) : {},
    },
    comparison: {
      title: `Comparado com ${monthName(previous.month)}`,
      categories,
      until: `Até o dia ${until}, em cada mês`,
      groups: groupsCompared,
      footer: comparisonFooter,
    },
  };
}

/** Busca e monta o Relatório do período. `data` fica `undefined` enquanto carrega. */
export function useReportView(period: ReportPeriodId, { enabled }: { enabled: boolean }) {
  const now = new Date();
  const paths = reportPaths(now, period);
  const singles = [
    apiQuery(paths.dashboard, DashboardSchema, { enabled }),
    apiQuery(paths.current, DailySchema, { enabled }),
    apiQuery(paths.previous, DailySchema, { enabled }),
    apiQuery(paths.monthly, MonthlySchema, { enabled }),
    apiQuery(paths.transactions, TransactionsSchema, { enabled }),
    apiQuery(paths.accounts, AccountsSchema, { enabled }),
    apiQuery(paths.categories, CategoriesSchema, { enabled }),
    apiQuery(paths.anomalies, AnomaliesSchema, { enabled }),
  ] as const;
  const results = useQueries({
    queries: [
      ...singles,
      // Meses fechados não mudam: ficam frescos por mais tempo.
      ...paths.summaries.map((path, back) =>
        apiQuery(path, SummarySchema, {
          enabled,
          staleTime: back === 0 ? undefined : 6 * 3_600_000,
        }),
      ),
    ],
  });
  const error = results.find((result) => result.error)?.error ?? null;
  const pending = results.some((result) => result.isPending);
  if (error || pending) return { data: undefined, error, pending: enabled && pending };
  const [dashboard, current, previous, monthly, transactions, accounts, categories, anomalies] =
    results.slice(0, singles.length).map((result) => result.data) as unknown as [
      Dashboard,
      Daily,
      Daily,
      Monthly,
      Transactions,
      Accounts,
      Categories,
      Anomalies,
    ];
  const summaries = results.slice(singles.length).map((result) => result.data as Summary);
  return {
    ...buildView("relatorio", () =>
      toReportView(
        {
          dashboard,
          current,
          previous,
          monthly,
          summaries,
          transactions,
          accounts,
          categories,
          anomalies,
        },
        period,
        now,
      ),
    ),
    pending: false,
  };
}

// --- Linha do tempo completa -------------------------------------------------------------------

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export type TimelineKind = "Tudo" | "Entradas" | "Saídas" | "Fora do padrão";

/** Os lançamentos do período em dias (do mais recente), no formato da linha do tempo. */
export function toTimelineDays(
  transactions: ApiTransaction[],
  {
    accounts,
    categories,
    anomalies,
    dayEnds,
    kind,
  }: {
    accounts: Accounts;
    categories: Categories;
    anomalies: Anomalies;
    dayEnds: Record<string, string>;
    kind: TimelineKind;
  },
) {
  const names = categoryNames(categories);
  const accountsById = new Map(accounts.data.map((account) => [account.id, account]));
  const unusual = new Set(anomalies.data.map((item) => item.transaction.id));
  const byDay = new Map<string, ApiTransaction[]>();
  for (const t of transactions) {
    if (!counts(t)) continue;
    if (kind === "Entradas" && t.direction !== "credit") continue;
    if (kind === "Saídas" && t.direction !== "debit") continue;
    if (kind === "Fora do padrão" && !unusual.has(t.id)) continue;
    byDay.set(t.occurredOn, [...(byDay.get(t.occurredOn) ?? []), t]);
  }
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, items]) => ({
      dia: `${dayLabel(day)} · ${WEEKDAYS[new Date(`${day}T12:00:00Z`).getUTCDay()]}`,
      saldo: dayEnds[day],
      itens: items.map((t) => {
        const credit = t.direction === "credit";
        const category = credit
          ? "Entrada"
          : ((t.categoryId && names.get(t.categoryId)) ?? "Sem categoria");
        const time = t.occurredAt ? ` · ${formatDate(t.occurredAt, "HH:mm")}` : "";
        return {
          id: t.id,
          titulo: titleOf(t),
          meta: `${accountLabel(accountsById.get(t.accountId))}${time} · ${category}`,
          valor: `${credit ? "+" : "−"}${money(t.amountCents)}`,
          foraDoPadrao: unusual.has(t.id),
          href: `/gastos/lancamentos/${t.id}`,
        };
      }),
    }));
}

export { TransactionsSchema as ReportTransactionsSchema };
