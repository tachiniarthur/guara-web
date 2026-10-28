"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { env, isLive } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { fetchMyPlan } from "@/features/perfil/api";

/** `onboarding`: tem conta, mas ainda não tem plano (todo plano é pago). */
export type SessionStatus = "loading" | "signedOut" | "onboarding" | "signedIn";

type SessionValue = {
  status: SessionStatus;
  /** `false` no protótipo (sem API e Supabase): sem login, com os dados de exemplo. */
  live: boolean;
  /** Lê de novo a sessão e o plano (depois de entrar ou de escolher o plano). */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

/** Área da sessão salva: sem sessão, entrada; sem plano, onboarding; com plano, o app. */
async function resolveStatus(): Promise<Exclude<SessionStatus, "loading">> {
  const { data } = await getSupabase().auth.getSession();
  if (!data.session) return "signedOut";
  try {
    return (await fetchMyPlan()).plan ? "signedIn" : "onboarding";
  } catch {
    // API dormindo ou fora do ar: entra; cada tela mostra o próprio erro.
    return "signedIn";
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>(isLive ? "loading" : "signedIn");

  const refresh = async () => setStatus(await resolveStatus());

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
