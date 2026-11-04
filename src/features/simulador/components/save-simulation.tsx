"use client";

import { useState, useSyncExternalStore } from "react";

import { StatusToast } from "@/components/states/status-toast";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSavedSimulations } from "@/stores/saved-simulations";

import type { Simulation } from "../data";
import { toSavedSimulation } from "../saved";

const subscribeNothing = () => () => {};

/**
 * "Salvar" do Simulador: guarda a simulação como está (nome, valor e resumo) em Simulações
 * salvas e avisa com o atalho "Ver salvas". Com os mesmos números já salvos, vira "Salva".
 */
export function SaveSimulationButton({ simulation }: { simulation: Simulation }) {
  const items = useSavedSimulations((state) => state.items);
  const add = useSavedSimulations((state) => state.add);
  const [toast, setToast] = useState<number | null>(null);
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const item = toSavedSimulation(simulation);
  const saved = mounted && items.some((i) => i.id === item.id);

  return (
    <>
      <Button
        variant="secondary"
        disabled={saved}
        onClick={() => {
          add(toSavedSimulation(simulation));
          setToast(Date.now());
        }}
      >
        {saved && <Icon name="check" size={18} />}
        <span>{saved ? "Salva" : "Salvar"}</span>
      </Button>
      {toast !== null && (
        <StatusToast
          key={toast}
          tone="neutral"
          icon="check"
          title="Simulação salva"
          position="bottom"
          action={
            <ButtonLink href="/simulador/salvas" variant="secondary" size="sm" className="text-14">
              <span>Ver salvas</span>
            </ButtonLink>
          }
        >
          {`“${item.nome}” está em Simulações salvas.`}
        </StatusToast>
      )}
    </>
  );
}
