"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { CountUpNumbers } from "@/components/layout/count-up-numbers";
import { SessionProvider } from "@/features/acesso/session";
import { isLive } from "@/lib/env";
import { persistQueries, restorePersistedQueries } from "@/lib/query-persist";

let browserQueryClient: QueryClient | undefined;

/**
 * Um client por render no servidor; um só no navegador, já com a cópia do cache desta conta (as
 * telas só aparecem depois do porteiro da sessão, então não há diferença com o HTML do servidor).
 */
function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
    });
    if (isLive) restorePersistedQueries(browserQueryClient);
  }
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const client = getQueryClient();
  useEffect(() => (isLive ? persistQueries(client) : undefined), [client]);
  return (
    <QueryClientProvider client={client}>
      {/* Antes do app: termina as contagens antes do `ValuesMask` guardar os valores. */}
      <CountUpNumbers />
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
