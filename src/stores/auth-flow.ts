import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthFlowState = {
  /** E-mail para onde o código foi mandado (`null` sem código a caminho). */
  email: string | null;
  setEmail: (email: string | null) => void;
};

/** E-mail do login em andamento, guardado na aba para sobreviver a um recarregar na tela do código. */
export const useAuthFlow = create<AuthFlowState>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email) => set({ email }),
    }),
    { name: "guara-auth-flow", storage: createJSONStorage(() => sessionStorage) },
  ),
);
