import type { AgentId } from "@/features/assistentes/data";
import type { IconName } from "@/components/ui/icon";

export const onboardingSteps = ["Bancos", "Perfil", "Assistentes"] as const;

export const onboardingHighlights: { icon: IconName; text: string }[] = [
  {
    icon: "shield",
    text: "Open Finance Brasil: você autoriza no app do banco e pode revogar quando quiser.",
  },
  { icon: "eye", text: "Nunca pedimos a senha do seu banco e nunca movimentamos seu dinheiro." },
  { icon: "chat", text: "Pergunte do seu jeito. O assistente certo responde." },
];

export const banks = [
  { id: "nubank", nome: "Nubank", sigla: "N" },
  { id: "itau", nome: "Itaú", sigla: "I" },
  { id: "bradesco", nome: "Bradesco", sigla: "B" },
  { id: "bb", nome: "Banco do Brasil", sigla: "BB" },
  { id: "caixa", nome: "Caixa", sigla: "C" },
  { id: "inter", nome: "Inter", sigla: "In" },
  { id: "santander", nome: "Santander", sigla: "S" },
  { id: "c6", nome: "C6 Bank", sigla: "C6" },
];

export const bankAccess = [
  { allowed: true, text: "Vemos: Saldos e extratos" },
  { allowed: true, text: "Vemos: Cartões e faturas" },
  { allowed: true, text: "Vemos: Investimentos" },
  { allowed: false, text: "Nunca: Sua senha do banco" },
  { allowed: false, text: "Nunca: Fazer pagamentos ou Pix" },
];

export const riskQuestion = {
  numero: 3,
  total: 6,
  pergunta: "Se seus investimentos caíssem 15% em um mês, o que você faria?",
  opcoes: [
    "Venderia tudo para não perder mais",
    "Venderia uma parte",
    "Manteria e esperaria recuperar",
    "Aproveitaria para investir mais",
  ],
  escolhida: 2,
};

export const agentIntros: { id: AgentId; texto: string }[] = [
  { id: "capivara", texto: "Coordena a equipe: recebe sua pergunta e chama o assistente certo." },
  { id: "pacu", texto: "Tira dúvidas, monta simulações e analisa sua carteira." },
  { id: "caramelo", texto: "Vigia os preços que você escolher e avisa na hora." },
  { id: "tamandua", texto: "Organiza seus gastos e responde quanto foi para onde." },
  { id: "quero-quero", texto: "Percebe compras fora do seu padrão e confirma com você." },
  {
    id: "onca",
    texto: "Acompanha suas metas, como viagem e reserva, e avisa se o ritmo está bom.",
  },
];
