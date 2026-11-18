import type { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "./api";

/**
 * Consultas à API com cache compartilhado entre as telas.
 *
 * - **Uma chave por endereço** (`["api", "/v1/..."]`): o Início, Gastos e Alertas que pedem o
 *   mesmo `/v1/budgets/summary` usam a mesma resposta, sem buscar de novo ao trocar de aba.
 * - **O cache guarda a resposta crua** e cada tela a lê com o próprio schema (`select`), porque as
 *   telas validam partes diferentes da mesma resposta.
 * - **Fica fresca por 5 minutos**; depois disso a tela abre com o que já tem e atualiza por trás.
 */

export type ApiPath = `/v1/${string}`;

export const API_STALE_TIME = 5 * 60_000;

export const apiKey = (path: ApiPath) => ["api", path] as const;

const raw = z.unknown();

/** Busca a resposta sem validar (quem lê valida com o próprio schema). */
export const fetchRaw = (path: ApiPath, signal?: AbortSignal) => apiRequest(path, raw, { signal });

/**
 * Um leitor por schema, sempre a mesma função: o React Query só converte de novo quando a
 * resposta muda (e não a cada render).
 */
const readers = new WeakMap<z.ZodType, (data: unknown) => unknown>();
function readerFor<T>(schema: z.ZodType<T>): (data: unknown) => T {
  let reader = readers.get(schema);
  if (!reader) {
    reader = (data: unknown) => schema.parse(data);
    readers.set(schema, reader);
  }
  return reader as (data: unknown) => T;
}

/** Opções de `useQuery`/`useQueries` para um `GET` da API, validado com `schema`. */
export function apiQuery<T>(
  path: ApiPath,
  schema: z.ZodType<T>,
  { enabled = true, staleTime = API_STALE_TIME }: { enabled?: boolean; staleTime?: number } = {},
) {
  return {
    queryKey: apiKey(path),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchRaw(path, signal),
    select: readerFor(schema),
    enabled,
    staleTime,
  };
}

/** Busca antes de a tela pedir (não faz nada se já houver resposta fresca). */
export function prefetchApi(client: QueryClient, path: ApiPath) {
  return client.prefetchQuery({
    queryKey: apiKey(path),
    queryFn: ({ signal }) => fetchRaw(path, signal),
    staleTime: API_STALE_TIME,
  });
}

/**
 * Marca como velhas (e busca de novo as que estão na tela) as respostas cujos endereços começam
 * com algum dos prefixos. Sem prefixo, todas as da API.
 */
export function invalidateApi(client: QueryClient, ...prefixes: ApiPath[]) {
  return client.invalidateQueries({
    predicate: (query) => {
      const [scope, path] = query.queryKey;
      if (scope !== "api" || typeof path !== "string") return false;
      return prefixes.length === 0 || prefixes.some((prefix) => path.startsWith(prefix));
    },
  });
}

/**
 * Como `invalidateApi`, mas sem buscar agora: as telas abertas não pedem de novo (ex.: a página
 * de um item que acabou de ser excluído, que daria 404). Quem abrir depois busca a resposta nova.
 */
export function markApiStale(client: QueryClient, ...prefixes: ApiPath[]) {
  return client.invalidateQueries({
    refetchType: "none",
    predicate: (query) => {
      const [scope, path] = query.queryKey;
      if (scope !== "api" || typeof path !== "string") return false;
      return prefixes.length === 0 || prefixes.some((prefix) => path.startsWith(prefix));
    },
  });
}
