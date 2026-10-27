import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthFlowState = {
  /** E-mail para onde o código foi mandado (`null` sem código a caminho). */
  email: string | null;
  /** Nome informado no cadastro (vai para o perfil depois do código). */
  name: string | null;
  setEmail: (email: string | null) => void;
  start: (email: string, name: string | null) => void;
  clear: () => void;
};

/** E-mail do login em andamento, guardado na aba para sobreviver a um recarregar na tela do código. */
export const useAuthFlow = create<AuthFlowState>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      setEmail: (email) => set({ email }),
      start: (email, name) => set({ email, name }),
      clear: () => set({ email: null, name: null }),
    }),
    { name: "guara-auth-flow", storage: createJSONStorage(() => sessionStorage) },
  ),
);
