/** Planos do Guará (o usuário está no Completo). */

export type Plan = {
  id: "essencial" | "completo" | "ampliado";
  nome: string;
  preco: string;
  /** Linha de baixo do preço ("ou R$ 199,00 por ano", "para sempre"). */
  apoio: string;
  mensal: boolean;
  bancos: string;
  perguntas: string;
  recursos: string[];
  atual?: boolean;
  /** Aviso ao descer de plano (versão curta no tablet e no desktop). */
  aviso?: { curto: string; longo: string };
};

export const plans: Plan[] = [
  {
    id: "essencial",
    nome: "Essencial",
    preco: "Grátis",
    apoio: "para sempre",
    mensal: false,
    bancos: "1 banco",
    perguntas: "30 perguntas por mês aos assistentes",
    recursos: [
      "Gastos, tetos e assinaturas",
      "Até 3 alertas de preço",
      "Relatório do mês, sem exportação",
      "Atualização 2 vezes ao dia",
    ],
    aviso: {
      curto: "Só 1 banco fica conectado.",
      longo: "Para mudar, você escolhe qual banco fica conectado. Os outros param de atualizar.",
    },
  },
  {
    id: "completo",
    nome: "Completo",
    preco: "R$ 19,90",
    apoio: "ou R$ 199,00 por ano",
    mensal: true,
    bancos: "3 bancos",
    perguntas: "300 perguntas por mês aos assistentes",
    recursos: [
      "Tudo do Essencial",
      "Investimentos completos e página de cada ativo",
      "Alertas de preço sem limite",
      "Relatórios com exportação em PDF, Excel e CSV",
      "Simulador e metas",
    ],
    atual: true,
  },
  {
    id: "ampliado",
    nome: "Ampliado",
    preco: "R$ 34,90",
    apoio: "ou R$ 349,00 por ano",
    mensal: true,
    bancos: "8 bancos e corretoras",
    perguntas: "1.000 perguntas por mês aos assistentes",
    recursos: ["Tudo do Completo", "Atualização a cada 2 horas", "Suporte prioritário"],
  },
];

export const planUsage = {
  renova: "Assinatura mensal · renova em 10/10/2026",
  bancos: { usados: 2, total: 3 },
  perguntas: { usadas: 112, total: 300, mes: "setembro" },
};

export const planComparison: { recurso: string; valores: [string, string, string] }[] = [
  { recurso: "Bancos conectados", valores: ["1", "3", "8 bancos e corretoras"] },
  { recurso: "Perguntas aos assistentes", valores: ["30/mês", "300/mês", "1.000/mês"] },
  { recurso: "Investimentos e página do ativo", valores: ["—", "Sim", "Sim"] },
  { recurso: "Alertas de preço", valores: ["Até 3", "Sem limite", "Sem limite"] },
  { recurso: "Exportar relatórios", valores: ["—", "PDF, Excel e CSV", "PDF, Excel e CSV"] },
  {
    recurso: "Atualização dos bancos",
    valores: ["2 vezes ao dia", "Várias vezes ao dia", "A cada 2 horas"],
  },
  { recurso: "Simulador e metas", valores: ["—", "Sim", "Sim"] },
  { recurso: "Suporte", valores: ["E-mail", "E-mail", "Prioritário"] },
];
