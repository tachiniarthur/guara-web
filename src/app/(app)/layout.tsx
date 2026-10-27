import { AppShell } from "@/components/layout/app-shell";
import { SessionGate } from "@/features/acesso/components/session-gate";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SessionGate area="app">
      <AppShell>{children}</AppShell>
    </SessionGate>
  );
}
