import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthFlowState = {
  /** E-mail para onde o código foi mandado (`null` sem código a caminho). */
  email: string | null;
  /** Nome informado no cadastro (vai para o perfil depois do código). */
  name: string | null;
  /** CPF do cadastro, só dígitos (vai para a conta depois do código). Só na memória, não no storage. */
  cpf: string | null;
  /** O código do "Esqueci minha senha" foi confirmado: falta criar a senha nova. */
  passwordPending: boolean;
  setEmail: (email: string | null) => void;
  start: (email: string, name: string | null, cpf?: string | null) => void;
  setPasswordPending: (pending: boolean) => void;
  clear: () => void;
};

/** E-mail do login em andamento, guardado na aba para sobreviver a um recarregar na tela do código. */
export const useAuthFlow = create<AuthFlowState>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      cpf: null,
      passwordPending: false,
      setEmail: (email) => set({ email }),
      start: (email, name, cpf = null) => set({ email, name, cpf, passwordPending: false }),
      setPasswordPending: (passwordPending) => set({ passwordPending }),
      clear: () => set({ email: null, name: null, cpf: null, passwordPending: false }),
    }),
    {
      name: "guara-auth-flow",
      storage: createJSONStorage(() => sessionStorage),
      // O CPF nunca vai para o storage do navegador.
      partialize: ({ email, name, passwordPending }) => ({ email, name, passwordPending }),
    },
  ),
);
