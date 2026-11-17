"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useSyncExternalStore } from "react";
import { z } from "zod";

import { StatusToast } from "@/components/states/status-toast";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/features/acesso/session";
import { apiRequest } from "@/lib/api";
import { invalidateApi } from "@/lib/api-query";
import { useSavedSimulations } from "@/stores/saved-simulations";

import type { Simulation } from "../data";
import { SIMULATIONS_PATH } from "../live";
import { toSavedSimulation } from "../saved";

const subscribeNothing = () => () => {};

/**
 * "Salvar" do Simulador: guarda a simulação como está (nome, valor e resumo) em Simulações
 * salvas e avisa com o atalho "Ver salvas". Com login, objetivo e corte vão para a conta
 * (`POST /v1/simulations`); a aposentadoria fica neste navegador. Com os mesmos números já
 * salvos, vira "Salva".
 */
export function SaveSimulationButton({ simulation }: { simulation: Simulation }) {
  const { live } = useSession();
  const queryClient = useQueryClient();
  const items = useSavedSimulations((state) => state.items);
  const add = useSavedSimulations((state) => state.add);
  const [toast, setToast] = useState<{ at: number; failed: boolean } | null>(null);
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const item = toSavedSimulation(simulation);
  const request = live ? simulation.result.save.request : undefined;
  const save = useMutation({
    mutationFn: () =>
      apiRequest(SIMULATIONS_PATH, z.unknown(), {
        method: "POST",
        body: { ...request, name: item.nome.slice(0, 80) },
      }),
    onSuccess: async () => {
      setSavedKeys((keys) => [...keys, item.id]);
      setToast((t) => ({ at: (t?.at ?? 0) + 1, failed: false }));
      await invalidateApi(queryClient, SIMULATIONS_PATH);
    },
    onError: () => setToast((t) => ({ at: (t?.at ?? 0) + 1, failed: true })),
  });
  const saved = request
    ? savedKeys.includes(item.id)
    : mounted && items.some((i) => i.id === item.id);

  return (
    <>
      <Button
        variant="secondary"
        disabled={saved || save.isPending}
        onClick={() => {
          if (request) {
            save.mutate();
            return;
          }
          add(item);
          setToast((t) => ({ at: (t?.at ?? 0) + 1, failed: false }));
        }}
      >
        {saved && <Icon name="check" size={18} />}
        <span>{saved ? "Salva" : save.isPending ? "Salvando…" : "Salvar"}</span>
      </Button>
      {toast !== null &&
        (toast.failed ? (
          <StatusToast
            key={toast.at}
            tone="neutral"
            icon="alert-triangle"
            title="Não deu para salvar"
            position="bottom"
          >
            Tente de novo em instantes.
          </StatusToast>
        ) : (
          <StatusToast
            key={toast.at}
            tone="neutral"
            icon="check"
            title="Simulação salva"
            position="bottom"
            action={
              <ButtonLink
                href="/simulador/salvas"
                variant="secondary"
                size="sm"
                className="text-14"
              >
                <span>Ver salvas</span>
              </ButtonLink>
            }
          >
            {`“${item.nome}” está em Simulações salvas.`}
          </StatusToast>
        ))}
    </>
  );
}
