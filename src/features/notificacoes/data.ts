import type { IconName } from "@/components/ui/icon";

export type NotificationTone = "urucum" | "tucano" | "arara" | "neutral";

export type AppNotification = {
  id: string;
  icone: IconName;
  tom: NotificationTone;
  titulo: string;
  texto: string;
  meta: string;
  acao?: { label: string; href: string };
  nova?: boolean;
  categoria: "gastos" | "investimentos" | "conta";
};

export const notifications: AppNotification[] = [
  {
    id: "fora-do-padrao",
    icone: "alert-triangle",
    tom: "urucum",
    titulo: "Compra de R$ 1.249,90 às 02:14",
    texto: "Loja de eletrônicos · 3,8x sua média",
    meta: "Quero-quero · Fora do padrão · Hoje, 02:15",
    acao: { label: "Revisar", href: "/gastos/lancamentos/eletronicos-online" },
    nova: true,
    categoria: "gastos",
  },
  {
    id: "teto-transporte",
    icone: "target",
    tom: "tucano",
    titulo: "Transporte chegou a 86% do teto",
    texto: "Faltam R$ 63,60 até o limite do mês",
    meta: "Tamanduá · Gastos",
    acao: { label: "Ver", href: "/alertas/tetos/transporte" },
    nova: true,
    categoria: "gastos",
  },
  {
    id: "netflix",
    icone: "repeat-alt",
    tom: "tucano",
    titulo: "Netflix subiu R$ 5,00",
    texto: "Próxima cobrança de R$ 44,90 em 8 de outubro",
    meta: "Tamanduá · Gastos",
    acao: { label: "Ver", href: "/assinaturas/netflix" },
    nova: true,
    categoria: "gastos",
  },
  {
    id: "itau",
    icone: "bank",
    tom: "arara",
    titulo: "Itaú: a autorização termina em 26 de outubro",
    texto: "Depois disso, gastos e saldo do Itaú param de atualizar",
    meta: "Conta · Bancos conectados",
    acao: { label: "Renovar", href: "/perfil/bancos/itau/renovar" },
    categoria: "conta",
  },
  {
    id: "alimentacao-700",
    icone: "target",
    tom: "neutral",
    titulo: "Alimentação chegou a R$ 700 (2º de 3 avisos)",
    texto: "Teto de R$ 1.000",
    meta: "Tamanduá · Gastos · 21 set, 19:02",
    categoria: "gastos",
  },
  {
    id: "transporte-300",
    icone: "target",
    tom: "neutral",
    titulo: "Transporte chegou a R$ 300 (1º de 2 avisos)",
    texto: "Teto de R$ 450",
    meta: "Tamanduá · Gastos · 17 set, 08:41",
    categoria: "gastos",
  },
  {
    id: "alimentacao-500",
    icone: "target",
    tom: "neutral",
    titulo: "Alimentação chegou a R$ 500 (1º de 3 avisos)",
    texto: "Teto de R$ 1.000",
    meta: "Tamanduá · Gastos · 12 set, 13:48",
    categoria: "gastos",
  },
];

export const notificationChannels = [
  { label: "Tetos de gasto", value: "Celular e e-mail" },
  { label: "Alertas de preço", value: "Celular e e-mail" },
  { label: "Compras fora do padrão", value: "Celular e e-mail" },
];

export const notificationsThisMonth = [
  { label: "Tetos de gasto", value: "3 avisos" },
  { label: "Compras fora do padrão", value: "1, esperando resposta" },
  { label: "Assinaturas", value: "1 aumento de preço" },
  { label: "Bancos", value: "1 autorização vencendo" },
];
