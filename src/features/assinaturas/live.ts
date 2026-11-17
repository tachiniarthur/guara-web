"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import {
  accountLabel,
  AccountsSchema,
  categoryNames,
  CategoriesSchema,
  type Accounts,
  type Categories,
} from "@/features/gastos/live-ledger";
import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiPercent, buildView, MONTHS, percent } from "@/lib/live-format";

import type { Subscription, SubscriptionDetail } from "./types";

/** Assinaturas com os dados da API (`/v1/subscriptions`), no formato que as telas desenham. */

const cents = z.number().int();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const ApiSubscriptionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    detectedName: z.string(),
    categoryId: z.string().nullable(),
    accountId: z.string().nullable(),
    period: z.enum(["monthly", "yearly"]),
    amountCents: cents,
    monthlyAmountCents: cents,
    lastChargeOn: day.nullable(),
    nextChargeOn: day.nullable(),
    priceIncrease: z
      .object({ previousAmountCents: cents, changedOn: day, pct: apiPercent })
      .nullable(),
    status: z.string(),
    source: z.enum(["detected", "manual"]),
  })
  .loose();
type ApiSubscription = z.infer<typeof ApiSubscriptionSchema>;

const SubscriptionsSchema = z.object({
  data: z.array(ApiSubscriptionSchema),
  monthlyTotalCents: cents,
});
type Subscriptions = z.infer<typeof SubscriptionsSchema>;

const ChargesSchema = z.object({
  data: z.array(
    z
      .object({
        id: z.string(),
        accountId: z.string().nullable(),
        occurredOn: day,
        amountCents: cents,
        direction: z.enum(["debit", "credit"]),
        description: z.string(),
        merchantName: z.string().nullable(),
      })
      .loose(),
  ),
});
type Charges = z.infer<typeof ChargesSchema>;

/** Endereços que a tela Assinaturas lê (os mesmos que o pré-carregamento busca). */
export const ASSINATURAS_PATHS = {
  // As ativas, como no Início (uma chamada só para as duas telas).
  subscriptions: "/v1/subscriptions?status=active",
  accounts: "/v1/accounts",
  categories: "/v1/categories",
} as const satisfies Record<string, ApiPath>;

// --- Datas ------------------------------------------------------------------------------------

const parts = (isoDay: string) => isoDay.split("-").map(Number) as [number, number, number];
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const shortMonth = (month: number) => MONTHS[month - 1]!.slice(0, 3);
/** "02/12/2026". */
const fullDay = (isoDay: string) => formatDate(`${isoDay}T12:00:00-03:00`, "dd/MM/yyyy");
/** Ano e mês de hoje em São Paulo, mais `offset` meses. */
export function monthFrom(now: Date, offset = 0) {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

/** Dia do mês em que a assinatura cobra (o da próxima cobrança, ou o da última). */
const chargeDay = (sub: ApiSubscription) => {
  const ref = sub.nextChargeOn ?? sub.lastChargeOn;
  return ref ? parts(ref)[2] : null;
};

/** Se a assinatura cobra naquele mês (mensal: todo mês; anual: no mês da cobrança). */
function chargesIn(sub: ApiSubscription, year: number, month: number) {
  const day = chargeDay(sub);
  if (day === null) return null;
  if (sub.period === "yearly") {
    const ref = sub.nextChargeOn ?? sub.lastChargeOn!;
    if (parts(ref)[1] !== month) return null;
  }
  return Math.min(day, daysIn(year, month));
}

// --- Montagem ---------------------------------------------------------------------------------

function toSubscription(
  sub: ApiSubscription,
  names: Map<string, string>,
  accounts: Accounts,
): Subscription {
  const account = accounts.data.find((a) => a.id === sub.accountId);
  const next = sub.nextChargeOn;
  return {
    id: sub.id,
    nome: sub.name,
    categoria: (sub.categoryId && names.get(sub.categoryId)) || "Sem categoria",
    conta: account ? accountLabel(account) : sub.source === "manual" ? "Cadastrada por você" : "—",
    dia: chargeDay(sub) ?? 0,
    proxima: next
      ? `Próxima cobrança em ${String(parts(next)[2]).padStart(2, "0")} ${shortMonth(parts(next)[1])}`
      : "Sem data prevista",
    valor: formatCurrency(sub.amountCents),
    periodo: sub.period === "yearly" ? "por ano" : "por mês",
    alerta: sub.priceIncrease
      ? {
          tom: "tucano",
          texto: `Subiu de ${formatCurrency(sub.priceIncrease.previousAmountCents)}`,
        }
      : undefined,
  };
}

export type CalendarMonth = {
  /** "novembro de 2026". */
  titulo: string;
  nome: string;
  ano: number;
  dias: number;
  /** Dia da semana do dia 1 (0 = domingo). */
  primeiroDiaSemana: number;
  cobrancas: { dia: number; item: Subscription; valorCents: number }[];
  totalCents: number;
};

/** As cobranças de um mês (mensais todo mês; anuais só no mês delas), em ordem de dia. */
export function calendarMonth(
  subs: readonly ApiSubscription[],
  items: readonly Subscription[],
  year: number,
  month: number,
): CalendarMonth {
  const cobrancas = subs
    .map((sub, i) => ({ dia: chargesIn(sub, year, month), item: items[i]!, sub }))
    .filter((c): c is typeof c & { dia: number } => c.dia !== null)
    .map(({ dia, item, sub }) => ({ dia, item, valorCents: sub.amountCents }))
    .sort((a, b) => a.dia - b.dia);
  const nome = MONTHS[month - 1]!;
  return {
    titulo: `${nome} de ${year}`,
    nome,
    ano: year,
    dias: daysIn(year, month),
    primeiroDiaSemana: new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
    cobrancas,
    totalCents: cobrancas.reduce((sum, c) => sum + c.valorCents, 0),
  };
}

/** Resumo de quando as cobranças caem no mês ("Todas vencem até o dia 15…"). */
export function calendarNote(month: CalendarMonth) {
  const { cobrancas } = month;
  if (cobrancas.length === 0) return `Nenhuma cobrança prevista em ${month.nome}.`;
  const first = cobrancas.filter((c) => c.dia <= 15);
  const second = cobrancas.filter((c) => c.dia > 15);
  const sum = (list: typeof cobrancas) =>
    formatCurrency(list.reduce((total, c) => total + c.valorCents, 0));
  if (second.length === 0) return "Todas vencem até o dia 15. Nenhuma na segunda quinzena.";
  if (first.length === 0) return "Todas vencem na segunda quinzena, depois do dia 15.";
  return `${sum(first)} até o dia 15 (${first.length === 1 ? "1 cobrança" : `${first.length} cobranças`}) e ${sum(second)} depois (${second.length === 1 ? "1 cobrança" : `${second.length} cobranças`}).`;
}

export type SubscriptionTip = { texto: string; acao: { label: string; href: string } };

/** Dica do Guará: o maior aumento de preço; sem aumento, o peso das assinaturas no ano. */
function buildTip(subs: Subscriptions, items: Subscription[]): SubscriptionTip | null {
  if (subs.data.length === 0) return null;
  const raised = subs.data
    .map((sub, i) => ({ sub, item: items[i]! }))
    .filter(({ sub }) => sub.priceIncrease)
    .sort(
      (a, b) =>
        b.sub.amountCents -
        b.sub.priceIncrease!.previousAmountCents -
        (a.sub.amountCents - a.sub.priceIncrease!.previousAmountCents),
    )[0];
  if (raised) {
    const { sub, item } = raised;
    const up = sub.amountCents - sub.priceIncrease!.previousAmountCents;
    const perYear = sub.period === "yearly" ? up : up * 12;
    return {
      texto: `${sub.name} subiu ${percent.format(sub.priceIncrease!.pct)}%, de ${formatCurrency(sub.priceIncrease!.previousAmountCents)} para ${formatCurrency(sub.amountCents)}. No ano, são ${formatCurrency(perYear)} a mais.`,
      acao: { label: "Ver assinatura", href: `/assinaturas/${item.id}` },
    };
  }
  const count = subs.data.length;
  return {
    texto: `${count === 1 ? "Sua assinatura soma" : `Suas ${count} assinaturas somam`} ${formatCurrency(subs.monthlyTotalCents)} por mês, ${formatCurrency(subs.monthlyTotalCents * 12)} por ano. Quer ver quanto sobraria cortando uma?`,
    acao: { label: "Simular corte", href: "/simulador/corte" },
  };
}

export function toAssinaturasView(
  {
    subscriptions,
    accounts,
    categories,
  }: { subscriptions: Subscriptions; accounts: Accounts; categories: Categories },
  now: Date,
) {
  const names = categoryNames(categories);
  // Da próxima cobrança para a mais distante.
  const subs = [...subscriptions.data].sort((a, b) =>
    (a.nextChargeOn ?? "9999").localeCompare(b.nextChargeOn ?? "9999"),
  );
  const items = subs.map((sub) => toSubscription(sub, names, accounts));
  const mensal = subscriptions.monthlyTotalCents;
  const { year, month } = monthFrom(now);
  return {
    subs,
    items,
    stats: {
      ativas: items.length,
      mensal,
      anual: mensal * 12,
      media: items.length > 0 ? Math.round(mensal / items.length) : null,
    },
    calendario: calendarMonth(subs, items, year, month),
    dica: buildTip({ ...subscriptions, data: subs }, items),
  };
}

export type AssinaturasView = ReturnType<typeof toAssinaturasView>;

function useAssinaturasResponses(enabled: boolean) {
  const paths = ASSINATURAS_PATHS;
  const results = useQueries({
    queries: [
      apiQuery(paths.subscriptions, SubscriptionsSchema, { enabled }),
      apiQuery(paths.accounts, AccountsSchema, { enabled }),
      apiQuery(paths.categories, CategoriesSchema, { enabled, staleTime: 30 * 60_000 }),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  if (error || results.some((result) => result.isPending)) return { data: undefined, error };
  const [subscriptions, accounts, categories] = results.map((result) => result.data) as [
    Subscriptions,
    Accounts,
    Categories,
  ];
  return { data: { subscriptions, accounts, categories }, error: null };
}

/** Busca o que a tela Assinaturas mostra. `data` fica `undefined` enquanto carrega. */
export function useAssinaturasView({ enabled }: { enabled: boolean }) {
  const responses = useAssinaturasResponses(enabled);
  if (!responses.data) return { data: undefined, error: responses.error };
  const data = responses.data;
  return buildView("assinaturas", () => toAssinaturasView(data, new Date()));
}

// --- Detalhe ----------------------------------------------------------------------------------

/** Cobranças daquela assinatura: pelo nome detectado, na mesma conta, só saídas. */
function chargesOf(sub: ApiSubscription, charges: Charges) {
  const name = sub.detectedName.toLowerCase();
  return charges.data
    .filter((t) => t.direction === "debit")
    .filter((t) => !sub.accountId || !t.accountId || t.accountId === sub.accountId)
    .filter((t) =>
      [t.merchantName, t.description].some((text) => text?.toLowerCase().includes(name)),
    )
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));
}

/** Termo de busca dos lançamentos: o nome detectado (a API aceita de 2 a 60 letras). */
const searchTerm = (sub: ApiSubscription) => sub.detectedName.trim().slice(0, 60);

export function toSubscriptionDetail(
  sub: ApiSubscription,
  item: Subscription,
  all: { items: Subscription[]; stats: { mensal: number; ativas: number } },
  charges: Charges,
  now: Date,
): SubscriptionDetail & {
  aumentoRotulo: string | null;
  dica: string;
  rotuloHistorico: string;
  notaPrevisto: string | null;
} {
  const list = chargesOf(sub, charges);
  // Últimos 6 meses (até o atual) e o próximo, previsto.
  const months = Array.from({ length: 6 }, (_, i) => monthFrom(now, i - 5));
  const next = monthFrom(now, 1);
  const inMonth = (y: number, m: number) =>
    list
      .filter((t) => {
        const [ty, tm] = parts(t.occurredOn);
        return ty === y && tm === m;
      })
      .reduce((sum, t) => sum + t.amountCents, 0);
  const display = (valueCents: number) => formatCurrency(valueCents).replace(/^R\$\s?/, "");
  const historico = months.map(({ year, month }) => {
    const value = inMonth(year, month);
    return { mes: shortMonth(month), valor: value / 100, display: display(value) };
  });
  const nextCharges = chargesIn(sub, next.year, next.month) !== null;
  if (nextCharges) {
    historico.push({
      mes: `${shortMonth(next.month)}*`,
      valor: sub.amountCents / 100,
      display: display(sub.amountCents),
      previsto: true,
    } as (typeof historico)[number]);
  }
  const total6 = months.reduce((sum, { year, month }) => sum + inMonth(year, month), 0);
  const raise = sub.priceIncrease;
  const yearly = sub.period === "yearly";
  const up = raise ? sub.amountCents - raise.previousAmountCents : 0;
  const nextDay = sub.nextChargeOn;
  const cancelBy = nextDay ? fullDay(nextDay).slice(0, 5) : null;
  return {
    aumento: raise
      ? {
          de: formatCurrency(raise.previousAmountCents),
          para: formatCurrency(sub.amountCents),
          percentual: `+${percent.format(raise.pct)}%`,
          desde: fullDay(raise.changedOn),
          noAno: formatCurrency(yearly ? up : up * 12),
        }
      : undefined,
    aumentoRotulo: raise ? `Subiu ${formatCurrency(up)}` : null,
    porAno: {
      valor: formatCurrency(sub.monthlyAmountCents * 12),
      nota: raise ? "com o novo preço" : "no preço atual",
    },
    proximaData: nextDay ? fullDay(nextDay) : "—",
    historico,
    cobrancas: list.slice(0, 4).map((t) => ({
      data: fullDay(t.occurredOn),
      valor: formatCurrency(t.amountCents),
    })),
    totalSeisMeses: formatCurrency(total6),
    rotuloHistorico:
      `${item.nome}: ` +
      historico.map((h) => `${h.mes.replace("*", "")} ${h.display}`).join(", ") +
      (nextCharges ? " (o último é previsto)" : ""),
    notaPrevisto: nextCharges ? `*${MONTHS[next.month - 1]} previsto` : null,
    cancelar: [
      `Abra o app ou o site do ${item.nome} e entre na sua conta.`,
      "Procure a área de assinatura ou pagamento e escolha cancelar.",
      cancelBy
        ? `Cancele antes de ${cancelBy} para não pagar a próxima cobrança.`
        : "Cancele antes da próxima cobrança.",
    ],
    uso: "O Guará vê só a cobrança no cartão. Não dá para saber pelo banco se você tem usado.",
    dica:
      all.stats.ativas === 1
        ? `Esta é sua única assinatura: ${formatCurrency(all.stats.mensal)} por mês. Quer ver quanto sobraria cortando?`
        : `Suas ${all.stats.ativas} assinaturas somam ${formatCurrency(all.stats.mensal)} por mês. Quer ver quanto sobraria cortando uma delas?`,
  };
}

/** Uma assinatura (da lista das ativas) e o histórico de cobranças dela. */
export function useAssinaturaDetail(id: string, { enabled }: { enabled: boolean }) {
  const responses = useAssinaturasResponses(enabled);
  const view = responses.data ? toAssinaturasView(responses.data, new Date()) : undefined;
  const index = view?.subs.findIndex((s) => s.id === id) ?? -1;
  const sub = index >= 0 ? view!.subs[index] : undefined;
  const from = (() => {
    const { year, month } = monthFrom(new Date(), -6);
    return `${year}-${String(month).padStart(2, "0")}-01`;
  })();
  const charges = useQueries({
    queries: [
      apiQuery(
        `/v1/transactions?q=${encodeURIComponent(sub ? searchTerm(sub) : "")}&from=${from}&direction=debit&limit=100`,
        ChargesSchema,
        { enabled: enabled && Boolean(sub) && (sub?.detectedName.trim().length ?? 0) >= 2 },
      ),
    ],
  })[0];
  if (responses.error) return { data: undefined, error: responses.error, missing: false };
  if (!view) return { data: undefined, error: null, missing: false };
  if (!sub) return { data: undefined, error: null, missing: true };
  const item = view.items[index]!;
  // Sem o histórico (falha ou nome curto demais para buscar), a tela segue sem as cobranças.
  if (charges.isPending && charges.fetchStatus !== "idle") {
    return { data: undefined, error: null, missing: false };
  }
  const built = buildView("assinatura", () => ({
    item,
    detail: toSubscriptionDetail(sub, item, view, charges.data ?? { data: [] }, new Date()),
  }));
  return { ...built, missing: false };
}
