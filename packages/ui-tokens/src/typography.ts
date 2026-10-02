/**
 * Tipografia. TODO(identidade-visual): fonte e escala provisórias.
 * A fonte "sans" é carregada no web via next/font; a pilha abaixo é o fallback.
 */
export const fontFamily = {
  sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
} as const;

/** Tamanhos em px (o mobile usa números; o web converte para rem). */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
