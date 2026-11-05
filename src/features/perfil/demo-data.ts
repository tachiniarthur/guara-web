"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiRequest } from "@/lib/api";

/** `GET`, `POST` e `DELETE /v1/me/demo-data`. */
const DemoDataStatusSchema = z.object({ available: z.boolean(), seeded: z.boolean() });
export type DemoDataStatus = z.infer<typeof DemoDataStatusSchema>;

const demoDataKey = ["dados-de-exemplo"] as const;

/**
 * Se o ambiente oferece dados de exemplo (só o de teste) e se a conta está com eles. Em produção
 * `available` é `false` e o bloco nem aparece.
 */
export function useDemoDataStatus({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: demoDataKey,
    queryFn: ({ signal }) => apiRequest("/v1/me/demo-data", DemoDataStatusSchema, { signal }),
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Grava (`fill`) ou apaga (`clear`) os dados de exemplo. Os dados mudam em todas as telas. */
export function useDemoDataAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: "fill" | "clear") =>
      apiRequest("/v1/me/demo-data", DemoDataStatusSchema, {
        method: action === "fill" ? "POST" : "DELETE",
        signal: AbortSignal.timeout(90_000),
      }),
    onSuccess: async (status) => {
      queryClient.setQueryData(demoDataKey, status);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== demoDataKey[0],
      });
    },
  });
}
