"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { env, isLive } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { fetchMyPlan } from "@/features/perfil/api";
import { ApiError } from "@/lib/api";

/**
 * `onboarding`: tem conta, mas ainda não tem plano (todo plano é pago). `unavailable`: tem
 * sessão, mas a API não respondeu nem depois de esperar (não dá para saber se tem plano).
 */
export type SessionStatus = "loading" | "signedOut" | "onboarding" | "signedIn" | "unavailable";

type SessionValue = {
  status: SessionStatus;
  /** `false` no protótipo (sem API e Supabase): sem login, com os dados de exemplo. */
  live: boolean;
  /**
   * Lê de novo a sessão e o plano (depois de entrar ou de escolher o plano). `showLoading` volta
   * para "Preparando sua conta…" enquanto lê (o "Tentar de novo").
   */
  refresh: (options?: { showLoading?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Esperas entre as tentativas de ler o plano: a API de teste dorme quando fica parada e leva
 * até ~50 s para acordar. Somam ~1 min antes de desistir.
 */
const RETRY_WAITS = [2_000, 4_000, 8_000, 12_000, 16_000, 18_000];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** O plano, tentando de novo enquanto a API acorda. Sessão recusada (401) não repete. */
async function fetchPlanPatiently() {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchMyPlan();
    } catch (error) {
      const wait = RETRY_WAITS[attempt];
      if ((error instanceof ApiError && error.code === "unauthorized") || wait === undefined) {
        throw error;
      }
      await sleep(wait);
    }
  }
}

/**
 * Área da sessão salva: sem sessão, entrada; sem plano, onboarding; com plano, o app. Se a API
 * não responder, nunca abre o app no escuro (uma conta nova cairia direto nele, sem plano).
 */
async function resolveStatus(): Promise<Exclude<SessionStatus, "loading">> {
  const { data } = await getSupabase().auth.getSession();
  if (!data.session) return "signedOut";
  try {
    return (await fetchPlanPatiently()).plan ? "signedIn" : "onboarding";
  } catch (error) {
    if (error instanceof ApiError && error.code === "unauthorized") {
      await getSupabase().auth.signOut();
      return "signedOut";
    }
    return "unavailable";
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(isLive ? "loading" : "signedIn");

  const refresh = async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (showLoading) setStatus("loading");
    setStatus(await resolveStatus());
  };

  useEffect(() => {
    if (!isLive) return;
    // A API de teste dorme quando fica parada: o primeiro pedido já a acorda, enquanto a pessoa
    // ainda lê a tela (assinar o plano e conectar banco ficam rápidos).
    void fetch(`${env.apiUrl}/health`).catch(() => undefined);
    let active = true;
    const update = () =>
      void resolveStatus().then((next) => {
        if (active) setStatus(next);
      });
    update();
    // Fora do callback: o Supabase pede para não chamar o client dentro do onAuthStateChange.
    const { data } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setStatus("signedOut");
      if (event === "SIGNED_IN") setTimeout(update, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value: SessionValue = {
    status,
    live: isLive,
    refresh,
    signOut: async () => {
      if (isLive) await getSupabase().auth.signOut();
      setStatus("signedOut");
    },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession fora do <SessionProvider>");
  return value;
}
