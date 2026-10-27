import { SessionGate } from "@/features/acesso/components/session-gate";

/** O onboarding é de quem já tem conta. */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <SessionGate area="onboarding">{children}</SessionGate>;
}
