"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { useAuthFlow } from "@/stores/auth-flow";

import { useSession, type SessionStatus } from "../session";

type Area = "app" | "entrada" | "onboarding";

/** Para onde mandar quem está na área errada; `null` se pode ficar. */
export function redirectFor(
  area: Area,
  status: SessionStatus,
  {
    passwordPending = false,
    signUpPending = false,
  }: { passwordPending?: boolean; signUpPending?: boolean } = {},
): string | null {
  if (status === "loading" || status === "unavailable") return null;
  if (area === "app") {
    if (status === "signedOut") return "/boas-vindas";
    if (status === "onboarding") return "/onboarding/cpf";
    return null;
  }
  if (area === "entrada") {
    // Depois do código do "Esqueci minha senha" a conta está aberta, mas a senha nova vem antes.
    // Depois do código do cadastro, espera o nome, o CPF e o celular chegarem à conta: sem isso o
    // onboarding abria antes e pedia o CPF de novo.
    if (passwordPending || signUpPending) return null;
    if (status === "signedIn") return "/";
    if (status === "onboarding") return "/onboarding/cpf";
    return null;
  }
  return status === "signedOut" ? "/boas-vindas" : null;
}

/**
 * Porteiro de cada área (app, entrada e onboarding), com login de verdade. No protótipo (sem API
 * e Supabase) não faz nada: todas as telas abrem com os dados de exemplo.
 */
export function SessionGate({ area, children }: { area: Area; children: ReactNode }) {
  const { status, live, refresh } = useSession();
  const router = useRouter();
  const passwordPending = useAuthFlow((state) => state.passwordPending);
  const signUpPending = useAuthFlow((state) => state.signUpPending);
  const target = live ? redirectFor(area, status, { passwordPending, signUpPending }) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (!live) return children;
  if (status === "unavailable") {
    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <p className="m-0 max-w-[26rem] text-15 leading-normal text-mist">
          Não conseguimos falar com o Guará agora. Sua conta está salva; tente de novo em instantes.
        </p>
        <Button variant="primary" onClick={() => void refresh({ showLoading: true })}>
          <span>Tentar de novo</span>
        </Button>
      </div>
    );
  }
  if (status === "loading" || target) {
    return (
      <div
        role="status"
        className="flex min-h-dvh flex-col items-center justify-center gap-1.5 px-6 text-center"
      >
        <span className="text-15 text-sand">Preparando sua conta…</span>
        <span className="text-13 text-caption">Pode levar alguns segundos.</span>
      </div>
    );
  }
  return children;
}
