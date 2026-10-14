import { redirect } from "next/navigation";

/** O questionário começa pela primeira pergunta. */
export default function PerfilInvestidorPage() {
  redirect("/onboarding/perfil/1");
}
