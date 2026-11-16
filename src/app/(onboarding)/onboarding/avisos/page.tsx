import { NoticesScreen } from "@/features/onboarding/components/notices-screen";

export default async function AvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ permissao?: string }>;
}) {
  // Notificações bloqueadas no aparelho ou no navegador (?permissao=bloqueada).
  const blocked = (await searchParams).permissao === "bloqueada";
  return <NoticesScreen blocked={blocked} />;
}
