import { LegalPage } from "@/features/acesso/components/legal-page";
import { termsOfUse } from "@/features/acesso/data";

export default function TermosPage() {
  return <LegalPage doc={termsOfUse} />;
}
