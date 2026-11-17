/**
 * Monta cada aba do simulador a partir das premissas: tudo o que a tela mostra (valor principal,
 * gráfico, cenários, marcos e "E se…") é calculado aqui, com as mesmas funções do app
 * (`lib/`). Com `set`, os controles mexem no estado e a tela recalcula na hora.
 */
import type { PremiseField, Simulation } from "./data";
import {
  CUT_DEFAULTS,
  GOAL_PLACES,
  PROTOTYPE_CONTEXT,
  RETIREMENT_DEFAULTS,
  RETIREMENT_INCLUDES,
  type SimulatorContext,
} from "./inputs";
import { simulateCut } from "./lib/cut";
import type { ProjectionPoint } from "./lib/finance";
import {
  compact,
  longAmount,
  longMonth,
  millions,
  parseMoney,
  reais,
  reaisWithCents,
  shortMonth,
  signedReais,
  thousands,
  yearlyPercent,
} from "./lib/format";
import { simulateGoal } from "./lib/goal";
import { simulateRetirement } from "./lib/retirement";
import type { ProjectionSeries } from "./projection";

type Setter<T> = (patch: Partial<T>) => void;

const series = (points: ProjectionPoint[]): ProjectionSeries => ({
  projected: points.map((point) => point.value),
  deposited: points.map((point) => point.contributed),
});

const percentOf = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
const percentText = (part: number, total: number) => `${Math.round(percentOf(part, total))}%`;

/** Marca/desmarca uma opção (vários) ou escolhe uma (um só). */
const toggled = (current: readonly string[], option: string, multiple: boolean) =>
  multiple
    ? current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    : [option];

// Aposentadoria ------------------------------------------------------------------------------

export type RetirementState = {
  years: number;
  income: number;
  rate: number;
  withdrawal: number;
  /** "Já investido", como digitado ("R$ 48.310,90"). */
  invested: string;
  includes: string[];
};

/** Premissas iniciais: o investido e a rentabilidade do perfil de quem simula. */
export function retirementStart(ctx: SimulatorContext): RetirementState {
  return {
    ...RETIREMENT_DEFAULTS,
    rate: ctx.retirementRate,
    invested: reaisWithCents(ctx.household.invested),
    includes: [],
  };
}

export const RETIREMENT_START: RetirementState = retirementStart(PROTOTYPE_CONTEXT);

const householdOf = (ctx: SimulatorContext) => ({
  startYear: ctx.start.year,
  income: ctx.household.income,
  surplus: ctx.household.surplus,
});

export function buildRetirement(
  s: RetirementState,
  set?: Setter<RetirementState>,
  ctx: SimulatorContext = PROTOTYPE_CONTEXT,
): Simulation {
  const start =
    parseMoney(s.invested) + (s.includes.includes("Imóveis") ? ctx.household.properties : 0);
  const r = simulateRetirement({ ...s, start }, householdOf(ctx));
  const tickEvery = Math.max(1, Math.ceil(s.years / 5));
  const ticks = Array.from({ length: Math.floor(s.years / tickEvery) + 1 }, (_, i) => ({
    index: i * tickEvery,
    label: String(ctx.start.year + i * tickEvery),
  }));
  const asksConnection = s.includes.some((item) => item !== "Imóveis");
  const interest = Math.max(0, r.interest);
  const total = r.contributed + interest;

  const fields: PremiseField[] = [
    {
      kind: "slider",
      id: "ap-prazo",
      label: "Prazo",
      display: `${s.years} anos`,
      value: s.years,
      min: 5,
      max: 45,
      step: 1,
      hint: `Aposentar em ${r.retireYear}`,
      onChange: set && ((years) => set({ years })),
    },
    {
      kind: "slider",
      id: "ap-renda",
      label: "Renda mensal desejada",
      display: reais(s.income),
      value: s.income,
      min: 2000,
      max: 22000,
      step: 500,
      hint: "Em valores de hoje",
      onChange: set && ((income) => set({ income })),
    },
    {
      kind: "text",
      id: "ap-investido",
      label: "Já investido",
      value: s.invested,
      hint: "Puxado da sua carteira",
      onChange: set && ((invested) => set({ invested })),
    },
    {
      kind: "slider",
      id: "ap-rentabilidade",
      label: "Rentabilidade real",
      display: yearlyPercent(s.rate),
      value: s.rate,
      min: 1,
      max: 7.5,
      step: 0.1,
      hint: `Acima da inflação · perfil ${ctx.household.profile}`,
      onChange: set && ((rate) => set({ rate })),
    },
    {
      kind: "slider",
      id: "ap-retirada",
      label: "Taxa de retirada",
      display: yearlyPercent(s.withdrawal),
      value: s.withdrawal,
      min: 2,
      max: 7,
      step: 0.1,
      hint: "Quanto do patrimônio você usa por ano",
      onChange: set && ((withdrawal) => set({ withdrawal })),
    },
    {
      kind: "chips",
      label: "Incluir na conta",
      options: RETIREMENT_INCLUDES,
      pressed: s.includes,
      multiple: true,
      onToggle: set && ((option) => set({ includes: toggled(s.includes, option, true) })),
    },
    {
      kind: "note",
      text: asksConnection
        ? "Previdência e INSS entram na conta quando você conectar. Imóveis já somam ao investido."
        : "Imóveis e INSS não entram por padrão. Marque para ver o efeito.",
    },
  ];

  return {
    id: "aposentadoria",
    subtitle: "Cenários com os seus números reais",
    premises: {
      fields,
      summary: [
        ["Suas entradas hoje", `${reais(ctx.household.income)}/mês`],
        ["Perfil de investidor", ctx.household.profile],
        ["Valores", "corrigidos pela inflação"],
      ],
    },
    result: {
      title: "O caminho do seu futuro",
      subtitle: `Aposentadoria em ${s.years} anos, em valores de hoje`,
      metricLabel: "Aporte mensal necessário",
      metric: reais(r.deposit),
      detail: (
        <>
          Patrimônio necessário: <strong className="text-sand">{longAmount(r.goal)}</strong> ·
          equivale a {Math.round(r.incomeShare)}% das suas entradas de {ctx.lastMonthName}
        </>
      ),
      chart: {
        series: series(r.points),
        color: "arara",
        goal: { value: r.goal, label: `Meta ${millions(r.goal, 1)}` },
        ticks,
        pointLabels: r.points.map((_, i) => String(ctx.start.year + i)),
        label: `Patrimônio projetado de ${ctx.start.year} a ${r.retireYear}, chegando a ${longAmount(r.final)}. A área cinza mostra quanto vem dos seus aportes.`,
      },
      legend: [
        { label: "Patrimônio projetado", swatch: "line", color: "var(--guara-arara)" },
        { label: "Só o que você aportou", swatch: "dashed", color: "var(--guara-caption)" },
        { label: "Meta", swatch: "dashed", color: "var(--guara-tucano)" },
      ],
      // Só a rentabilidade do perfil escolhido (nas premissas); sem comparar com outros perfis.
      scenarios: [],
      save: {
        nome: `Aposentadoria em ${s.years} anos`,
        resumo: `para ${reais(s.income)} de renda em ${r.retireYear}`,
      },
      primary: { label: "Transformar em meta", href: "/metas/nova" },
      disclaimer: "Simulação educativa em valores de hoje. Não é recomendação de investimento.",
    },
    details: [
      {
        kind: "timeline",
        title: "Marcos do caminho",
        subtitle: "Quando o patrimônio chega em cada etapa",
        labelWidth: "narrow",
        color: "arara",
        items: r.milestones.map((step) => ({
          when: step.year === null ? "—" : String(step.year),
          title: compact(step.value, 0),
          note: step.caption ?? `meta: renda de ${reais(s.income)}/mês`,
        })),
      },
      {
        kind: "composition",
        title: "De onde vem o dinheiro",
        subtitle: `Em ${r.retireYear}, o que é seu e o que são juros`,
        slices: [
          {
            label: "Seus aportes",
            amount: millions(r.contributed),
            percent: percentText(r.contributed, total),
            width: percentOf(r.contributed, total),
            color: "var(--guara-caption)",
          },
          {
            label: "Juros compostos",
            amount: millions(interest),
            percent: percentText(interest, total),
            width: percentOf(interest, total),
            color: "var(--guara-arara)",
          },
        ],
        tip: {
          icon: "target",
          color: "var(--guara-arara)",
          content: (
            <>
              Quase <strong>{percentText(interest, total)}</strong> da meta vem dos juros. Quanto
              antes começar, maior essa parte.
            </>
          ),
        },
      },
      {
        kind: "rows",
        title: "E se…",
        subtitle: "Como o aporte muda com outras escolhas",
        rows: r.alternatives.map((item) => ({
          title: item.title,
          detail: item.detail,
          value: `${reais(item.deposit)}/mês`,
          tone: item.deposit <= r.deposit ? "folha" : "urucum",
        })),
      },
    ],
    closing: {
      kind: "rows",
      title: "Cabe no seu orçamento?",
      subtitle: `Comparado com o que sobrou em ${ctx.lastMonthName}`,
      rows: [
        { title: "Aporte necessário", value: `${reais(r.deposit)}/mês`, tone: "sand" },
        {
          title: "Sobra média do mês",
          detail: "entradas menos saídas",
          value: `${reaisWithCents(r.budget.surplus)}/mês`,
          tone: "folha",
        },
        r.budget.gap > 0
          ? {
              title: "Diferença",
              detail: "o que falta por mês",
              value: `${reais(r.budget.gap)}/mês`,
              tone: "urucum",
            }
          : {
              title: "Diferença",
              detail: "cabe na sobra de hoje",
              value: `${reais(-r.budget.gap)}/mês`,
              tone: "folha",
            },
      ],
      tip: {
        icon: "target",
        color: "var(--guara-arara)",
        content: (
          <>
            Guardando só a sobra de hoje, você chegaria a{" "}
            <strong>{compact(r.budget.surplusFinal)}</strong> em {r.retireYear}, uma renda de{" "}
            <strong>{reais(r.budget.surplusIncome)}/mês</strong>.
          </>
        ),
      },
      action: { label: "Ver onde cortar", icon: "scissors", href: "/simulador/corte" },
    },
    questions: [
      "Como chegar lá sem apertar tanto o mês?",
      "Vale incluir previdência privada?",
      "Qual carteira combina com essa meta?",
    ],
  };
}

// Objetivo -----------------------------------------------------------------------------------

export type GoalState = {
  name: string;
  cost: number;
  months: number;
  /** "Já guardado", como digitado. */
  saved: string;
  place: string;
};

export function goalStart(ctx: SimulatorContext): GoalState {
  return { ...ctx.goalDefaults, saved: reaisWithCents(ctx.goalDefaults.saved) };
}

export const GOAL_START: GoalState = goalStart(PROTOTYPE_CONTEXT);

const reserveGap = (ctx: SimulatorContext) =>
  ctx.reserve ? ctx.reserve.target - ctx.reserve.saved : null;

/** Economia padrão do primeiro corte e aporte padrão da aposentadoria (cards das outras abas). */
const defaultCutSavings = (ctx: SimulatorContext) =>
  simulateCut(
    {
      average: ctx.cutCategories[0]?.average ?? null,
      percent: CUT_DEFAULTS.percent,
      rate: CUT_DEFAULTS.rate,
    },
    reserveGap(ctx),
  )?.savings ?? 0;
const defaultRetirement = (ctx: SimulatorContext) =>
  simulateRetirement(
    { ...RETIREMENT_DEFAULTS, rate: ctx.retirementRate, start: ctx.household.invested },
    householdOf(ctx),
  );

export function buildGoal(
  s: GoalState,
  set?: Setter<GoalState>,
  ctx: SimulatorContext = PROTOTYPE_CONTEXT,
): Simulation {
  const place = GOAL_PLACES.find((item) => item.label === s.place) ?? GOAL_PLACES[0];
  const saved = parseMoney(s.saved);
  const r = simulateGoal(
    { cost: s.cost, months: s.months, saved, rate: place.monthlyRate },
    ctx.household.surplus,
    defaultCutSavings(ctx),
    ctx.reserve?.monthly ?? 0,
  );
  const goalName = s.name.trim() || "Seu objetivo";
  // O design fala de "a viagem"; outros objetivos ficam "o objetivo".
  const isTrip = goalName.toLowerCase().startsWith("viagem");
  const total = r.composition.saved + r.composition.deposits + Math.max(0, r.composition.yield);
  const ticks = [0, Math.round(s.months / 3), Math.round((2 * s.months) / 3), s.months].map(
    (index) => ({ index, label: shortMonth(ctx.start, index) }),
  );

  const fields: PremiseField[] = [
    {
      kind: "text",
      id: "ob-nome",
      label: "Objetivo",
      value: s.name,
      onChange: set && ((name) => set({ name })),
    },
    {
      kind: "slider",
      id: "ob-valor",
      label: "Quanto custa",
      display: reais(s.cost),
      value: s.cost,
      min: 1000,
      max: 100000,
      step: 1000,
      hint: isTrip ? "Passagens, hospedagem e passeios para 2 pessoas" : "Valor total do objetivo",
      onChange: set && ((cost) => set({ cost })),
    },
    {
      kind: "slider",
      id: "ob-prazo",
      label: "Prazo",
      display: `${s.months} meses`,
      value: s.months,
      min: 6,
      max: 40,
      step: 1,
      hint: `${isTrip ? "Viajar" : "Pronto"} em ${longMonth(ctx.start, s.months)}`,
      onChange: set && ((months) => set({ months })),
    },
    {
      kind: "text",
      id: "ob-guardado",
      label: "Já guardado",
      value: s.saved,
      hint: `Separado no ${place.label}`,
      onChange: set && ((value) => set({ saved: value })),
    },
    {
      kind: "chips",
      label: "Onde guardar",
      options: GOAL_PLACES.map((item) => item.label),
      pressed: [place.label],
      onToggle: set && ((option) => set({ place: option })),
    },
    {
      kind: "note",
      text: `Rendimento estimado de ${(place.monthlyRate * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% ao mês, já descontado o imposto.`,
    },
  ];

  return {
    id: "objetivo",
    subtitle: "Planeje um objetivo com prazo e valor",
    premises: {
      fields,
      summary: [
        ["Falta juntar", reais(Math.max(0, s.cost - saved))],
        ["Depósitos", `${s.months} de ${reais(r.deposit)}`],
        ["Primeiro depósito", ctx.firstDepositLabel],
      ],
    },
    result: {
      title: isTrip ? "Seu plano para a viagem" : "Seu plano",
      subtitle: `Meta de ${reais(s.cost)} em ${s.months} meses`,
      metricLabel: "Guardar por mês",
      metric: reais(r.deposit),
      detail: (
        <>
          Equivale a <strong className="text-sand">{Math.round(r.surplusShare)}%</strong> do que
          sobrou em {ctx.lastMonthName} · acompanhado pelo Guará
        </>
      ),
      chart: {
        series: series(r.points),
        color: "folha",
        goal: { value: s.cost, label: `Meta ${reais(s.cost)}` },
        ticks,
        pointLabels: r.points.map((_, i) => shortMonth(ctx.start, i)),
        label: `Dinheiro guardado mês a mês até ${longMonth(ctx.start, s.months)}, chegando a ${reais(r.final)}.`,
      },
      legend: [
        { label: "Guardado com rendimento", swatch: "line", color: "var(--guara-folha)" },
        { label: "Só o que você guardou", swatch: "dashed", color: "var(--guara-caption)" },
        { label: "Meta", swatch: "dashed", color: "var(--guara-tucano)" },
      ],
      save: {
        nome: s.name || "Juntar para um objetivo",
        resumo: `${reais(s.cost)} em ${longMonth(ctx.start, s.months)}`,
        request:
          s.cost > 0 && s.months > 0
            ? {
                kind: "goal",
                input: {
                  targetCents: Math.round(s.cost * 100),
                  months: s.months,
                  initialCents: Math.max(0, Math.round(saved * 100)),
                  monthlyContributionCents: Math.max(0, Math.round(r.deposit * 100)),
                },
              }
            : undefined,
      },
      scenarios: r.scenarios.map((scenario) => ({
        name: scenario.label,
        detail: `${scenario.months} meses`,
        value: reais(scenario.deposit),
        current: scenario.key === "plan",
      })),
      primary: { label: "Transformar em meta", href: "/metas/nova" },
      disclaimer: "Simulação educativa. Rendimentos podem variar.",
    },
    details: [
      {
        kind: "timeline",
        title: "Marcos do caminho",
        subtitle: "Quando você chega em cada etapa",
        labelWidth: "narrow",
        color: "folha",
        items: r.milestones.map((step) => ({
          when: step.month === null ? "—" : shortMonth(ctx.start, step.month),
          title:
            step.percent === 100
              ? `Meta · ${reais(step.value)}`
              : `${step.percent}% · ${reais(step.value)}`,
          note:
            step.percent === 100
              ? isTrip
                ? "hora de reservar as passagens"
                : "meta alcançada"
              : "o Guará avisa quando chegar",
        })),
      },
      {
        kind: "composition",
        title: "De onde vem o dinheiro",
        subtitle: `Em ${longMonth(ctx.start, s.months)}`,
        slices: [
          {
            label: "Já guardado",
            amount: thousands(r.composition.saved),
            percent: percentText(r.composition.saved, total),
            width: percentOf(r.composition.saved, total),
            color: "#3E6A8C",
          },
          {
            label: "Seus depósitos",
            amount: thousands(r.composition.deposits),
            percent: percentText(r.composition.deposits, total),
            width: percentOf(r.composition.deposits, total),
            color: "var(--guara-caption)",
          },
          {
            label: "Rendimento",
            amount: thousands(Math.max(0, r.composition.yield)),
            percent: percentText(Math.max(0, r.composition.yield), total),
            width: percentOf(Math.max(0, r.composition.yield), total),
            color: "var(--guara-folha)",
          },
        ],
        tip: {
          icon: "target",
          color: "var(--guara-folha)",
          content: (
            <>
              O rendimento paga cerca de{" "}
              <strong>{percentText(Math.max(0, r.composition.yield), total)}</strong>{" "}
              {isTrip ? "da viagem" : "do objetivo"}. Guardar na conta corrente não renderia nada.
            </>
          ),
        },
      },
      {
        kind: "rows",
        title: "E se…",
        subtitle: "Quanto tempo leva em outros cenários",
        rows: r.alternatives.map((item) => ({
          title: item.title,
          detail:
            item.months === null
              ? "não chega à meta"
              : `${isTrip ? "viagem" : "pronto"} em ${shortMonth(ctx.start, item.months)}${item.note ? ` · ${item.note}` : ""}`,
          value: item.months === null ? "—" : `${item.months} meses`,
          tone: item.months === null ? "caption" : item.months > s.months ? "urucum" : "folha",
        })),
      },
    ],
    closing: {
      kind: "rows",
      title: "Suas metas",
      subtitle: "Acompanhadas pelo Guará",
      rows: [
        ...ctx.goalRows.map((row) => ({ ...row, tone: "arara" as const })),
        {
          title: goalName,
          detail: `esta simulação · começa em ${ctx.startLabel}`,
          value: "novo",
          tone: "tucano",
        },
        {
          title: "Aposentadoria",
          detail: `em simulação · aporte de ${reais(defaultRetirement(ctx).deposit)}/mês`,
          value: "—",
          tone: "caption",
        },
      ],
      tip: {
        icon: "target",
        color: "var(--guara-tucano)",
        content: ctx.reserve ? (
          <>
            Com a reserva e {isTrip ? "a viagem juntas" : "o objetivo juntos"}, você guardaria{" "}
            <strong>{reais(r.withReserve)}/mês</strong>
            {r.withReserve >= ctx.household.surplus * 0.9
              ? ", perto de tudo o que sobra hoje."
              : "."}
          </>
        ) : (
          <>
            {isTrip ? "A viagem pede" : "O objetivo pede"} <strong>{reais(r.deposit)}/mês</strong>
            {r.deposit >= ctx.household.surplus * 0.9 ? ", perto de tudo o que sobra hoje." : "."}
          </>
        ),
      },
    },
    questions: [
      `Consigo ${isTrip ? "viajar" : "chegar lá"} antes de ${ctx.start.year + Math.floor((ctx.start.month + s.months) / 12)}?`,
      "Onde é melhor guardar esse dinheiro?",
      "Dá para juntar a reserva e a viagem ao mesmo tempo?",
    ],
  };
}

// Cortar um gasto ----------------------------------------------------------------------------

export type CutState = { category: string; percent: number; rate: number; destination: string };

/** O primeiro gasto e o primeiro destino da pessoa já marcados. */
export function cutStart(ctx: SimulatorContext): CutState {
  return {
    ...CUT_DEFAULTS,
    category: ctx.cutCategories[0]?.label ?? CUT_DEFAULTS.category,
    destination: ctx.cutDestinations[0] ?? CUT_DEFAULTS.destination,
  };
}

export const CUT_START: CutState = cutStart(PROTOTYPE_CONTEXT);

export function buildCut(
  s: CutState,
  set?: Setter<CutState>,
  ctx: SimulatorContext = PROTOTYPE_CONTEXT,
): Simulation {
  // Sem gasto com histórico (conta nova), a aba mostra o vazio.
  const category = ctx.cutCategories.find((item) => item.label === s.category) ??
    ctx.cutCategories[0] ?? { label: "—", name: "esse gasto", average: null };
  const r = simulateCut(
    { average: category.average, percent: s.percent, rate: s.rate },
    reserveGap(ctx),
  );
  const trip = simulateGoal(
    { ...ctx.goalDefaults, rate: GOAL_PLACES[0].monthlyRate },
    ctx.household.surplus,
    r?.savings ?? 0,
    ctx.reserve?.monthly ?? 0,
  );
  const tripWithCut = trip.alternatives[1];
  const gap = Math.max(0, defaultRetirement(ctx).budget.gap);
  const savings = r?.savings ?? 0;
  const cap = r?.cap ?? 0;

  const fields: PremiseField[] = [
    {
      kind: "chips",
      label: "Gasto para cortar",
      options: ctx.cutCategories.map((item) => item.label),
      pressed: [category.label],
      onToggle: set && ((option) => set({ category: option })),
    },
    {
      kind: "tip",
      tip: {
        icon: "target",
        color: "#E0935A",
        content:
          category.average === null ? (
            <>Ainda não temos 3 meses de lançamentos de {category.name} para calcular a média.</>
          ) : (
            <>
              Você gastou em média <strong>{reais(category.average)} por mês</strong> com{" "}
              {category.name} nos últimos 3 meses.
            </>
          ),
      },
    },
    {
      kind: "slider",
      id: "co-corte",
      label: "Quanto cortar",
      display: `${s.percent}%`,
      value: s.percent,
      min: 10,
      max: 100,
      step: 5,
      hint: r
        ? `Fica um teto de ${reais(cap)} por mês para emergências`
        : "Sem média para calcular",
      onChange: set && ((percent) => set({ percent })),
    },
    {
      kind: "slider",
      id: "co-rendimento",
      label: "Rendimento da economia",
      display: yearlyPercent(s.rate),
      value: s.rate,
      min: 1,
      max: 7.5,
      step: 0.1,
      hint: `Acima da inflação · perfil ${ctx.household.profile}`,
      onChange: set && ((rate) => set({ rate })),
    },
    {
      kind: "chips",
      label: "Para onde vai a economia",
      options: ctx.cutDestinations,
      pressed: [s.destination],
      onToggle: set && ((option) => set({ destination: option })),
    },
  ];

  return {
    id: "corte",
    subtitle: "Veja quanto um corte rende ao longo do tempo",
    premises: {
      fields,
      summary: [
        ["Teto novo", r ? `${reais(cap)}/mês` : "—"],
        ["Economia", r ? `${reais(savings)}/mês` : "—"],
        ["Começa em", ctx.startLabel],
      ],
    },
    result: {
      empty: r
        ? undefined
        : "Sem histórico desse gasto. Quando tivermos 3 meses de lançamentos, o Guará mostra quanto esse corte vira.",
      title: "O que esse corte vira",
      subtitle: "Economia investida todo mês, em valores de hoje",
      metricLabel: "Economia por mês",
      metric: r ? reais(savings) : "—",
      detail: r ? (
        <>
          <strong className="text-sand">{reais(r.yearly)}</strong> por ano · {thousands(r.tenYears)}{" "}
          em 10 anos
        </>
      ) : (
        "—"
      ),
      chart: {
        series: series(r?.points ?? [{ value: 0, contributed: 0 }]),
        color: "folha",
        ticks: [0, 2, 4, 6, 8, 10].map((index) => ({
          index,
          label: index === 0 ? "hoje" : `${index} anos`,
        })),
        pointLabels: (r?.points ?? [null]).map((_, i) =>
          i === 0 ? "Hoje" : `Em ${i} ${i === 1 ? "ano" : "anos"}`,
        ),
        label: r
          ? `Economia de ${reais(savings)} por mês investida por 10 anos, chegando a cerca de ${thousands(r.tenYears)}.`
          : "Sem histórico para projetar.",
      },
      legend: [
        { label: "Economia investida", swatch: "line", color: "var(--guara-folha)" },
        { label: "Só a economia, sem rendimento", swatch: "dashed", color: "var(--guara-caption)" },
      ],
      save: {
        nome: `Cortar ${s.percent}% de ${s.category.toLowerCase()}`,
        resumo: r ? `${thousands(r.tenYears)} em 10 anos` : "sem histórico desse gasto",
        // A projeção do corte é de 10 anos.
        request:
          Math.round(savings * 100) > 0
            ? {
                kind: "spending_cut",
                input: {
                  monthlyAmountCents: Math.round(savings * 100),
                  months: 120,
                  description: category.label.slice(0, 80),
                },
              }
            : undefined,
      },
      scenarios: (r?.scenarios ?? []).map((scenario) => ({
        name: scenario.label,
        detail: `${scenario.percent}% · ${reais(scenario.cap)} de teto`,
        value: reais(scenario.savings),
        current: scenario.key === "yours",
      })),
      primary: {
        label: r ? `Criar teto de ${reais(cap)}` : "Criar teto",
        href: "/alertas/novo-teto",
      },
      disclaimer: "O teto avisa quando você chegar perto do limite. Simulação educativa.",
    },
    details: [
      {
        kind: "rows",
        title: "Quanto vira com o tempo",
        subtitle: "Investindo a economia todo mês",
        rows: (r?.horizons ?? []).map((item) => ({
          title: `Em ${item.years} ${item.years === 1 ? "ano" : "anos"}`,
          detail: `guardado ${thousands(item.saved)}`,
          value: thousands(item.value),
          tone: "folha",
        })),
      },
      {
        kind: "rows",
        title: "Efeito nas suas metas",
        subtitle: "Se a economia for para cada uma",
        rows: [
          {
            title: "Aposentadoria",
            detail: `o que falta por mês cai de ${reais(gap)} para ${reais(Math.max(0, gap - savings))}`,
            value: signedReais(-savings),
            tone: "folha",
          },
          {
            title: ctx.goalDefaults.name,
            detail: `somando ${reais(savings)} ao plano de ${reais(trip.deposit)}`,
            value: tripWithCut?.months == null ? "—" : `${tripWithCut.months} meses`,
            tone: "folha",
          },
          ...(ctx.reserve
            ? [
                {
                  title: "Reserva de emergência",
                  detail: `faltam ${reais(Math.max(0, ctx.reserve.target - ctx.reserve.saved))} para completar`,
                  value: r?.reserveMonths == null ? "—" : `${r.reserveMonths} meses`,
                  tone: "arara" as const,
                },
              ]
            : []),
        ],
      },
      {
        kind: "rows",
        title: "Outros cortes possíveis",
        subtitle: "O Guará encontrou nos seus gastos",
        rows: ctx.otherCuts
          .filter((item) => item.title !== category.label)
          .map((item) => ({ ...item, tone: "folha" as const })),
        tip:
          ctx.otherCutsTotal === null
            ? undefined
            : {
                icon: "scissors",
                color: "var(--guara-folha)",
                content: (
                  <>
                    Somando tudo, dá para liberar até{" "}
                    <strong>{reais(ctx.otherCutsTotal)} por mês</strong> sem mexer em moradia e
                    mercado.
                  </>
                ),
              },
      },
    ],
    closing: {
      kind: "timeline",
      title: "Como vai funcionar",
      subtitle: "Depois de salvar o corte",
      labelWidth: "wide",
      color: "folha",
      items: [
        {
          when: "Hoje",
          title: `Teto de ${reais(cap)} para ${category.name}`,
          note: r ? `avisos em ${reais(r.alerts[0] ?? 0)} e ${reais(r.alerts[1] ?? 0)}` : "—",
          done: true,
        },
        {
          when: "Todo mês",
          title: `${reais(savings)} separados no dia 5`,
          note: "junto com o salário",
        },
        { when: "Se passar", title: "O Guará confirma com você", note: "nada é bloqueado" },
      ],
    },
    questions: [
      "Quais gastos mais cresceram este ano?",
      "O que acontece se eu passar do teto?",
      "Quanto gasto com delivery por mês?",
    ],
  };
}
