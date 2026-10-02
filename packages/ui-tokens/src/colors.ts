/**
 * Cores do tema escuro (único tema do app).
 *
 * TODO(identidade-visual): valores neutros PROVISÓRIOS. Substituir pela paleta oficial do Guará.
 * Os nomes seguem as variáveis semânticas do shadcn/ui para que os componentes funcionem sem ajustes.
 * Usamos hex para que o React Native (mobile) consuma os mesmos valores.
 */
export const colors = {
  background: "#0a0a0b", // TODO(identidade-visual)
  foreground: "#fafafa", // TODO(identidade-visual)
  card: "#121214", // TODO(identidade-visual)
  cardForeground: "#fafafa",
  popover: "#121214",
  popoverForeground: "#fafafa",
  primary: "#e4e4e7", // TODO(identidade-visual): cor da marca
  primaryForeground: "#18181b",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  accent: "#27272a",
  accentForeground: "#fafafa",
  destructive: "#ef4444", // TODO(identidade-visual)
  border: "#27272a",
  input: "#3f3f46",
  ring: "#71717a",
  // Semânticas financeiras. TODO(identidade-visual)
  positive: "#22c55e",
  negative: "#ef4444",
  warning: "#f59e0b",
  // Séries de gráficos (recharts). TODO(identidade-visual)
  chart1: "#a1a1aa",
  chart2: "#71717a",
  chart3: "#d4d4d8",
  chart4: "#52525b",
  chart5: "#e4e4e7",
  // Navegação lateral (padrão do shadcn/ui). TODO(identidade-visual)
  sidebar: "#121214",
  sidebarForeground: "#fafafa",
  sidebarPrimary: "#e4e4e7",
  sidebarPrimaryForeground: "#18181b",
  sidebarAccent: "#27272a",
  sidebarAccentForeground: "#fafafa",
  sidebarBorder: "#27272a",
  sidebarRing: "#71717a",
} as const;

export type ColorToken = keyof typeof colors;
