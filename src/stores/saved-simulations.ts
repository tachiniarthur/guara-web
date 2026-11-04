import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SavedSimulation } from "@/features/simulador/saved";

type SavedSimulationsState = {
  /** Simulações salvas pela pessoa no Simulador, da mais nova para a mais antiga. */
  items: SavedSimulation[];
  add: (item: SavedSimulation) => void;
  remove: (id: string) => void;
};

/**
 * Simulações salvas pelo botão "Salvar" do Simulador. Ainda não há API para elas: ficam neste
 * navegador e aparecem em Simulações salvas antes dos exemplos.
 */
export const useSavedSimulations = create<SavedSimulationsState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => ({ items: [item, ...state.items.filter((i) => i.id !== item.id)] })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: "guara-saved-simulations", storage: createJSONStorage(() => localStorage) },
  ),
);
