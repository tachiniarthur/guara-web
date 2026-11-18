"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { formatQuantity, PositionDetailSchema, type PositionDetail } from "@/features/ativo/live";
import { apiRequest } from "@/lib/api";
import { apiQuery, invalidateApi, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";

/*
 * Investimento duplicado: um cadastro manual igual a uma posição que chegou pelo Open Finance
 * (a API compara ticker e bolsa, ou tipo e nome, ou emissor e vencimento). A pessoa escolhe
 * excluir o manual ou mantê-los separados; até lá, os dois contam na carteira.
 */

export const DUPLICATES_PATH: ApiPath = "/v1/investments/duplicates";

const DuplicatesSchema = z.object({
  data: z.array(z.object({ manual: PositionDetailSchema, openFinance: PositionDetailSchema })),
});
export type DuplicatePair = z.infer<typeof DuplicatesSchema>["data"][number];

const day = (value: string | null | undefined) =>
  value ? formatDate(`${value.slice(0, 10)}T12:00:00-03:00`) : "—";

/** As linhas de cada lado: valor, quantidade (só com ticker) e de quando é o número. */
export function duplicateRows(p: PositionDetail) {
  const manual = p.source === "manual";
  return [
    { label: manual ? "Valor informado" : "Valor hoje", value: formatCurrency(p.valueCents) },
    { label: "Quantidade", value: p.symbol ? formatQuantity(p.quantity) : "—" },
    manual
      ? { label: "Cadastrado", value: `${day(p.createdAt)} · à mão` }
      : { label: "Atualizado", value: `${day(p.valuedOn ?? p.updatedAt)} · sozinho` },
  ];
}

export function useDuplicates({ enabled }: { enabled: boolean }) {
  return useQuery(apiQuery(DUPLICATES_PATH, DuplicatesSchema, { enabled }));
}

const refresh = (client: ReturnType<typeof useQueryClient>) =>
  invalidateApi(client, "/v1/investments", "/v1/goals", "/v1/dashboard");

/** "Manter separados": o manual para de aparecer como duplicado. */
export function useKeepSeparate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (manualId: string) =>
      apiRequest(
        `/v1/investments/positions/${encodeURIComponent(manualId)}/keep-separate`,
        z.undefined(),
        { method: "POST", body: {} },
      ),
    onSuccess: () => refresh(client),
  });
}

/** "Excluir o cadastro manual": fica só a posição do Open Finance. */
export function useRemoveManual() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (manualId: string) =>
      apiRequest(`/v1/investments/positions/${encodeURIComponent(manualId)}`, z.undefined(), {
        method: "DELETE",
      }),
    onSuccess: () => refresh(client),
  });
}
