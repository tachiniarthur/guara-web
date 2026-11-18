import type { IconName } from "@/components/ui/icon";

export const onboardingSteps = ["Plano", "Bancos", "Perfil", "Avisos"] as const;

export const onboardingHighlights: { icon: IconName; text: string }[] = [
  {
    icon: "shield",
    text: "Open Finance Brasil: você autoriza no app do banco e pode revogar quando quiser.",
  },
  { icon: "eye", text: "Nunca pedimos a senha do seu banco e nunca movimentamos seu dinheiro." },
  { icon: "chat", text: "Pergunte do seu jeito. O Guará responde." },
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

/** Fora da lista da etapa "Conecte seus bancos" (continuam conectáveis; só não aparecem ali). */
const hiddenInPicker = new Set(["caixa", "santander"]);

/** Os bancos da lista da etapa "Conecte seus bancos" (os conectados aparecem sempre). */
export const pickerBanks = (connected: readonly string[]) =>
  banks.filter((bank) => !hiddenInPicker.has(bank.id) || connected.includes(bank.id));

/** "O que o Guará acessa": o que ele lê do banco e o que nunca faz. */
export const bankAccess = {
  sees: ["Saldos e extratos", "Cartões e faturas", "Investimentos"],
  never: [
    "Ver ou guardar a senha do seu banco",
    "Fazer pagamentos, Pix ou transferências",
    "Mover o seu dinheiro",
  ],
};

export const profileEffects: { icon: IconName; titulo: string; texto: string }[] = [
  {
    icon: "target",
    titulo: "Carteira comparada ao alvo",
    texto: "A Alocação compara a sua carteira com as 4 classes do perfil Moderado.",
  },
  {
    icon: "alert-triangle",
    titulo: "Aviso quando sair do alvo",
    texto: "Se uma classe passar 2 p.p. do alvo, você vê isso em Investimentos e na Alocação.",
  },
  {
    icon: "shield-check",
    titulo: "Nada muda sem você",
    texto: "O Guará só lê seus dados. Comprar, vender ou mover dinheiro é sempre com você.",
  },
];
