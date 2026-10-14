import { AuthBackLink, AuthIntro, authShell } from "@/features/acesso/components/auth-parts";
import { CodeForm, type CodeState } from "@/features/acesso/components/code-form";
import { MataBanner, OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

const states: CodeState[] = ["digitando", "erro", "vencido"];

export default async function CodigoCriarPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const initialState = states.find((s) => s === estado) ?? "digitando";
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} {...authShell}>
      <AuthBackLink href="/boas-vindas" />
      <AuthIntro title="Confirme seu e-mail">
        Para criar sua conta, digite os 6 números que enviamos. O código vale por 10 minutos.
      </AuthIntro>
      <CodeForm key={initialState} mode="criar" initialState={initialState} />
    </OnboardingShell>
  );
}
