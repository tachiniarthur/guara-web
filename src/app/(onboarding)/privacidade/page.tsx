import { LegalPage } from "@/features/acesso/components/legal-page";
import { privacyPolicy } from "@/features/acesso/data";

export default function PrivacidadePage() {
  return <LegalPage doc={privacyPolicy} />;
}
