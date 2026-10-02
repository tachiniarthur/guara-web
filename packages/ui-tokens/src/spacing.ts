/**
 * Espaçamento em px, numa escala de 4px. TODO(identidade-visual): revisar.
 * `unit` é a base usada pelo Tailwind (`--spacing`), então `p-4` = 4 * unit.
 */
export const spacing = {
  unit: 4,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
