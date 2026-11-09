/**
 * Layout editável das telas (Início, Gastos): a ordem, o tamanho e a visibilidade dos blocos que
 * a tela já tem. TS puro, testado. A pessoa nunca cria um bloco: só mexe nos de `BlockDef`.
 */

/** Telas com layout editável (o mesmo nome que a API usa). */
export type LayoutScreen = "home" | "spending";

/**
 * Tamanho do bloco na grade de 12 colunas do desktop: `xs` 1/4, `s` 1/3, `m` 1/2, `l` 2/3, `xl`
 * a largura toda. No tablet, `xs`, `s` e `m` ocupam metade e `l` e `xl`, tudo; no celular, tudo.
 */
export const LAYOUT_SIZES = ["xs", "s", "m", "l", "xl"] as const;
export type LayoutSize = (typeof LAYOUT_SIZES)[number];

export const SIZE_LABELS: Record<LayoutSize, string> = {
  xs: "1/4 da largura",
  s: "1/3 da largura",
  m: "Metade",
  l: "2/3 da largura",
  xl: "Largura toda",
};

/** Colunas que cada tamanho ocupa na grade de 12 do desktop. */
export const SIZE_COLUMNS: Record<LayoutSize, number> = { xs: 3, s: 4, m: 6, l: 8, xl: 12 };

/** Versão do formato salvo. Suba quando o significado de um campo mudar. */
export const LAYOUT_VERSION = 1;

/** Um bloco que a tela sabe desenhar. */
export interface BlockDef {
  id: string;
  /** Nome que aparece em "Blocos ocultos" e para o leitor de tela. */
  label: string;
  defaultSize: LayoutSize;
  /** Tamanhos que o bloco aceita, do menor ao maior (gráficos não cabem em 1/4). */
  sizes: readonly LayoutSize[];
  /** Grupo da tela (as seções do Início); blocos só trocam de lugar dentro do grupo. */
  group?: string;
}

/** Como um bloco está agora. */
export interface LayoutBlock {
  id: string;
  size: LayoutSize;
  hidden: boolean;
  /** Celular: altura reduzida. */
  compact: boolean;
}

export const defaultLayout = (defs: readonly BlockDef[]): LayoutBlock[] =>
  defs.map((def) => ({ id: def.id, size: def.defaultSize, hidden: false, compact: false }));

/**
 * Junta o layout salvo com os blocos que a tela tem hoje: bloco que o app não conhece mais sai;
 * bloco novo entra na posição padrão (logo depois do vizinho que vinha antes dele); tamanho que
 * o bloco não aceita mais volta ao padrão. Assim um layout de uma versão antiga nunca quebra.
 */
export function mergeLayout(
  defs: readonly BlockDef[],
  saved: readonly LayoutBlock[] | null | undefined,
): LayoutBlock[] {
  if (!saved || saved.length === 0) return defaultLayout(defs);
  const byId = new Map(defs.map((def) => [def.id, def]));
  const result: LayoutBlock[] = [];
  const seen = new Set<string>();
  for (const block of saved) {
    const def = byId.get(block.id);
    if (!def || seen.has(block.id)) continue;
    seen.add(block.id);
    result.push({
      id: block.id,
      size: def.sizes.includes(block.size) ? block.size : def.defaultSize,
      hidden: Boolean(block.hidden),
      compact: Boolean(block.compact),
    });
  }
  defs.forEach((def, index) => {
    if (seen.has(def.id)) return;
    const fresh: LayoutBlock = { id: def.id, size: def.defaultSize, hidden: false, compact: false };
    const previous = defs
      .slice(0, index)
      .reverse()
      .find((other) => seen.has(other.id));
    const at = previous ? result.findIndex((b) => b.id === previous.id) + 1 : 0;
    result.splice(at, 0, fresh);
    seen.add(def.id);
  });
  return result;
}

/** Leva o bloco `id` para a posição do bloco `overId` (arrastar e soltar). */
export function moveBlock(
  layout: readonly LayoutBlock[],
  id: string,
  overId: string,
): LayoutBlock[] {
  const from = layout.findIndex((b) => b.id === id);
  const to = layout.findIndex((b) => b.id === overId);
  if (from < 0 || to < 0 || from === to) return [...layout];
  const next = [...layout];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/**
 * Move o bloco uma posição entre os blocos visíveis do mesmo grupo (teclado: "mover para
 * antes/depois"). Fica onde está se já é o primeiro/último.
 */
export function shiftBlock(
  layout: readonly LayoutBlock[],
  defs: readonly BlockDef[],
  id: string,
  direction: -1 | 1,
): LayoutBlock[] {
  const group = defs.find((def) => def.id === id)?.group;
  const peers = layout.filter(
    (b) => !b.hidden && defs.find((def) => def.id === b.id)?.group === group,
  );
  const index = peers.findIndex((b) => b.id === id);
  const target = peers[index + direction];
  return target ? moveBlock(layout, id, target.id) : [...layout];
}

/** Próximo tamanho aceito na direção pedida (1 cresce, −1 diminui), ou o mesmo no limite. */
export function stepSize(def: BlockDef, size: LayoutSize, direction: -1 | 1): LayoutSize {
  const index = def.sizes.indexOf(size);
  if (index < 0) return def.defaultSize;
  return def.sizes[Math.min(def.sizes.length - 1, Math.max(0, index + direction))]!;
}

/** Tamanho aceito mais perto de um número de colunas (a alça de redimensionar). */
export function sizeForColumns(def: BlockDef, columns: number): LayoutSize {
  let best = def.sizes[0]!;
  for (const size of def.sizes) {
    if (Math.abs(SIZE_COLUMNS[size] - columns) < Math.abs(SIZE_COLUMNS[best] - columns)) {
      best = size;
    }
  }
  return best;
}

export const updateBlock = (
  layout: readonly LayoutBlock[],
  id: string,
  patch: Partial<Omit<LayoutBlock, "id">>,
): LayoutBlock[] => layout.map((b) => (b.id === id ? { ...b, ...patch } : b));

/** O layout é igual ao padrão? (então não há o que salvar nem restaurar) */
export const isDefaultLayout = (defs: readonly BlockDef[], layout: readonly LayoutBlock[]) =>
  JSON.stringify(defaultLayout(defs)) === JSON.stringify(layout);
