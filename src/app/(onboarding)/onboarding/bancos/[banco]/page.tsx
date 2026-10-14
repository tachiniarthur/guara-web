import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { banks } from "@/features/onboarding/data";
import {
  MalvoConsentDetails,
  MalvoConsentHeader,
} from "@/features/onboarding/components/malvo-consent";
import { bankFromSlug, MalvoShell } from "@/features/onboarding/components/malvo-screens";

export function generateStaticParams() {
  return banks.map((bank) => ({ banco: bank.id }));
}

const period = [
  { label: "Vale por", value: "12 meses" },
  { label: "Até", value: "23/09/2027" },
  { label: "Finalidade", value: "Organizar gastos e investimentos" },
  { label: "Via", value: "Malvo · Open Finance Brasil" },
];

export default async function AutorizarBancoPage({
  params,
}: {
  params: Promise<{ banco: string }>;
}) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  const next = `/onboarding/bancos/${bank.id}/conectando`;
  const header = (
    <MalvoConsentHeader
      banco={bank}
      title={`Conectar ${bank.nome}`}
      subtitle="Pelo Open Finance, via Malvo"
      intro="Antes de abrir o app do banco, veja o que o Guará vai poder ler e por quanto tempo."
    />
  );
  const continueButton = (className?: string) => (
    <ButtonLink href={next} variant="primary" size="xl" className={className}>
      <Icon name="external-link" size={18} />
      <span>Continuar para o {bank.nome}</span>
    </ButtonLink>
  );
  return (
    <MalvoShell
      desktopWidth="lg:max-w-[72.5rem]"
      className="gap-4.5 md:gap-6.5 lg:gap-6"
      mobileActions={
        <>
          <ButtonLink href="/onboarding/bancos" variant="ghost" size="xl">
            <span>Cancelar</span>
          </ButtonLink>
          {continueButton("grow")}
        </>
      }
    >
      {header}
      <div className="contents lg:hidden">
        <MalvoConsentDetails banco={bank.nome} period={period} />
      </div>
      <div className="hidden lg:block">
        <MalvoConsentDetails banco={bank.nome} period={period} cards />
      </div>
      <div className="hidden items-center gap-2.5 md:flex">
        <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        {continueButton()}
      </div>
    </MalvoShell>
  );
}
