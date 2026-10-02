/** Travessão (U+2014) exibido quando não há valor. */
export const EMPTY_VALUE = "—";

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
