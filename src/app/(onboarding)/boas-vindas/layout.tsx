import { SessionGate } from "@/features/acesso/components/session-gate";

/** Quem já entrou não volta para a entrada. */
export default function EntradaLayout({ children }: { children: React.ReactNode }) {
  return <SessionGate area="entrada">{children}</SessionGate>;
}
