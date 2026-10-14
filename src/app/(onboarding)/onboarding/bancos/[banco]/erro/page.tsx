import { ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { banks } from "@/features/onboarding/data";
import {
  bankFromSlug,
  MalvoShell,
  ResultIcon,
  StatusNote,
  SupportLink,
} from "@/features/onboarding/components/malvo-screens";

export function generateStaticParams() {
  return banks.map((bank) => ({ banco: bank.id }));
}

export default async function ErroBancoPage({ params }: { params: Promise<{ banco: string }> }) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  const retry = `/onboarding/bancos/${bank.id}`;
  const reasons: { icon: IconName; titulo: string; texto: string }[] = [
    {
      icon: "x",
      titulo: `Você tocou em “Cancelar” no app do ${bank.nome}`,
      texto: "Nada foi compartilhado. É só tentar de novo quando quiser.",
    },
    {
      icon: "wifi-off",
      titulo: `O ${bank.nome} não respondeu a tempo`,
      texto: "Acontece quando o banco está instável. Tente em alguns minutos.",
    },
  ];
  return (
    <MalvoShell
      desktopWidth="lg:max-w-[40rem]"
      className="min-h-[49.5rem] justify-center gap-4 md:min-h-0 md:gap-6.5 lg:gap-6"
      mobileActions={
        <>
          <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
            <span>Outro banco</span>
          </ButtonLink>
          <ButtonLink href={retry} variant="primary" size="xl" className="grow">
            <Icon name="retry" size={18} />
            <span>Tentar de novo</span>
          </ButtonLink>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <ResultIcon tone="urucum" icon="alert-triangle" />
        <h1 className="m-0 font-display text-26 font-extrabold">
          Não deu para conectar o {bank.nome}
        </h1>
        <p className="m-0 text-15 leading-[1.55] text-mist">
          A autorização foi cancelada no app do banco. Nenhum dado foi compartilhado e nada mudou na
          sua conta.
        </p>
      </div>
      <Panel className="gap-3.5 p-4.5">
        <PanelHeader title="O que pode ter acontecido" titleClassName="text-17 tracking-normal" />
        <ul className="m-0 flex list-none flex-col p-0">
          {reasons.map((reason, i) => (
            <li
              key={reason.titulo}
              className={`flex items-center gap-3 py-3 ${i === 0 ? "border-b border-line" : ""}`}
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
              >
                <Icon name={reason.icon} />
              </span>
              <span className="flex min-w-0 grow flex-col leading-[1.35]">
                <span className="font-medium">{reason.titulo}</span>
                <span className="text-12 text-caption">{reason.texto}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <StatusNote tone="neutral" icon="info-lg">
        Código para o suporte: MLV-401 · 23/09/2026 14:32
      </StatusNote>
      <SupportLink />
      <div className="hidden items-center gap-2.5 md:flex">
        <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
          <span>Escolher outro banco</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href={retry} variant="primary" size="xl">
          <span>Tentar de novo</span>
        </ButtonLink>
      </div>
    </MalvoShell>
  );
}
