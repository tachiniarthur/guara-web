import { colors } from "./colors.ts";
import { radii } from "./radii.ts";
import { spacing } from "./spacing.ts";
import { fontFamily, fontSize } from "./typography.ts";

const ROOT_FONT_SIZE = 16;

const kebab = (value: string) => value.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
const rem = (px: number) => `${px / ROOT_FONT_SIZE}rem`;
const fontStack = (fonts: readonly string[]) =>
  fonts.map((font) => (font.includes(" ") ? `"${font}"` : font)).join(", ");

/**
 * Converte os tokens em variáveis CSS. Os nomes das cores seguem o shadcn/ui
 * (ex.: `cardForeground` => `--card-foreground`). O apps/web importa o resultado
 * no globals.css e mapeia as variáveis para o tema do Tailwind.
 */
export function toCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(colors)) vars[`--${kebab(name)}`] = value;

  vars["--radius"] = rem(radii.lg);
  for (const [name, value] of Object.entries(radii)) {
    vars[`--guara-radius-${name}`] = name === "full" ? "9999px" : rem(value);
  }

  vars["--guara-spacing-unit"] = rem(spacing.unit);

  for (const [name, value] of Object.entries(fontFamily)) {
    vars[`--guara-font-${name}`] = fontStack(value);
  }
  for (const [name, value] of Object.entries(fontSize)) vars[`--guara-text-${name}`] = rem(value);

  return vars;
}

export function toCss(): string {
  const body = Object.entries(toCssVariables())
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `/* Arquivo gerado a partir de @guara/ui-tokens. Não edite manualmente. */\n:root {\n${body}\n}\n`;
}
