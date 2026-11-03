import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** "Criar conta" achou uma conta: o "Entrar" abre com o e-mail ou o CPF e este aviso. */
export type SignInHint = {
  identifier: string;
  notice: string;
  /** A conta é só do Google ou da Apple (sem senha): o aviso aparece na escolha do "Entrar". */
  social: boolean;
};

type AuthFlowState = {
  /** E-mail para onde o código foi mandado (`null` sem código a caminho). */
  email: string | null;
  /** Nome informado no cadastro (vai para o perfil depois do código). */
  name: string | null;
  /** CPF do cadastro, só dígitos (vai para a conta depois do código). Só na memória, não no storage. */
  cpf: string | null;
  /** Celular do cadastro, 11 dígitos com DDD (vai para a conta depois do código). Só na memória. */
  phone: string | null;
  /** O código do cadastro foi confirmado e o nome, o CPF e o celular ainda estão indo para a conta. */
  signUpPending: boolean;
  /** O código do "Esqueci minha senha" foi confirmado: falta criar a senha nova. */
  passwordPending: boolean;
  /** Só na memória (pode levar o CPF). */
  signInHint: SignInHint | null;
  setEmail: (email: string | null) => void;
  start: (email: string, name: string | null, cpf?: string | null, phone?: string | null) => void;
  setSignUpPending: (pending: boolean) => void;
  setPasswordPending: (pending: boolean) => void;
  setSignInHint: (hint: SignInHint | null) => void;
  clear: () => void;
};

/** E-mail do login em andamento, guardado na aba para sobreviver a um recarregar na tela do código. */
export const useAuthFlow = create<AuthFlowState>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      cpf: null,
      phone: null,
      signUpPending: false,
      passwordPending: false,
      signInHint: null,
      setEmail: (email) => set({ email }),
      start: (email, name, cpf = null, phone = null) =>
        set({ email, name, cpf, phone, passwordPending: false }),
      setSignUpPending: (signUpPending) => set({ signUpPending }),
      setPasswordPending: (passwordPending) => set({ passwordPending }),
      setSignInHint: (signInHint) => set({ signInHint }),
      clear: () =>
        set({
          email: null,
          name: null,
          cpf: null,
          phone: null,
          signUpPending: false,
          passwordPending: false,
          signInHint: null,
        }),
    }),
    {
      name: "guara-auth-flow",
      storage: createJSONStorage(() => sessionStorage),
      // O CPF, o celular (e o aviso do "Entrar", que pode trazer o CPF) nunca vão para o storage
      // do navegador.
      partialize: ({ email, name, passwordPending }) => ({ email, name, passwordPending }),
    },
  ),
);
