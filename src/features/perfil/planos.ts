/**
 * Planos do Guará (decisão de 27/10/2026; o mesmo catálogo de `GET /v1/plans` da API). Todos
 * são pagos e mensais; o Private ainda não está à venda. No protótipo, o usuário está no Plus.
 */

export type PlanId = "basic" | "plus" | "pro";

export type Plan = {
  id: PlanId;
  nome: string;
  preco: string;
  bancos: string;
  /** Limite de bancos conectados. */
  limiteBancos: number;
  perguntas: string;
  recursos: string[];
  atual?: boolean;
  /** Aviso ao descer de plano (versão curta no tablet e no desktop). */
  aviso?: { curto: string; longo: string };
};

export const plans: Plan[] = [
  {
    id: "basic",
    nome: "Básico",
    preco: "R$ 15,90",
    bancos: "1 banco",
    limiteBancos: 1,
    perguntas: "20 perguntas por mês aos assistentes",
    recursos: [
      "2 assistentes à sua escolha, além da Capivara",
      "Até 2 tetos de gasto e 2 alertas de preço",
      "Histórico de 3 meses",
      "Relatório do mês atual, sem exportação",
      "1 simulação por mês",
      "Suporte por e-mail",
    ],
    aviso: {
      curto: "Só 1 banco fica conectado.",
      longo: "Para mudar, você escolhe qual banco fica conectado. Os outros param de atualizar.",
    },
  },
  {
    id: "plus",
    nome: "Plus",
    preco: "R$ 39,90",
    bancos: "4 bancos",
    limiteBancos: 4,
    perguntas: "40 perguntas por mês aos assistentes",
    recursos: [
      "Tudo do Básico",
      "5 assistentes à sua escolha, além da Capivara",
      "Até 4 tetos de gasto e 4 alertas de preço",
      "Histórico de 12 meses",
      "Relatórios com exportação em PDF, Excel e CSV",
      "Simulador sem limite, metas e simulações salvas",
      "Página de cada ativo",
    ],
    atual: true,
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 69,90",
    bancos: "6 bancos",
    limiteBancos: 6,
    perguntas: "70 perguntas por mês aos assistentes",
    recursos: [
      "Tudo do Plus",
      "Todos os assistentes",
      "Tetos de gasto e alertas de preço sem limite",
      "Histórico completo",
      "Suporte por e-mail e WhatsApp",
    ],
  },
];

export const planById = (id: PlanId): Plan => plans.find((p) => p.id === id)!;

export const planUsage = {
  renova: "Assinatura mensal · renova em 10/10/2026",
  bancos: { usados: 2, total: 4 },
  perguntas: { usadas: 12, total: 40, mes: "setembro" },
};

export const planComparison: { recurso: string; valores: [string, string, string] }[] = [
  { recurso: "Bancos conectados", valores: ["1", "4", "6"] },
  { recurso: "Perguntas aos assistentes", valores: ["20/mês", "40/mês", "70/mês"] },
  { recurso: "Assistentes além da Capivara", valores: ["2 à escolha", "5 à escolha", "Todos"] },
  { recurso: "Tetos de gasto", valores: ["Até 2", "Até 4", "Sem limite"] },
  { recurso: "Alertas de preço", valores: ["Até 2", "Até 4", "Sem limite"] },
  { recurso: "Histórico", valores: ["3 meses", "12 meses", "Completo"] },
  { recurso: "Relatórios", valores: ["Só o mês atual", "Completos", "Completos"] },
  { recurso: "Exportar relatórios", valores: ["—", "PDF, Excel e CSV", "PDF, Excel e CSV"] },
  { recurso: "Simulador", valores: ["1 por mês", "Sem limite", "Sem limite"] },
  { recurso: "Metas e simulações salvas", valores: ["—", "Sim", "Sim"] },
  { recurso: "Página do ativo", valores: ["—", "Sim", "Sim"] },
  { recurso: "Suporte", valores: ["E-mail", "E-mail", "E-mail e WhatsApp"] },
];
