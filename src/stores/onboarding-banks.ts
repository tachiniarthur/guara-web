import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isLive } from "@/lib/env";

type OnboardingBanksState = {
  /** Bancos já conectados no onboarding (ids de `banks`). */
  connected: string[];
  /** O último que terminou de conectar (aviso na lista de bancos). */
  justConnected: string | null;
  connect: (bankId: string) => void;
  dismissNotice: () => void;
};

/**
 * Bancos conectados durante o onboarding. A conexão de verdade (Open Finance) ainda não existe:
 * por enquanto o fluxo é simulado e guardado na aba. No protótipo começa com o Nubank, como no
 * design; com login de verdade, sem nenhum.
 */
export const useOnboardingBanks = create<OnboardingBanksState>()(
  persist(
    (set) => ({
      connected: isLive ? [] : ["nubank"],
      justConnected: null,
      connect: (bankId) =>
        set((state) => ({
          connected: state.connected.includes(bankId)
            ? state.connected
            : [...state.connected, bankId],
          justConnected: bankId,
        })),
      dismissNotice: () => set({ justConnected: null }),
    }),
    { name: "guara-onboarding-banks", storage: createJSONStorage(() => sessionStorage) },
  ),
);
