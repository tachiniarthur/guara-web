import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { BankPicker } from "@/features/onboarding/components/bank-picker";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { bankAccess, onboardingSteps } from "@/features/onboarding/data";
import { cn } from "@/lib/utils";

export default function ConectarBancosPage() {
  return (
    <OnboardingShell
      zoom={1.37}
      mobileTop={<MobileHeader back="/boas-vindas" />}
      mobileActions={
        <MobileActionBar>
          <ButtonLink
            href="/onboarding/perfil/1"
            variant="ghost"
            size="xl"
            className="hover:bg-transparent"
          >
            <span>Pular</span>
          </ButtonLink>
          <div className="grow">
            <ButtonLink href="/onboarding/perfil/1" variant="primary" size="xl" block>
              <span>Continuar</span>
            </ButtonLink>
          </div>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={1} steps={onboardingSteps} />
      <OnboardingIntro title="Conecte seus bancos">
        Pelo Open Finance, via Malvo. Você autoriza no app do banco e revoga quando quiser.
      </OnboardingIntro>
      <div className="relative">
        <label htmlFor="buscar-banco" className="sr-only">
          Buscar banco
        </label>
        <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
          <Icon name="search" />
        </span>
        <TextInput
          id="buscar-banco"
          type="search"
          placeholder="Buscar banco ou corretora"
          className="pl-11"
        />
      </div>
      <BankPicker />
      <div className="flex flex-col gap-2.5 rounded-bubble bg-shade p-4">
        <strong className="text-14">O que o Guará acessa</strong>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {bankAccess.map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-14 text-mist">
              <span className={cn(item.allowed ? "text-folha" : "text-urucum")}>
                <Icon name={item.allowed ? "check" : "x"} size={16} strokeWidth={2.2} />
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <OnboardingActions>
        <ButtonLink
          href="/onboarding/perfil/1"
          variant="ghost"
          size="xl"
          className="hover:bg-transparent"
        >
          <span>Pular por agora</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href="/onboarding/perfil/1" variant="primary" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </OnboardingActions>
    </OnboardingShell>
  );
}
