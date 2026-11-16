/**
 * O Guará é o único assistente do app: quem responde no chat e quem dá os avisos (compra fora do
 * padrão, teto perto do fim, alerta de preço…). Não há outros assistentes para escolher.
 * O retrato é o mesmo da logo.
 */
export const guara = {
  /** Nome completo, usado ao lado do retrato. */
  nome: "Lobo Guará",
  /** Nome curto, no meio das frases ("O Guará viu…"). */
  curto: "Guará",
  retrato: "/images/marca/logo-guara.png",
  /** Fundo do retrato (verde-mata da logo). */
  anel: "#1B4535",
} as const;
