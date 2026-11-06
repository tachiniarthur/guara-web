"use client";

import { useQueries } from "@tanstack/react-query";
import { z } from "zod";

import type { CategoryBudget, Transaction } from "@/features/gastos/data";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  MONTHS,
  capitalize,
  chargeDay,
  formatWhole,
  greeting,
  monthLabels,
  percent,
  relativeDay,
  signed,
  since,
} from "@/lib/live-format";

import type { CashFlowData, PendingItem } from "./data";

/*
 * Início com os dados da API (modo real). Cada bloco vem de uma rota e é convertido para o mesmo
 * formato dos dados de exemplo, então os cards não mudam. Valor ausente vira "—"; nada é inventado.
 */

const cents = z.number().int();
const day = z.string();

const block = <T extends z.ZodType>(data: T) =>
  z.object({ data: data.nullable(), reason: z.enum(["not_connected", "unavailable"]).nullable() });

const DashboardSchema = z.object({
  netWorth: block(
    z.object({ investedCents: cents, investmentsMonthChangeCents: cents.nullable() }).loose(),
  ),
  accounts: block(
    z.object({
      totalCents: cents.nullable(),
      items: z.array(z.object({ type: z.string(), institutionName: z.string() }).loose()),
    }),
  ),
  monthSpending: block(
    z.object({
      spentCents: cents,
      budget: z.object({ projectedCents: cents.nullable() }).loose().nullable(),
    }),
  ),
  upcomingSubscriptions: block(
    z.object({
      activeCount: z.number().int(),
      monthlyTotalCents: cents,
      items: z.array(
        z.object({ id: z.string(), name: z.string(), amountCents: cents, nextChargeOn: day }),
      ),
    }),
  ),
  connectBanks: block(
    z.object({ connected: z.number().int(), lastSyncedAt: z.string().nullable() }).loose(),
  ),
  goals: block(
    z.object({
      count: z.number().int(),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          targetCents: cents,
          currentCents: cents.nullable(),
          pct: z.number().nullable(),
        }),
      ),
    }),
  ),
  priceAlerts: block(
    z.object({
      activeCount: z.number().int(),
      nearTarget: z.array(
        z.object({
          id: z.string(),
          symbol: z.string(),
          direction: z.enum(["buy", "sell"]),
          targetPriceCents: cents,
          currentPriceCents: cents,
          distancePct: z.number(),
        }),
      ),
    }),
  ),
  notifications: block(z.object({ unreadCount: z.number().int() })),
});
type Dashboard = z.infer<typeof DashboardSchema>;

const DailySchema = z.object({
  hasAccounts: z.boolean(),
  daysInMonth: z.number().int(),
  throughDay: z.number().int(),
  days: z.array(z.object({ day: z.number().int(), incomeCents: cents, spentCents: cents })),
});
type Daily = z.infer<typeof DailySchema>;

const MonthlySchema = z.object({
  hasAccounts: z.boolean(),
  months: z.array(
    z.object({
      month: z.string(),
      spentCents: cents.nullable(),
      incomeCents: cents.nullable(),
      balanceCents: cents.nullable(),
    }),
  ),
});
type Monthly = z.infer<typeof MonthlySchema>;

const SpendingSchema = z.object({
  categories: z.array(
    z.object({ categoryId: z.string().nullable(), name: z.string(), spentCents: cents }).loose(),
  ),
});
type Spending = z.infer<typeof SpendingSchema>;

const BudgetSummarySchema = z.object({
  items: z.array(
    z.object({
      budget: z.object({ id: z.string(), categoryId: z.string().nullable(), limitCents: cents }),
      categoryName: z.string().nullable(),
      spentCents: cents.nullable(),
      remainingCents: cents.nullable(),
      usedPct: z.number().nullable(),
      status: z.enum(["ok", "attention", "exceeded"]).nullable(),
    }),
  ),
});
type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

const TransactionsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      occurredOn: day,
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
  data: z.array(
    z.object({
      id: z.string(),
      reasons: z.array(z.string()),
      transaction: z
        .object({
          id: z.string(),
          occurredAt: z.string().nullable(),
          amountCents: cents,
          description: z.string(),
          merchantName: z.string().nullable(),
        })
        .loose(),
    }),
  ),
});
type Anomalies = z.infer<typeof AnomaliesSchema>;

const SubscriptionsSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amountCents: cents,
      nextChargeOn: day.nullable(),
      status: z.string(),
      priceIncrease: z.object({ previousAmountCents: cents }).nullable(),
    }),
  ),
});
type Subscriptions = z.infer<typeof SubscriptionsSchema>;

const AllocationSchema = z.object({
  items: z.array(z.object({ assetClass: z.string(), label: z.string(), currentPct: z.number() })),
});
type Allocation = z.infer<typeof AllocationSchema>;

const GoalsSchema = z.object({
  data: z.array(
    z
      .object({ id: z.string(), progress: z.object({ currentCents: cents.nullable() }).loose() })
      .loose(),
  ),
});
type Goals = z.infer<typeof GoalsSchema>;

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

const MeSchema = z.object({ displayName: z.string().nullable() }).loose();

// --- Formatos -----------------------------------------------------------------------------

// --- Montagem -----------------------------------------------------------------------------

/** Escala do gráfico: o maior valor arredondado para cima em milhares pares. */
function chartScale(maxReais: number) {
  const thousands = Math.max(2, Math.ceil(maxReais / 1000 / 2) * 2);
  const maximo = thousands * 1000;
  return {
    maximo,
    eixo: [
      { valor: 0, rotulo: "0 mil" },
      { valor: maximo / 2, rotulo: `${thousands / 2} mil` },
      { valor: maximo, rotulo: `${thousands} mil` },
    ],
  };
}

function buildCashFlow(daily: Daily, dashboard: Dashboard, monthName: string): CashFlowData | null {
  if (!daily.hasAccounts || daily.days.length === 0) return null;
  let income = 0;
  let spent = 0;
  const entradas: number[] = [];
  const saidas: number[] = [];
  for (const item of daily.days) {
    income += item.incomeCents;
    spent += item.spentCents;
    entradas.push(income / 100);
    saidas.push(Math.max(spent, 0) / 100);
  }
  const projected = dashboard.monthSpending.data?.budget?.projectedCents ?? null;
  const previsaoSaidas = projected === null ? null : Math.max(projected, spent) / 100;
  const { maximo, eixo } = chartScale(Math.max(income / 100, previsaoSaidas ?? 0, spent / 100));
  const left = income - spent;
  return {
    diasNoMes: daily.daysInMonth,
    hoje: daily.throughDay,
    entradas,
    saidas,
    previsaoSaidas,
    sobrou: formatWhole(left),
    eixo,
    maximo,
    descricao:
      `Entradas e saídas acumuladas em ${monthName}. Entrou ${formatWhole(income)} e saiu ` +
      `${formatWhole(spent)} até hoje; ${left >= 0 ? "sobraram" : "faltaram"} ${formatWhole(Math.abs(left))}.` +
      (previsaoSaidas === null
        ? ""
        : ` Previsão de saídas no fim do mês: cerca de ${formatWhole(previsaoSaidas * 100)}.`),
  };
}

function versus(current: number | null, previous: number | null, previousName: string) {
  if (current === null || previous === null || previous === 0) return "—";
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return `${signed(pct, `${percent.format(Math.abs(pct))}%`)} vs ${previousName}`;
}

function buildSummary(dashboard: Dashboard, monthly: Monthly) {
  const accounts = dashboard.accounts.data;
  const banks = new Set(
    (accounts?.items ?? [])
      .filter((item) => item.type !== "credit_card")
      .map((item) => item.institutionName),
  );
  const [previous, current] = monthly.months.slice(-2);
  const previousName = previous ? MONTHS[Number(previous.month.slice(5)) - 1]! : "";
  const leftDiff =
    current?.balanceCents != null && previous?.balanceCents != null
      ? current.balanceCents - previous.balanceCents
      : null;
  return {
    saldo: formatCurrency(accounts?.totalCents ?? null),
    saldoRotulo: banks.size === 1 ? "Saldo em 1 banco" : `Saldo em ${banks.size} bancos`,
    linhas: [
      {
        id: "entradas",
        rotulo: "Entradas",
        valor: formatCurrency(current?.incomeCents ?? null),
        variacao: versus(current?.incomeCents ?? null, previous?.incomeCents ?? null, previousName),
      },
      {
        id: "saidas",
        rotulo: "Saídas",
        valor: formatCurrency(current?.spentCents ?? null),
        variacao: versus(current?.spentCents ?? null, previous?.spentCents ?? null, previousName),
      },
      {
        id: "sobrou",
        rotulo: "Sobrou no mês",
        valor: formatCurrency(current?.balanceCents ?? null),
        variacao:
          leftDiff === null
            ? "—"
            : `${signed(leftDiff, formatWhole(Math.abs(leftDiff)))} vs ${previousName}`,
      },
    ] as const,
  };
}

const REASON_LABELS: Record<string, string> = {
  amount: "valor muito acima do normal",
  night: "de madrugada",
  new_category: "categoria nova",
  duplicate: "possível cobrança duplicada",
};

function buildPending(
  anomalies: Anomalies,
  budgets: BudgetSummary,
  subscriptions: Subscriptions,
): PendingItem[] {
  const items: PendingItem[] = [];
  for (const anomaly of anomalies.data) {
    const tx = anomaly.transaction;
    const time = tx.occurredAt ? ` às ${formatDate(tx.occurredAt, "HH:mm")}` : "";
    items.push({
      id: `anomalia-${anomaly.id}`,
      agent: "quero_quero",
      titulo: `Compra de ${formatCurrency(tx.amountCents)}${time}`,
      detalhe: `${tx.merchantName ?? tx.description} · ${anomaly.reasons.map((r) => REASON_LABELS[r] ?? r).join(", ")}`,
      origem: "Quero-quero · Fora do padrão",
      acao: "Revisar",
      href: "/alertas",
      urgente: true,
    });
  }
  for (const item of budgets.items) {
    if (item.status !== "attention" && item.status !== "exceeded") continue;
    const name = item.categoryName ?? "Gasto do mês";
    items.push({
      id: `teto-${item.budget.id}`,
      agent: "tamandua",
      titulo:
        item.status === "exceeded"
          ? `${name} passou do teto`
          : `${name} chegou a ${percent.format(item.usedPct ?? 0)}% do teto`,
      detalhe:
        item.remainingCents === null
          ? "—"
          : item.remainingCents >= 0
            ? `Faltam ${formatCurrency(item.remainingCents)} até o limite do mês`
            : `${formatCurrency(-item.remainingCents)} acima do limite do mês`,
      origem: "Tamanduá · Gastos",
      acao: "Ver",
      href: "/gastos",
    });
  }
  for (const sub of subscriptions.data) {
    if (sub.status !== "active" || !sub.priceIncrease) continue;
    const diff = sub.amountCents - sub.priceIncrease.previousAmountCents;
    items.push({
      id: `assinatura-${sub.id}`,
      agent: "tamandua",
      titulo: `${sub.name} subiu ${formatCurrency(diff)}`,
      detalhe: sub.nextChargeOn
        ? `Próxima cobrança de ${formatCurrency(sub.amountCents)} em ${chargeDay(sub.nextChargeOn)}`
        : `Cobrança de ${formatCurrency(sub.amountCents)}`,
      origem: "Tamanduá · Gastos",
      acao: "Ver",
      href: "/assinaturas",
    });
  }
  return items;
}

/** Cores das classes (as mesmas do gráfico de alocação). */
const CLASS_COLORS: Record<string, string> = {
  fixed_income: "#6DB3EC",
  equities: "#FF6A50",
  real_estate: "#F2C230",
  alternatives: "#6CC08E",
};

export interface OverviewData {
  investimentos: {
    valor: string;
    legenda: string;
    alocacao: { classe: string; atual: number; cor: string }[];
  };
  cobrancas: {
    valor: string;
    legenda: string;
    itens: { id: string; nome: string; quando: string; valor: string }[];
  };
  metas: {
    valor: string;
    legenda: string;
    principal: { nome: string; percentual: number; guardado: string; alvo: string } | null;
  };
  alertas: {
    valor: string;
    legenda: string;
    maisPerto: {
      ativo: string;
      direcao: "compra" | "venda";
      faltam: string;
      progresso: number;
      condicao: string;
    } | null;
  };
}

function buildOverview(
  dashboard: Dashboard,
  allocation: Allocation,
  allGoals: Goals,
  monthName: string,
): OverviewData {
  const net = dashboard.netWorth.data;
  const change = net?.investmentsMonthChangeCents ?? null;
  const changePct =
    net && change !== null && net.investedCents - change !== 0
      ? (change / (net.investedCents - change)) * 100
      : null;
  const subs = dashboard.upcomingSubscriptions.data;
  const main = dashboard.goals.data?.items[0] ?? null;
  const alerts = dashboard.priceAlerts.data;
  const near = alerts?.nearTarget[0] ?? null;
  // Guardado em todas as metas (a principal vem do painel: a de prazo mais próximo).
  const goalsCount = allGoals.data.length;
  const guardado = allGoals.data.reduce((sum, goal) => sum + (goal.progress.currentCents ?? 0), 0);
  return {
    investimentos: {
      valor: formatCurrency(net?.investedCents ?? null),
      legenda:
        change === null
          ? "—"
          : `${signed(change, formatCurrency(Math.abs(change)))} em ${monthName}` +
            (changePct === null
              ? ""
              : ` (${signed(changePct, `${percent.format(Math.abs(changePct))}%`)})`),
      alocacao: allocation.items
        .filter((item) => item.currentPct > 0)
        .map((item) => ({
          classe: item.label,
          atual: item.currentPct,
          cor: CLASS_COLORS[item.assetClass] ?? "#93A198",
        })),
    },
    cobrancas: {
      valor: formatCurrency(subs?.monthlyTotalCents ?? null),
      legenda: subs ? `por mês em ${subs.activeCount} assinaturas` : "—",
      itens: (subs?.items ?? []).map((item) => ({
        id: item.id,
        nome: item.name,
        quando: chargeDay(item.nextChargeOn),
        valor: formatCurrency(item.amountCents),
      })),
    },
    metas: {
      valor: goalsCount === 0 ? "—" : formatCurrency(guardado),
      legenda: goalsCount === 1 ? "guardados em 1 meta" : `guardados em ${goalsCount} metas`,
      principal: main
        ? {
            nome: main.name,
            percentual: Math.round(main.pct ?? 0),
            guardado: formatWhole(main.currentCents),
            alvo: formatWhole(main.targetCents),
          }
        : null,
    },
    alertas: {
      valor: `${alerts?.activeCount ?? 0} ativos`,
      legenda: "vigiados para você",
      maisPerto: near
        ? {
            ativo: near.symbol,
            direcao: near.direction === "sell" ? "venda" : "compra",
            faltam: `Faltam ${percent.format(near.distancePct)}%`,
            progresso: Math.max(0, Math.min(100, Math.round(100 - near.distancePct))),
            condicao: `${near.direction === "sell" ? "Quando subir a" : "Quando cair a"} ${formatCurrency(near.targetPriceCents)} · agora ${formatCurrency(near.currentPriceCents)}`,
          }
        : null,
    },
  };
}

function buildCategoryBudgets(spending: Spending, budgets: BudgetSummary): CategoryBudget[] {
  const limits = new Map(
    budgets.items
      .filter((item) => item.budget.categoryId !== null)
      .map((item) => [item.budget.categoryId!, item]),
  );
  return spending.categories
    .filter((item) => item.categoryId !== null && limits.has(item.categoryId))
    .slice(0, 4)
    .map((item) => {
      const budget = limits.get(item.categoryId!)!;
      return {
        id: item.categoryId!,
        nome: item.name,
        gasto: formatWhole(item.spentCents),
        teto: formatWhole(budget.budget.limitCents),
        percentual: Math.round(budget.usedPct ?? 0),
      };
    });
}

function buildRecent(
  transactions: Transactions,
  anomalies: Anomalies,
  categories: Categories,
  now: Date,
): Transaction[] {
  const names = new Map<string, string>();
  for (const category of categories.data) {
    names.set(category.id, category.name);
    for (const child of category.subcategories) names.set(child.id, child.name);
  }
  const unusual = new Set(anomalies.data.map((item) => item.transaction.id));
  return transactions.data.map((item) => {
    const out = item.direction === "debit";
    const flagged = unusual.has(item.id);
    return {
      id: item.id,
      descricao: item.merchantName ?? item.description,
      detalhe: flagged
        ? "Fora do padrão"
        : `${(item.categoryId && names.get(item.categoryId)) || "Sem categoria"} · ${relativeDay(item.occurredOn, now)}`,
      valor: `${out ? "−" : "+"}${formatCurrency(item.amountCents)}`,
      tipo: out ? "saida" : "entrada",
      foraDoPadrao: flagged || undefined,
    };
  });
}

export interface HomeView {
  titulo: string;
  data: string;
  pendencias: number;
  mes: ReturnType<typeof monthLabels>;
  atualizado: string | null;
  notificacoes: number;
  semBanco: boolean;
  summary: ReturnType<typeof buildSummary>;
  cashFlow: CashFlowData | null;
  pending: PendingItem[];
  overview: OverviewData;
  categoryBudgets: CategoryBudget[];
  recent: Transaction[];
}

export interface HomeResponses {
  dashboard: Dashboard;
  daily: Daily;
  monthly: Monthly;
  spending: Spending;
  budgets: BudgetSummary;
  transactions: Transactions;
  anomalies: Anomalies;
  subscriptions: Subscriptions;
  allocation: Allocation;
  goals: Goals;
  categories: Categories;
  me: z.infer<typeof MeSchema>;
}

/** Converte as respostas da API no que o Início mostra (função pura, testada). */
export function toHomeView(
  {
    dashboard,
    daily,
    monthly,
    spending,
    budgets,
    transactions,
    anomalies,
    subscriptions,
    allocation,
    goals,
    categories,
    me,
  }: HomeResponses,
  now: Date,
): HomeView {
  const mes = monthLabels(now);
  const pendingItems = buildPending(anomalies, budgets, subscriptions);
  const connected = dashboard.connectBanks.data?.connected ?? 0;
  const updated = since(dashboard.connectBanks.data?.lastSyncedAt ?? null, now);
  const firstName = me.displayName?.trim().split(/\s+/)[0];
  return {
    titulo: firstName ? `${greeting(now)}, ${firstName}.` : `${greeting(now)}.`,
    data: capitalize(formatDate(now, "EEEE, d 'de' MMMM").replace("-feira", "")),
    pendencias: pendingItems.length,
    mes,
    atualizado: updated
      ? `${updated} · ${connected === 1 ? "1 banco" : `${connected} bancos`}`
      : null,
    notificacoes: dashboard.notifications.data?.unreadCount ?? 0,
    semBanco: dashboard.accounts.reason === "not_connected",
    summary: buildSummary(dashboard, monthly),
    cashFlow: buildCashFlow(daily, dashboard, mes.name),
    pending: pendingItems,
    overview: buildOverview(dashboard, allocation, goals, mes.name),
    categoryBudgets: buildCategoryBudgets(spending, budgets),
    recent: buildRecent(transactions, anomalies, categories, now),
  };
}

/** Busca tudo o que o Início mostra. `data` fica `undefined` enquanto carrega. */
export function useHomeView({ enabled }: { enabled: boolean }) {
  const now = new Date();
  const month = formatDate(now, "yyyy-MM");
  const get = <T>(path: `/v1/${string}`, schema: z.ZodType<T>, staleTime = 60_000) => ({
    queryKey: ["inicio", path],
    queryFn: ({ signal }: { signal: AbortSignal }) => apiRequest(path, schema, { signal }),
    enabled,
    staleTime,
  });
  const results = useQueries({
    queries: [
      get("/v1/dashboard", DashboardSchema),
      get(`/v1/insights/spending/daily?month=${month}`, DailySchema),
      get("/v1/insights/spending/monthly?months=2", MonthlySchema),
      get(`/v1/insights/spending?month=${month}`, SpendingSchema),
      get("/v1/budgets/summary", BudgetSummarySchema),
      get("/v1/transactions?limit=5", TransactionsSchema),
      get("/v1/anomalies?status=pending", AnomaliesSchema),
      get("/v1/subscriptions?status=active", SubscriptionsSchema),
      get("/v1/investments/allocation", AllocationSchema),
      get("/v1/goals", GoalsSchema),
      get("/v1/categories", CategoriesSchema, 30 * 60_000),
      get("/v1/me", MeSchema, 30 * 60_000),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  const pending = results.some((result) => result.isPending);
  const refetch = () => results.forEach((result) => void result.refetch());
  if (pending || error) return { data: undefined, error, refetch };

  const [
    dashboard,
    daily,
    monthly,
    spending,
    budgets,
    transactions,
    anomalies,
    subscriptions,
    allocation,
    goals,
    categories,
    me,
  ] = results.map((result) => result.data) as [
    Dashboard,
    Daily,
    Monthly,
    Spending,
    BudgetSummary,
    Transactions,
    Anomalies,
    Subscriptions,
    Allocation,
    Goals,
    Categories,
    z.infer<typeof MeSchema>,
  ];

  const view = toHomeView(
    {
      dashboard,
      daily,
      monthly,
      spending,
      budgets,
      transactions,
      anomalies,
      subscriptions,
      allocation,
      goals,
      categories,
      me,
    },
    now,
  );
  return { data: view, error: null, refetch };
}
