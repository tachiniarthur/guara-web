/**
 * Estados de uma tela, abertos por `?estado=` (ex.: `/alertas?estado=erro`):
 * carregando (círculo girando em cada card), erro (não deu para carregar), sem internet (dados guardados),
 * vazio (ainda sem dados), vazio com filtro (a busca não achou nada) e excluída (com desfazer).
 */
export type ScreenState =
  "carregando" | "erro" | "sem-internet" | "vazio" | "vazio-filtro" | "excluida";

const states: ScreenState[] = [
  "carregando",
  "erro",
  "sem-internet",
  "vazio",
  "vazio-filtro",
  "excluida",
];

export function parseScreenState(value: string | string[] | undefined): ScreenState | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return states.find((state) => state === raw) ?? null;
}

/** Momento dos dados guardados mostrados sem internet. */
export const OFFLINE_NOTE = "Sem internet · dados de hoje, 14:30";
