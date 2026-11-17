"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSession } from "@/features/acesso/session";
import { ALERTAS_PATHS } from "@/features/alertas/live";
import { ASSINATURAS_PATHS } from "@/features/assinaturas/live";
import { gastosPaths } from "@/features/gastos/live";
import { homePaths } from "@/features/inicio/live";
import { INVESTIMENTOS_PATHS } from "@/features/investimentos/live";
import { METAS_PATHS } from "@/features/metas/live";
import { reportPaths } from "@/features/relatorio/live";
import { SIMULADOR_PATHS, SIMULATIONS_PATH } from "@/features/simulador/live";
import { prefetchApi, type ApiPath } from "@/lib/api-query";

/** Quantas chamadas de pré-carregamento ao mesmo tempo (a API de teste é uma máquina pequena). */
const CONCURRENCY = 3;
/** Espera a tela aberta terminar de buscar antes de começar (no máximo este tempo). */
const MAX_WAIT = 10_000;

/** Endereços de todas as abas do menu, na ordem do menu e sem repetir. */
export function menuPaths(now: Date): ApiPath[] {
  const all: ApiPath[] = [
    ...Object.values(homePaths(now)),
    ...Object.values(gastosPaths(now)),
    ...Object.values(ASSINATURAS_PATHS),
    ...Object.values(INVESTIMENTOS_PATHS),
    ...Object.values(SIMULADOR_PATHS),
    SIMULATIONS_PATH,
    ...Object.values(METAS_PATHS),
    ...Object.values(reportPaths(now, "mes")).flat(),
    ...Object.values(ALERTAS_PATHS),
  ];
  return [...new Set(all)];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Busca por trás os dados das outras abas do menu, depois que a tela aberta carregou: ao trocar
 * de aba, a tela já abre pronta (o que estiver fresco no cache não é buscado de novo).
 */
export function usePrefetchScreens() {
  const { live, status } = useSession();
  const client = useQueryClient();
  useEffect(() => {
    if (!live || status !== "signedIn") return;
    let cancelled = false;
    void (async () => {
      const started = Date.now();
      await sleep(500);
      while (!cancelled && client.isFetching() > 0 && Date.now() - started < MAX_WAIT) {
        await sleep(300);
      }
      const queue = menuPaths(new Date());
      const worker = async () => {
        for (let path = queue.shift(); path && !cancelled; path = queue.shift()) {
          await prefetchApi(client, path).catch(() => undefined);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    })();
    return () => {
      cancelled = true;
    };
  }, [live, status, client]);
}
