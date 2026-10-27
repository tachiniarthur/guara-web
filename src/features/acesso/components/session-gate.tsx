"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSession, type SessionStatus } from "../session";

type Area = "app" | "entrada" | "onboarding";

/** Para onde mandar quem está na área errada; `null` se pode ficar. */
export function redirectFor(area: Area, status: SessionStatus): string | null {
  if (status === "loading") return null;
  if (area === "app") {
    if (status === "signedOut") return "/boas-vindas";
    if (status === "onboarding") return "/onboarding/plano";
    return null;
  }
  if (area === "entrada") {
    if (status === "signedIn") return "/";
    if (status === "onboarding") return "/onboarding/plano";
    return null;
  }
  return status === "signedOut" ? "/boas-vindas" : null;
}

/**
 * Porteiro de cada área (app, entrada e onboarding), com login de verdade. No protótipo (sem API
 * e Supabase) não faz nada: todas as telas abrem com os dados de exemplo.
 */
export function SessionGate({ area, children }: { area: Area; children: ReactNode }) {
  const { status, live } = useSession();
  const router = useRouter();
  const target = live ? redirectFor(area, status) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (!live) return children;
  if (status === "loading" || target) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center text-14 text-mist">
        Carregando…
      </div>
    );
  }
  return children;
}
