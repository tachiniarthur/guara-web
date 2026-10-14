import { create } from "zustand";

type PrivacyState = {
  /** Valores em reais trocados por "R$ •••" em todo o app. */
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  toggle: () => void;
};

export const usePrivacy = create<PrivacyState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
  toggle: () => set((state) => ({ hidden: !state.hidden })),
}));
