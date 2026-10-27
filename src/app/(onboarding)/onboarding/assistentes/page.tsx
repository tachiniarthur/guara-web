import { AgentsScreen } from "@/features/onboarding/components/agents-screen";

export default async function AssistentesAvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ permissao?: string }>;
}) {
  // Notificações bloqueadas no aparelho ou no navegador (?permissao=bloqueada).
  const blocked = (await searchParams).permissao === "bloqueada";
  return <AgentsScreen blocked={blocked} />;
}
