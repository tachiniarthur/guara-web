import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProfileLevels } from "@/features/alocacao/components/allocation-parts";
import {
  OnboardingActions,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { onboardingSteps, profileAnswers, profileEffects } from "@/features/onboarding/data";

export default function ResultadoPerfilPage() {
  return (
    <OnboardingShell
      zoom={1.19}
      desktopWidth="lg:max-w-[64rem]"
      tabletWidth="md:w-[40rem]"
      className="gap-5"
      mobileTop={<MobileHeader title="Perfil de investidor" back="/onboarding/perfil/6" balanced />}
      mobileActions={
        <MobileActionBar>
          <ButtonLink href="/onboarding/perfil/1" variant="secondary" size="xl">
            <span>Refazer</span>
          </ButtonLink>
          <ButtonLink href="/onboarding/assistentes" variant="light" size="xl" className="grow">
            <span>Continuar</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={3} steps={onboardingSteps} />
      <div className="grid grid-cols-1 gap-5 md:gap-6.5 lg:grid-cols-2 lg:items-start lg:gap-x-7 lg:gap-y-5.5">
        <div className="flex animate-fade-up flex-col gap-2.5 lg:col-span-2">
          <span className="text-13 text-caption">Resultado · 6 de 6 respondidas</span>
          <h1 className="m-0 font-display text-26 leading-[1.2] font-extrabold tracking-[-0.01em] md:text-30 lg:text-32">
            Seu perfil é <span className="text-tucano">Moderado</span>
          </h1>
          <p className="m-0 text-15 leading-[1.55] text-mist">
            Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte
            do dinheiro protegida. Seu prazo de 3 a 10 anos e a parte pequena que talvez precise
            resgatar combinam com uma carteira equilibrada.
          </p>
        </div>
        <div className="animate-fade-up [animation-delay:80ms] lg:col-span-2">
          <ProfileLevels />
        </div>
        <Panel className="animate-fade-up gap-3.5 p-4.5 [animation-delay:160ms] md:p-5.5 lg:p-6">
          <PanelHeader title="Suas respostas" titleClassName="text-16 tracking-normal md:text-18" />
          <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13">
            {profileAnswers.map((answer) => (
              <div key={answer.pergunta} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption">{answer.pergunta}</dt>
                <dd className="m-0 font-semibold text-sand">{answer.resposta}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel className="animate-fade-up gap-3.5 p-4.5 [animation-delay:240ms] md:p-5.5 lg:p-6">
          <PanelHeader
            title="O que o perfil muda no app"
            titleClassName="text-18 tracking-normal"
          />
          <ul className="m-0 flex list-none flex-col p-0">
            {profileEffects.map((effect, i) => (
              <li
                key={effect.titulo}
                className={`flex items-center gap-3 py-3 ${i < profileEffects.length - 1 ? "border-b border-line" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
                >
                  <Icon name={effect.icon} />
                </span>
                <span className="flex min-w-0 grow flex-col leading-[1.35]">
                  <span className="font-medium">{effect.titulo}</span>
                  <span className="text-12 text-caption">{effect.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <p className="m-0 text-13 leading-[1.55] text-caption lg:col-span-2">
          O perfil vale só para Investimentos. Você pode refazer quando quiser em Meu perfil.
        </p>
      </div>
      <OnboardingActions>
        <ButtonLink href="/onboarding/perfil/1" variant="secondary" size="xl">
          <span>Refazer</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href="/onboarding/assistentes" variant="light" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </OnboardingActions>
    </OnboardingShell>
  );
}
