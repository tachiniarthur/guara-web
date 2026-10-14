import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  donutSizes,
  GroupDetailsList,
  ProfileLevels,
  TargetDonutWithList,
} from "@/features/alocacao/components/allocation-parts";
import {
  OnboardingActions,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { onboardingSteps, profileAnswers, profileEffects } from "@/features/onboarding/data";

function OffTargetNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-tucano-bg px-3.5 py-3 text-13 leading-normal text-sand">
      <span className="mt-px text-tucano">
        <Icon name="alert-triangle" size={16} />
      </span>
      <span>
        Sua carteira está fora do alvo em 3 de 5 grupos: <strong>Renda variável Brasil</strong> 17,2
        p.p. acima, <strong>Renda fixa internacional</strong> 14 p.p. abaixo e{" "}
        <strong>Renda variável internacional</strong> 6,1 p.p. abaixo. O Pacu pode sugerir como
        ajustar, mas nada muda sem você.
      </span>
    </div>
  );
}

const compareLink =
  "inline-flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline hover:text-tucano";

export default function ResultadoPerfilPage() {
  return (
    <OnboardingShell
      zoom={1.19}
      desktopWidth="lg:max-w-[77.5rem]"
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
      <OnboardingSteps current={2} steps={onboardingSteps} />
      <div className="grid grid-cols-1 gap-5 md:gap-6.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-7 lg:gap-y-5.5">
        <div className="flex flex-col gap-2.5">
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
        <ProfileLevels />
        <Panel className="gap-3.5 p-4.5 md:p-5.5 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:p-6">
          <PanelHeader
            title="Como o Guará vai dividir as sugestões"
            subtitle="Carteira-alvo do perfil Moderado em 5 grupos · toque num grupo para ver as subclasses · a marca branca é a sua carteira hoje"
            titleClassName="text-18 tracking-normal md:text-20 md:tracking-[-0.01em]"
          />
          <div className="lg:hidden">
            <TargetDonutWithList dims={donutSizes.result} />
          </div>
          <div className="hidden lg:block">
            <TargetDonutWithList dims={donutSizes.lg} />
          </div>
          <div className="lg:hidden">
            <GroupDetailsList layout="compact" openGroup="rv-br" />
          </div>
          <div className="hidden lg:block">
            <GroupDetailsList layout="wide" />
          </div>
          <OffTargetNote />
          <div className="flex justify-end">
            <Link href="/investimentos/alocacao/perfis" className={compareLink}>
              Comparar os 4 perfis
              <Icon name="chevron-right" size={16} />
            </Link>
          </div>
        </Panel>
        <Panel className="gap-3.5 p-4.5 md:p-5.5 lg:p-6">
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
        <Panel className="hidden gap-3.5 p-6 lg:flex">
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
        <p className="m-0 text-13 leading-[1.55] text-caption">
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
