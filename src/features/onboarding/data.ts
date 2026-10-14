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

export type ProfileQuestion = {
  pergunta: string;
  opcoes: string[];
  /** Resposta marcada no protótipo. */
  escolhida: number;
  porque: string;
};

/** As 6 perguntas do questionário de perfil de investidor. */
export const profileQuestions: ProfileQuestion[] = [
  {
    pergunta: "Qual é o seu principal objetivo ao investir?",
    opcoes: [
      "Proteger o que já tenho",
      "Juntar para um objetivo nos próximos anos",
      "Fazer o patrimônio crescer no longo prazo",
      "Ter uma renda extra todo mês",
    ],
    escolhida: 1,
    porque:
      "O objetivo define quanto risco faz sentido. Quem quer proteger o dinheiro precisa de mais renda fixa; quem pensa em décadas pode aceitar mais oscilação.",
  },
  {
    pergunta: "Por quanto tempo você pretende deixar o dinheiro investido?",
    opcoes: ["Menos de 1 ano", "De 1 a 3 anos", "De 3 a 10 anos", "Mais de 10 anos"],
    escolhida: 2,
    porque:
      "Quanto mais longo o prazo, mais tempo o investimento tem para se recuperar de quedas. Prazos curtos pedem aplicações que não oscilam.",
  },
  {
    pergunta: "Se seus investimentos caíssem 15% em um mês, o que você faria?",
    opcoes: [
      "Venderia tudo para não perder mais",
      "Venderia uma parte",
      "Manteria e esperaria recuperar",
      "Aproveitaria para investir mais",
    ],
    escolhida: 2,
    porque:
      "Seu perfil ajuda a montar simulações que combinam com você. Ele vale só para Investimentos e pode ser refeito quando quiser em Meu perfil.",
  },
  {
    pergunta: "Quanto você conhece de investimentos?",
    opcoes: [
      "Nunca investi",
      "Conheço poupança e renda fixa (CDB, Tesouro)",
      "Invisto em renda fixa e fundos, e um pouco em ações",
      "Invisto há anos em vários tipos, inclusive exterior, cripto e estruturados",
    ],
    escolhida: 2,
    porque:
      "Ajuda a explicar as coisas no nível certo e a não sugerir produtos que você ainda não conhece. Quem já investe em estruturados e alternativos pode ter o perfil Sofisticado.",
  },
  {
    pergunta: "Quanto da sua renda mensal você consegue investir?",
    opcoes: ["Nada por enquanto", "Até 10%", "De 10% a 25%", "Mais de 25%"],
    escolhida: 2,
    porque:
      "Quem investe uma parte maior da renda tem mais folga para enfrentar oscilações. Usamos isso só para calibrar o perfil, não para julgar seus gastos.",
  },
  {
    pergunta:
      "Se precisar de dinheiro de repente, quanto do que investiu você talvez tenha que resgatar?",
    opcoes: [
      "Quase tudo",
      "Mais da metade",
      "Uma parte pequena",
      "Nada, tenho uma reserva separada",
    ],
    escolhida: 2,
    porque:
      "Dinheiro que pode ser resgatado a qualquer momento precisa ficar em aplicações com liquidez diária. Isso muda a divisão da carteira.",
  },
];

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

/** Resumo das respostas no resultado do questionário. */
export const profileAnswers = [
  { pergunta: "Objetivo", resposta: "Juntar para um objetivo" },
  { pergunta: "Prazo", resposta: "3 a 10 anos" },
  { pergunta: "Queda de 15%", resposta: "Manteria e esperaria" },
  { pergunta: "Experiência", resposta: "Renda fixa, fundos e um pouco de ações" },
  { pergunta: "Parte da renda", resposta: "10% a 25%" },
  { pergunta: "Resgate de surpresa", resposta: "Uma parte pequena" },
];

export const profileEffects: { icon: IconName; titulo: string; texto: string }[] = [
  {
    icon: "target",
    titulo: "Sugestões seguem a carteira-alvo",
    texto: "O Pacu usa os 5 grupos do perfil Moderado para sugerir onde colocar novos aportes.",
  },
  {
    icon: "alert-triangle",
    titulo: "Aviso quando sair do alvo",
    texto: "Se um grupo passar 5 p.p. do alvo, você vê isso em Investimentos e na Alocação.",
  },
  {
    icon: "shield-check",
    titulo: "Nada muda sem você",
    texto: "O Guará só lê seus dados. Comprar, vender ou mover dinheiro é sempre com você.",
  },
];
