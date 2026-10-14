import type { ReactNode } from "react";

import type { IconName } from "@/components/ui/icon";
import type { AgentId } from "@/features/assistentes/data";

import { monthlyRate, project, type ProjectionSeries } from "./projection";

export type SimulatorId = "aposentadoria" | "objetivo" | "corte";

export const simulators: { id: SimulatorId; href: string; label: string; shortLabel: string }[] = [
  { id: "aposentadoria", href: "/simulador", label: "Aposentadoria", shortLabel: "Aposentadoria" },
  {
    id: "objetivo",
    href: "/simulador/objetivo",
    label: "Juntar para um objetivo",
    shortLabel: "Objetivo",
  },
  { id: "corte", href: "/simulador/corte", label: "Cortar um gasto", shortLabel: "Cortar gasto" },
];

export type Tone = "sand" | "folha" | "urucum" | "arara" | "tucano" | "caption";

/** Bloco de destaque com ícone (fundo rebaixado). */
export type Tip = { icon: IconName; color: string; content: ReactNode };

export type PremiseField =
  | { kind: "slider"; id: string; label: string; value: string; position: number; hint: string }
  | { kind: "text"; id: string; label: string; value: string; hint?: string }
  | { kind: "chips"; label: string; options: string[]; pressed: string[]; multiple?: boolean }
  | { kind: "note"; text: string }
  | { kind: "tip"; tip: Tip };

export type InfoRow = { title: string; detail?: string; value: string; tone: Tone };

export type DetailSection =
  | {
      kind: "timeline";
      title: string;
      subtitle: string;
      /** Largura da coluna de datas. */
      labelWidth: "narrow" | "wide";
      color: "arara" | "folha";
      items: { when: string; title: string; note: string; done?: boolean }[];
    }
  | {
      kind: "composition";
      title: string;
      subtitle: string;
      slices: { label: string; amount: string; percent: string; width: number; color: string }[];
      tip: Tip;
    }
  | {
      kind: "rows";
      title: string;
      subtitle: string;
      rows: InfoRow[];
      tip?: Tip;
      action?: { label: string; icon: IconName; href: string };
    };

export type Simulation = {
  id: SimulatorId;
  subtitle: string;
  premises: { fields: PremiseField[]; summary: [string, string][] };
  result: {
    title: string;
    subtitle: string;
    metricLabel: string;
    metric: string;
    detail: ReactNode;
    chart: {
      series: ProjectionSeries;
      color: "arara" | "folha";
      goal?: { value: number; label: string };
      ticks: { index: number; label: string }[];
      label: string;
    };
    legend: { label: string; swatch: "line" | "dashed"; color: string }[];
    scenarios: { name: string; detail: string; value: string; current?: boolean }[];
    primary: { label: string; href?: string };
    disclaimer: string;
  };
  /** Três cards do meio (desktop: em linha; tablet: dois lado a lado e um inteiro). */
  details: [DetailSection, DetailSection, DetailSection];
  /** Card ao lado da conversa, no fim da página. */
  closing: DetailSection;
  agent: { id: AgentId; name: string; questions: string[] };
};

const yearTicks = (start: number, every: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({ index: i * every, label: String(start + i * every) }));

export const simulations: Record<SimulatorId, Simulation> = {
  aposentadoria: {
    id: "aposentadoria",
    subtitle: "Cenários com os seus números reais",
    premises: {
      fields: [
        {
          kind: "slider",
          id: "ap-prazo",
          label: "Prazo",
          value: "25 anos",
          position: 50,
          hint: "Aposentar em 2051",
        },
        {
          kind: "slider",
          id: "ap-renda",
          label: "Renda mensal desejada",
          value: "R$ 10.000",
          position: 40,
          hint: "Em valores de hoje",
        },
        {
          kind: "text",
          id: "ap-investido",
          label: "Já investido",
          value: "R$ 48.310,90",
          hint: "Puxado da sua carteira",
        },
        {
          kind: "slider",
          id: "ap-rentabilidade",
          label: "Rentabilidade real",
          value: "4,0% a.a.",
          position: 45,
          hint: "Acima da inflação · perfil Moderado",
        },
        {
          kind: "slider",
          id: "ap-retirada",
          label: "Taxa de retirada",
          value: "4,0% a.a.",
          position: 40,
          hint: "Quanto do patrimônio você usa por ano",
        },
        {
          kind: "chips",
          label: "Incluir na conta",
          options: ["Previdência privada", "INSS estimado", "Imóveis"],
          pressed: [],
          multiple: true,
        },
        { kind: "note", text: "Imóveis e INSS não entram por padrão. Marque para ver o efeito." },
      ],
      summary: [
        ["Suas entradas hoje", "R$ 8.200/mês"],
        ["Perfil de investidor", "Moderado"],
        ["Valores", "corrigidos pela inflação"],
      ],
    },
    result: {
      title: "O caminho do seu futuro",
      subtitle: "Aposentadoria em 25 anos, em valores de hoje",
      metricLabel: "Aporte mensal necessário",
      metric: "R$ 5.640",
      detail: (
        <>
          Patrimônio necessário: <strong className="text-sand">R$ 3,0 milhões</strong> · equivale a
          69% das suas entradas de setembro
        </>
      ),
      chart: {
        series: project({
          initial: 48310.9,
          deposit: 5640,
          rate: monthlyRate(0.04),
          points: 26,
          step: 12,
        }),
        color: "arara",
        goal: { value: 3_000_000, label: "Meta R$ 3,0 mi" },
        ticks: yearTicks(2026, 5, 6),
        label:
          "Patrimônio projetado de 2026 a 2051, chegando a R$ 3 milhões. A área cinza mostra quanto vem dos seus aportes.",
      },
      legend: [
        { label: "Patrimônio projetado", swatch: "line", color: "var(--guara-arara)" },
        { label: "Só o que você aportou", swatch: "dashed", color: "var(--guara-caption)" },
        { label: "Meta", swatch: "dashed", color: "var(--guara-tucano)" },
      ],
      scenarios: [
        { name: "Conservador", detail: "3% a.a.", value: "R$ 6.540" },
        { name: "Moderado", detail: "4% a.a. · seu perfil", value: "R$ 5.640", current: true },
        { name: "Arrojado", detail: "5% a.a.", value: "R$ 4.840" },
      ],
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
        items: [
          { when: "2032", title: "R$ 500 mil", note: "primeiro meio milhão" },
          { when: "2037", title: "R$ 1 mi", note: "primeiro milhão" },
          { when: "2045", title: "R$ 2 mi", note: "metade do caminho em valor" },
          { when: "2051", title: "R$ 3 mi", note: "meta: renda de R$ 10.000/mês" },
        ],
      },
      {
        kind: "composition",
        title: "De onde vem o dinheiro",
        subtitle: "Em 2051, o que é seu e o que são juros",
        slices: [
          {
            label: "Seus aportes",
            amount: "R$ 1,74 mi",
            percent: "58%",
            width: 58,
            color: "var(--guara-caption)",
          },
          {
            label: "Juros compostos",
            amount: "R$ 1,26 mi",
            percent: "42%",
            width: 42,
            color: "var(--guara-arara)",
          },
        ],
        tip: {
          icon: "target",
          color: "var(--guara-arara)",
          content: (
            <>
              Quase <strong>42%</strong> da meta vem dos juros. Quanto antes começar, maior essa
              parte.
            </>
          ),
        },
      },
      {
        kind: "rows",
        title: "E se…",
        subtitle: "Como o aporte muda com outras escolhas",
        rows: [
          {
            title: "Aposentar 5 anos depois",
            detail: "em 2056, com 30 anos de aportes · −R$ 1.490",
            value: "R$ 4.150/mês",
            tone: "folha",
          },
          {
            title: "Pedir R$ 8.000 por mês",
            detail: "patrimônio de R$ 2,4 mi · −R$ 1.180",
            value: "R$ 4.460/mês",
            tone: "folha",
          },
          {
            title: "Começar com R$ 20 mil a mais",
            detail: "usando parte da reserva · −R$ 100",
            value: "R$ 5.540/mês",
            tone: "folha",
          },
          {
            title: "Render 5% ao ano",
            detail: "carteira mais arrojada · −R$ 800",
            value: "R$ 4.840/mês",
            tone: "folha",
          },
        ],
      },
    ],
    closing: {
      kind: "rows",
      title: "Cabe no seu orçamento?",
      subtitle: "Comparado com o que sobrou em setembro",
      rows: [
        { title: "Aporte necessário", value: "R$ 5.640/mês", tone: "sand" },
        {
          title: "Sobra média do mês",
          detail: "entradas menos saídas",
          value: "R$ 2.287,53/mês",
          tone: "folha",
        },
        {
          title: "Diferença",
          detail: "o que falta por mês",
          value: "R$ 3.352/mês",
          tone: "urucum",
        },
      ],
      tip: {
        icon: "target",
        color: "var(--guara-arara)",
        content: (
          <>
            Guardando só a sobra de hoje, você chegaria a <strong>R$ 1,29 mi</strong> em 2051, uma
            renda de <strong>R$ 4.309/mês</strong>.
          </>
        ),
      },
      action: { label: "Ver onde cortar", icon: "scissors", href: "/simulador/corte" },
    },
    agent: {
      id: "pacu",
      name: "Pacu",
      questions: [
        "Como chegar lá sem apertar tanto o mês?",
        "Vale incluir previdência privada?",
        "Qual carteira combina com essa meta?",
      ],
    },
  },

  objetivo: {
    id: "objetivo",
    subtitle: "Planeje um objetivo com prazo e valor",
    premises: {
      fields: [
        { kind: "text", id: "ob-nome", label: "Objetivo", value: "Viagem para o Japão" },
        {
          kind: "slider",
          id: "ob-valor",
          label: "Quanto custa",
          value: "R$ 30.000",
          position: 30,
          hint: "Passagens, hospedagem e passeios para 2 pessoas",
        },
        {
          kind: "slider",
          id: "ob-prazo",
          label: "Prazo",
          value: "18 meses",
          position: 35,
          hint: "Viajar em abril de 2028",
        },
        {
          kind: "text",
          id: "ob-guardado",
          label: "Já guardado",
          value: "R$ 4.000,00",
          hint: "Separado no CDB 110% CDI",
        },
        {
          kind: "chips",
          label: "Onde guardar",
          options: ["CDB 110% CDI", "Tesouro Selic", "Caixinha do banco"],
          pressed: ["CDB 110% CDI"],
        },
        { kind: "note", text: "Rendimento estimado de 0,9% ao mês, já descontado o imposto." },
      ],
      summary: [
        ["Falta juntar", "R$ 26.000"],
        ["Depósitos", "18 de R$ 1.310"],
        ["Primeiro depósito", "5 de outubro, com o salário"],
      ],
    },
    result: {
      title: "Seu plano para a viagem",
      subtitle: "Meta de R$ 30.000 em 18 meses",
      metricLabel: "Guardar por mês",
      metric: "R$ 1.310",
      detail: (
        <>
          Equivale a <strong className="text-sand">57%</strong> do que sobrou em setembro ·
          acompanhado pela Onça
        </>
      ),
      chart: {
        series: project({ initial: 4000, deposit: 1310, rate: 0.009, points: 19, step: 1 }),
        color: "folha",
        goal: { value: 30_000, label: "Meta R$ 30.000" },
        ticks: [
          { index: 0, label: "out/26" },
          { index: 6, label: "abr/27" },
          { index: 12, label: "out/27" },
          { index: 18, label: "abr/28" },
        ],
        label: "Dinheiro guardado mês a mês até abril de 2028, chegando a R$ 30 mil.",
      },
      legend: [
        { label: "Guardado com rendimento", swatch: "line", color: "var(--guara-folha)" },
        { label: "Só o que você guardou", swatch: "dashed", color: "var(--guara-caption)" },
        { label: "Meta", swatch: "dashed", color: "var(--guara-tucano)" },
      ],
      scenarios: [
        { name: "Mais rápido", detail: "12 meses", value: "R$ 2.030" },
        { name: "Seu plano", detail: "18 meses", value: "R$ 1.310", current: true },
        { name: "Mais leve", detail: "24 meses", value: "R$ 940" },
      ],
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
        items: [
          { when: "jan/27", title: "25% · R$ 7.500", note: "a Onça avisa quando chegar" },
          { when: "jun/27", title: "50% · R$ 15.000", note: "a Onça avisa quando chegar" },
          { when: "dez/27", title: "75% · R$ 22.500", note: "a Onça avisa quando chegar" },
          { when: "abr/28", title: "Meta · R$ 30.000", note: "hora de reservar as passagens" },
        ],
      },
      {
        kind: "composition",
        title: "De onde vem o dinheiro",
        subtitle: "Em abril de 2028",
        slices: [
          {
            label: "Já guardado",
            amount: "R$ 4 mil",
            percent: "13%",
            width: 13.3,
            color: "#3E6A8C",
          },
          {
            label: "Seus depósitos",
            amount: "R$ 24 mil",
            percent: "78%",
            width: 78.1,
            color: "var(--guara-caption)",
          },
          {
            label: "Rendimento",
            amount: "R$ 3 mil",
            percent: "9%",
            width: 8.6,
            color: "var(--guara-folha)",
          },
        ],
        tip: {
          icon: "target",
          color: "var(--guara-folha)",
          content: (
            <>
              O rendimento paga cerca de <strong>9%</strong> da viagem. Guardar na conta corrente
              não renderia nada.
            </>
          ),
        },
      },
      {
        kind: "rows",
        title: "E se…",
        subtitle: "Quanto tempo leva em outros cenários",
        rows: [
          {
            title: "Guardar R$ 1.000 por mês",
            detail: "viagem em set/28",
            value: "23 meses",
            tone: "urucum",
          },
          {
            title: "Guardar R$ 1.622 por mês",
            detail: "viagem em jan/28 · somando a economia do corte de app",
            value: "15 meses",
            tone: "folha",
          },
          {
            title: "Começar com R$ 8.000",
            detail: "viagem em jan/28 · usando parte da reserva",
            value: "15 meses",
            tone: "folha",
          },
        ],
      },
    ],
    closing: {
      kind: "rows",
      title: "Suas metas",
      subtitle: "Acompanhadas pela Onça",
      rows: [
        {
          title: "Reserva de emergência",
          detail: "R$ 15.892 de R$ 30.000 · Tesouro Selic",
          value: "53%",
          tone: "arara",
        },
        {
          title: "Viagem para o Japão",
          detail: "esta simulação · começa em outubro",
          value: "novo",
          tone: "tucano",
        },
        {
          title: "Aposentadoria",
          detail: "em simulação · aporte de R$ 5.640/mês",
          value: "—",
          tone: "caption",
        },
      ],
      tip: {
        icon: "target",
        color: "var(--guara-tucano)",
        content: (
          <>
            Com a reserva e a viagem juntas, você guardaria <strong>R$ 2.300/mês</strong>, perto de
            tudo o que sobra hoje.
          </>
        ),
      },
    },
    agent: {
      id: "onca",
      name: "Onça",
      questions: [
        "Consigo viajar antes de 2028?",
        "Onde é melhor guardar esse dinheiro?",
        "Dá para juntar a reserva e a viagem ao mesmo tempo?",
      ],
    },
  },

  corte: {
    id: "corte",
    subtitle: "Veja quanto um corte rende ao longo do tempo",
    premises: {
      fields: [
        {
          kind: "chips",
          label: "Gasto para cortar",
          options: ["Transporte por app", "Delivery", "Assinaturas", "Compras online"],
          pressed: ["Transporte por app"],
        },
        {
          kind: "tip",
          tip: {
            icon: "target",
            color: "#E0935A",
            content: (
              <>
                Você gastou em média <strong>R$ 390 por mês</strong> com transporte por app nos
                últimos 3 meses.
              </>
            ),
          },
        },
        {
          kind: "slider",
          id: "co-corte",
          label: "Quanto cortar",
          value: "80%",
          position: 80,
          hint: "Fica um teto de R$ 78 por mês para emergências",
        },
        {
          kind: "slider",
          id: "co-rendimento",
          label: "Rendimento da economia",
          value: "4,0% a.a.",
          position: 45,
          hint: "Acima da inflação · perfil Moderado",
        },
        {
          kind: "chips",
          label: "Para onde vai a economia",
          options: ["Aposentadoria", "Viagem para o Japão", "Reserva"],
          pressed: ["Aposentadoria"],
        },
      ],
      summary: [
        ["Teto novo", "R$ 78/mês"],
        ["Economia", "R$ 312/mês"],
        ["Começa em", "outubro"],
      ],
    },
    result: {
      title: "O que esse corte vira",
      subtitle: "Economia investida todo mês, em valores de hoje",
      metricLabel: "Economia por mês",
      metric: "R$ 312",
      detail: (
        <>
          <strong className="text-sand">R$ 3.744</strong> por ano · R$ 46 mil em 10 anos
        </>
      ),
      chart: {
        series: project({
          initial: 0,
          deposit: 312,
          rate: monthlyRate(0.04),
          points: 11,
          step: 12,
        }),
        color: "folha",
        ticks: [
          { index: 0, label: "hoje" },
          { index: 2, label: "2 anos" },
          { index: 4, label: "4 anos" },
          { index: 6, label: "6 anos" },
          { index: 8, label: "8 anos" },
          { index: 10, label: "10 anos" },
        ],
        label: "Economia de R$ 312 por mês investida por 10 anos, chegando a cerca de R$ 46 mil.",
      },
      legend: [
        { label: "Economia investida", swatch: "line", color: "var(--guara-folha)" },
        { label: "Só a economia, sem rendimento", swatch: "dashed", color: "var(--guara-caption)" },
      ],
      scenarios: [
        { name: "Corte leve", detail: "30% · R$ 273 de teto", value: "R$ 117" },
        { name: "Corte médio", detail: "50% · R$ 195 de teto", value: "R$ 195" },
        { name: "Seu corte", detail: "80% · R$ 78 de teto", value: "R$ 312", current: true },
      ],
      primary: { label: "Criar teto de R$ 78", href: "/alertas/novo-teto" },
      disclaimer: "O teto avisa quando você chegar perto do limite. Simulação educativa.",
    },
    details: [
      {
        kind: "rows",
        title: "Quanto vira com o tempo",
        subtitle: "Investindo a economia todo mês",
        rows: [
          { title: "Em 1 ano", detail: "guardado R$ 4 mil", value: "R$ 4 mil", tone: "folha" },
          { title: "Em 5 anos", detail: "guardado R$ 19 mil", value: "R$ 21 mil", tone: "folha" },
          { title: "Em 10 anos", detail: "guardado R$ 37 mil", value: "R$ 46 mil", tone: "folha" },
          { title: "Em 25 anos", detail: "guardado R$ 94 mil", value: "R$ 159 mil", tone: "folha" },
        ],
      },
      {
        kind: "rows",
        title: "Efeito nas suas metas",
        subtitle: "Se a economia for para cada uma",
        rows: [
          {
            title: "Aposentadoria",
            detail: "o que falta por mês cai de R$ 3.352 para R$ 3.040",
            value: "−R$ 312",
            tone: "folha",
          },
          {
            title: "Viagem para o Japão",
            detail: "somando R$ 312 ao plano de R$ 1.310",
            value: "15 meses",
            tone: "folha",
          },
          {
            title: "Reserva de emergência",
            detail: "faltam R$ 14.108 para completar",
            value: "45 meses",
            tone: "arara",
          },
        ],
      },
      {
        kind: "rows",
        title: "Outros cortes possíveis",
        subtitle: "O Tamanduá encontrou nos seus gastos",
        rows: [
          {
            title: "Amazon Prime",
            detail: "sem compras ligadas nos últimos 60 dias",
            value: "R$ 19,90",
            tone: "folha",
          },
          {
            title: "Delivery no fim de semana",
            detail: "sexta e sábado somam 36% dos gastos",
            value: "≈ R$ 260",
            tone: "folha",
          },
          {
            title: "Gastos pequenos",
            detail: "24 compras abaixo de R$ 30 em setembro",
            value: "R$ 612",
            tone: "folha",
          },
        ],
        tip: {
          icon: "scissors",
          color: "var(--guara-folha)",
          content: (
            <>
              Somando tudo, dá para liberar até <strong>R$ 1.200 por mês</strong> sem mexer em
              moradia e mercado.
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
          title: "Teto de R$ 78 para transporte por app",
          note: "avisos em R$ 40 e R$ 60",
          done: true,
        },
        { when: "Todo mês", title: "R$ 312 separados no dia 5", note: "junto com o salário" },
        { when: "Se passar", title: "O Quero-quero confirma com você", note: "nada é bloqueado" },
      ],
    },
    agent: {
      id: "tamandua",
      name: "Tamanduá",
      questions: [
        "Quais gastos mais cresceram este ano?",
        "O que acontece se eu passar do teto?",
        "Quanto gasto com delivery por mês?",
      ],
    },
  },
};
