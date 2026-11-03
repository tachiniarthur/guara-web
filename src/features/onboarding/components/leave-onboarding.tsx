"use client";

import { useRouter } from "next/navigation";

import { AuthBackButton } from "@/features/acesso/components/auth-parts";
import { useSession } from "@/features/acesso/session";

/**
 * Volta para a escolha de como entrar. Antes do plano só existe a entrada (o CPF, quando pedido,
 * já está salvo), então a sessão recém-aberta é fechada.
 */
export function useLeaveOnboarding() {
  const router = useRouter();
  const { live, signOut } = useSession();
  return async () => {
    if (live) await signOut();
    router.replace("/boas-vindas");
  };
}

export function LeaveOnboardingLink({ className }: { className?: string }) {
  const leave = useLeaveOnboarding();
  return <AuthBackButton onClick={() => void leave()} className={className} />;
}
