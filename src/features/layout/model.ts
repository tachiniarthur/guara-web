/**
 * Layout editável das telas (Início, Gastos): a ordem, a largura, a altura e a visibilidade dos
 * blocos que a tela já tem. TS puro, testado. A pessoa nunca cria um bloco: só mexe nos de
 * `BlockDef`.
 */

/** Telas com layout editável (o mesmo nome que a API usa). */
export type LayoutScreen = "home" | "spending";

/**
 * Tamanhos com nome (o formato salvo antes da largura livre, que o app antigo ainda lê): `xs` 1/4,
 * `s` 1/3, `m` 1/2, `l` 2/3, `xl` a largura toda.
 */
export const LAYOUT_SIZES = ["xs", "s", "m", "l", "xl"] as const;
export type LayoutSize = (typeof LAYOUT_SIZES)[number];

/** Colunas que cada tamanho ocupa na grade de 12 do desktop. */
export const SIZE_COLUMNS: Record<LayoutSize, number> = { xs: 3, s: 4, m: 6, l: 8, xl: 12 };

/** Alturas com nome do formato salvo antigo (`short` cortava o bloco e não existe mais). */
export const LAYOUT_HEIGHTS = ["short", "auto", "tall"] as const;
export type LayoutHeight = (typeof LAYOUT_HEIGHTS)[number];

export const GRID_COLUMNS = 12;

/**
 * Larguras que a pessoa escolhe (colunas da grade de 12): 1/4, 1/3, metade, 2/3, 3/4 e toda. Cada
 * bloco usa as que cabem entre o menor e o maior tamanho dele.
 */
export const WIDTH_PRESETS = [3, 4, 6, 8, 9, 12] as const;

/**
 * Alturas que a pessoa escolhe, como tamanho de roupa, além da automática (a do conteúdo). É a
 * altura mínima: o bloco nunca corta o conteúdo.
 */
export const HEIGHT_PRESETS = [
  { px: 320, name: "P" },
  { px: 400, name: "M" },
  { px: 480, name: "G" },
  { px: 560, name: "GG" },
  { px: 640, name: "XG" },
] as const;
/** Altura de um bloco salvo como "alto" antes das alturas escolhidas. */
const LEGACY_TALL = 480;

/** Versão do formato salvo. Suba quando o significado de um campo mudar. */
export const LAYOUT_VERSION = 1;

/** Um bloco que a tela sabe desenhar. */
export interface BlockDef {
  id: string;
  /** Nome que aparece em "Blocos ocultos" e para o leitor de tela. */
  label: string;
  defaultSize: LayoutSize;
  /**
   * Do menor ao maior tamanho que o bloco aceita: a largura livre fica entre as colunas do
   * primeiro e as do último (gráficos não cabem em 1/4).
   */
  sizes: readonly LayoutSize[];
  /** Grupo da tela (as seções do Início); blocos só trocam de lugar dentro do grupo. */
  group?: string;
  /**
   * Largura no tablet enquanto o bloco está na largura padrão (a do design, que nem sempre segue
   * a regra geral). Depois que a pessoa muda a largura, vale a regra: até 6 colunas, metade.
   */
  tablet?: "half" | "full";
}

/** Como um bloco está agora. */
export interface LayoutBlock {
  id: string;
  hidden: boolean;
  /** Largura no desktop, em colunas da grade de 12. */
  columns: number;
  /** Altura mínima escolhida (px); `null`: a do conteúdo. O bloco nunca corta o conteúdo. */
  minHeight: number | null;
}

/** Bloco como é guardado (local e API): os campos novos e os antigos, para quem só lê esses. */
export interface StoredBlock {
  id: string;
  size: LayoutSize;
  hidden: boolean;
  compact: boolean;
  height?: LayoutHeight;
  columns?: number;
  minHeight?: number;
}

export const defaultColumns = (def: BlockDef) => SIZE_COLUMNS[def.defaultSize];

/** Menor e maior largura (colunas) que o bloco aceita. */
export function columnRange(def: BlockDef): { min: number; max: number } {
  return {
    min: SIZE_COLUMNS[def.sizes[0] ?? def.defaultSize],
    max: SIZE_COLUMNS[def.sizes[def.sizes.length - 1] ?? def.defaultSize],
  };
}

/** Larguras que o bloco aceita, da menor à maior. */
export function widthOptions(def: BlockDef): number[] {
  const { min, max } = columnRange(def);
  return WIDTH_PRESETS.filter((columns) => columns >= min && columns <= max);
}

/** A largura aceita mais perto de um número de colunas (arrastar a alça, layouts antigos). */
export function snapColumns(def: BlockDef, columns: number): number {
  const options = widthOptions(def);
  return options.reduce((best, option) =>
    Math.abs(option - columns) < Math.abs(best - columns) ? option : best,
  );
}

/** A altura escolhida mais perto de uma medida (px). */
export function snapHeight(px: number): number {
  return HEIGHT_PRESETS.reduce(
    (best, preset) => (Math.abs(preset.px - px) < Math.abs(best - px) ? preset.px : best),
    HEIGHT_PRESETS[0].px as number,
  );
}

/** Arrastando a alça: bem abaixo da menor altura, volta à automática. */
export function heightForDrag(px: number): number | null {
  return px < HEIGHT_PRESETS[0].px - 40 ? null : snapHeight(px);
}

/** O bloco ocupa metade da largura no tablet? */
export function tabletHalf(def: BlockDef, columns: number): boolean {
  if (columns === defaultColumns(def) && def.tablet) return def.tablet === "half";
  return columns <= GRID_COLUMNS / 2;
}

/** Nome da largura para pessoas ("Metade", "5 de 12 colunas"). */
export function widthLabel(columns: number): string {
  const named: Record<number, string> = {
    3: "1/4 da largura",
    4: "1/3 da largura",
    6: "Metade",
    8: "2/3 da largura",
    9: "3/4 da largura",
    12: "Largura toda",
  };
  return named[columns] ?? `${columns} de 12 colunas`;
}

export function heightLabel(minHeight: number | null): string {
  if (minHeight === null) return "Altura automática";
  const preset = HEIGHT_PRESETS.find((p) => p.px === minHeight);
  return preset ? `Altura ${preset.name}` : `${minHeight} px de altura`;
}

const fresh = (def: BlockDef): LayoutBlock => ({
  id: def.id,
  hidden: false,
  columns: defaultColumns(def),
  minHeight: null,
});

export const defaultLayout = (defs: readonly BlockDef[]): LayoutBlock[] => defs.map(fresh);

/**
 * Junta o layout salvo com os blocos que a tela tem hoje: bloco que o app não conhece mais sai;
 * bloco novo entra na posição padrão (logo depois do vizinho que vinha antes dele); largura fora
 * do que o bloco aceita volta para dentro. Assim um layout de uma versão antiga nunca quebra.
 * Formato antigo: `size` vira colunas, "alto" vira 480 px e "baixo" (que cortava) vira automático.
 */
export function mergeLayout(
  defs: readonly BlockDef[],
  saved: readonly StoredBlock[] | null | undefined,
): LayoutBlock[] {
  if (!saved || saved.length === 0) return defaultLayout(defs);
  const byId = new Map(defs.map((def) => [def.id, def]));
  const result: LayoutBlock[] = [];
  const seen = new Set<string>();
  for (const block of saved) {
    const def = byId.get(block.id);
    if (!def || seen.has(block.id)) continue;
    seen.add(block.id);
    const columns =
      block.columns ??
      (def.sizes.includes(block.size) ? SIZE_COLUMNS[block.size] : defaultColumns(def));
    const minHeight = block.minHeight ?? (block.height === "tall" ? LEGACY_TALL : null);
    result.push({
      id: block.id,
      hidden: Boolean(block.hidden),
      columns: snapColumns(def, columns),
      minHeight: minHeight === null ? null : snapHeight(minHeight),
    });
  }
  defs.forEach((def, index) => {
    if (seen.has(def.id)) return;
    const previous = defs
      .slice(0, index)
      .reverse()
      .find((other) => seen.has(other.id));
    const at = previous ? result.findIndex((b) => b.id === previous.id) + 1 : 0;
    result.splice(at, 0, fresh(def));
    seen.add(def.id);
  });
  return result;
}

/** Tamanho com nome mais perto de uma largura, entre os que o bloco aceita (formato antigo). */
export function sizeForColumns(def: BlockDef, columns: number): LayoutSize {
  let best = def.sizes[0] ?? def.defaultSize;
  for (const size of def.sizes) {
    if (Math.abs(SIZE_COLUMNS[size] - columns) < Math.abs(SIZE_COLUMNS[best] - columns)) {
      best = size;
    }
  }
  return best;
}

/** O que vai para a API e para a cópia local (com os campos antigos preenchidos). */
export function toStored(defs: readonly BlockDef[], layout: readonly LayoutBlock[]): StoredBlock[] {
  return layout.map((block) => {
    const def = defs.find((d) => d.id === block.id);
    return {
      id: block.id,
      size: def ? sizeForColumns(def, block.columns) : "m",
      hidden: block.hidden,
      compact: false,
      height: block.minHeight === null ? "auto" : "tall",
      columns: block.columns,
      ...(block.minHeight === null ? {} : { minHeight: block.minHeight }),
    };
  });
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

/**
 * Próxima largura na direção pedida: no desktop, a próxima das pré-definidas; no tablet (duas
 * colunas), metade ⇄ largura toda.
 */
export function stepColumns(
  def: BlockDef,
  columns: number,
  direction: -1 | 1,
  mode: "desk" | "tablet",
): number {
  if (mode === "desk") {
    const options = widthOptions(def);
    const next =
      direction === 1
        ? options.find((option) => option > columns)
        : [...options].reverse().find((option) => option < columns);
    return next ?? columns;
  }
  const half = tabletHalf(def, columns);
  if (direction === 1 && half) {
    const next = snapColumns(def, GRID_COLUMNS);
    return tabletHalf(def, next) ? columns : next;
  }
  if (direction === -1 && !half) {
    const next = snapColumns(def, GRID_COLUMNS / 2);
    return tabletHalf(def, next) ? next : columns;
  }
  return columns;
}

/**
 * Próxima altura na direção pedida, entre a automática e as pré-definidas. Da automática para
 * cima, a primeira maior que a altura atual do bloco (`current`); abaixo da menor, automática.
 */
export function stepHeight(
  minHeight: number | null,
  current: number,
  direction: -1 | 1,
): number | null {
  const sizes = HEIGHT_PRESETS.map((preset) => preset.px as number);
  if (minHeight === null) {
    if (direction === -1) return null;
    return sizes.find((px) => px > current) ?? sizes[sizes.length - 1]!;
  }
  const index = sizes.indexOf(snapHeight(minHeight)) + direction;
  if (index < 0) return null;
  return sizes[Math.min(index, sizes.length - 1)]!;
}

export const updateBlock = (
  layout: readonly LayoutBlock[],
  id: string,
  patch: Partial<Omit<LayoutBlock, "id">>,
): LayoutBlock[] => layout.map((b) => (b.id === id ? { ...b, ...patch } : b));

/** O layout é igual ao padrão? (então não há o que salvar nem restaurar) */
export const isDefaultLayout = (defs: readonly BlockDef[], layout: readonly LayoutBlock[]) =>
  JSON.stringify(defaultLayout(defs)) === JSON.stringify(layout);
