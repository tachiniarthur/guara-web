import { MobileHeader } from "@/components/layout/mobile-header";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { ButtonLink } from "@/components/ui/button";
import { CheckboxRow, Legend, MobileActionBar } from "@/components/ui/form";
import {
  OnboardingActions,
  OnboardingIntro,
  OnboardingShell,
  OnboardingSteps,
} from "@/features/onboarding/components/onboarding-shell";
import { agents } from "@/features/assistentes/data";
import { NotificationPermissionAlert } from "@/features/onboarding/components/permission-alert";
import { agentIntros, onboardingSteps } from "@/features/onboarding/data";

export default async function AssistentesAvisosPage({
  searchParams,
}: {
  searchParams: Promise<{ permissao?: string }>;
}) {
  // Notificações bloqueadas no aparelho ou no navegador (?permissao=bloqueada).
  const blocked = (await searchParams).permissao === "bloqueada";
  return (
    <OnboardingShell
      zoom={blocked ? 1.24 : 1.52}
      mobileTop={<MobileHeader back="/onboarding/perfil/resultado" />}
      mobileActions={
        <MobileActionBar>
          <ButtonLink href="/" variant="primary" size="xl" block>
            <span>Ir para o painel</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <OnboardingSteps current={3} steps={onboardingSteps} />
      <OnboardingIntro title="Conheça seus assistentes">
        Você não precisa escolher nada: é só perguntar que a Capivara chama o assistente certo. Para
        falar com um específico, digite @ no chat.
      </OnboardingIntro>
      <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-2.5 md:grid-cols-2">
        {agentIntros.map((intro) => (
          <div
            key={intro.id}
            className="flex h-full items-start gap-3.5 rounded-bubble border border-line bg-field p-4"
          >
            <AgentAvatar agent={intro.id} size={46} variant="ring" />
            <div className="flex min-w-0 flex-col gap-0.5 leading-[1.4]">
              <strong className="text-15">{agents[intro.id].nome}</strong>
              <span className="text-14 text-mist">{intro.texto}</span>
            </div>
          </div>
        ))}
      </div>
      <fieldset className="m-0 flex flex-col border-none p-0">
        <Legend className="mb-1.5 text-16">Como quer ser avisado?</Legend>
        {blocked && <NotificationPermissionAlert />}
        <CheckboxRow
          id="aviso-celular"
          label="Notificação no celular"
          description="Tetos, alertas de preço e compras fora do padrão"
          defaultChecked={!blocked}
          disabled={blocked}
        />
        <CheckboxRow
          id="aviso-email"
          label="E-mail"
          description="Os mesmos avisos, na sua caixa de entrada"
          defaultChecked
        />
      </fieldset>
      <OnboardingActions>
        <ButtonLink href="/onboarding/perfil/resultado" variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href="/" variant="primary" size="xl">
          <span>Ir para o painel</span>
        </ButtonLink>
      </OnboardingActions>
    </OnboardingShell>
  );
}
