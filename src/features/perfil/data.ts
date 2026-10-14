/** Configurações do usuário de exemplo (ainda não há API). */

export const account = { email: "arthur@exemplo.com" };

export const investorProfile = {
  perfil: "Moderado",
  detalhe: "Respondido em 23 set 2026 · vale só para Investimentos",
};

export const plan = { nome: "Completo", usadas: 2, total: 3 };

export type BankConnection = {
  id: string;
  nome: string;
  inicial: string;
  status: "ok" | "renovar";
  mensagem: { texto: string; destaque?: string; depois?: string };
  escopo: string[];
  atualizado: string;
  validade: string;
};

export const bankConnections: BankConnection[] = [
  {
    id: "nubank",
    nome: "Nubank",
    inicial: "N",
    status: "ok",
    mensagem: {
      texto:
        "Tudo certo. Seus gastos e saldo do Nubank chegam sozinhos, várias vezes ao dia. Não precisa fazer nada.",
    },
    escopo: ["Conta", "Cartão de crédito", "Investimentos"],
    atualizado: "Hoje, 14:30",
    validade: "23/09/2027",
  },
  {
    id: "itau",
    nome: "Itaú",
    inicial: "I",
    status: "renovar",
    mensagem: {
      texto: "A autorização termina em",
      destaque: "26 de outubro",
      depois:
        ". Depois disso, gastos e saldo do Itaú param de atualizar. Renovar leva 1 minuto no app do banco.",
    },
    escopo: ["Conta", "Cartão de crédito", "Investimentos"],
    atualizado: "Hoje, 14:28",
    validade: "26/10/2026",
  },
];

export const notificationTypes = ["Tetos de gasto", "Alertas de preço", "Compras fora do padrão"];

export const textSizes = [
  { value: "padrao", label: "Padrão" },
  { value: "grande", label: "Grande" },
  { value: "maior", label: "Maior" },
] as const;

export const devices = [
  {
    id: "iphone",
    icon: "phone",
    nome: "iPhone 16",
    detalhe: "Este aparelho · São Paulo",
    quando: "Agora",
    atual: true,
  },
  {
    id: "macbook",
    icon: "laptop",
    nome: "MacBook Air",
    detalhe: "Navegador · São Paulo",
    quando: "Ontem, 21:40",
  },
] as const;
