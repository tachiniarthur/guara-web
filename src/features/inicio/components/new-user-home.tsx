import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { MataCard } from "@/features/gastos/components/teto-cards";
import {
  EmptyStatTiles,
  NewUserHeader,
  PreviewListPanel,
  RowIcon,
} from "@/features/novo/components";
import { user } from "@/features/usuario/data";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: "bank",
    titulo: "Conectar seu primeiro banco",
    texto: "Saldo e gastos chegam sozinhos",
    href: "/onboarding/bancos",
  },
  {
    icon: "user",
    titulo: "Responder o perfil de investidor",
    texto: "6 perguntas, 2 minutos",
    href: "/perfil/investidor",
  },
  {
    icon: "target",
    titulo: "Criar um teto de gasto",
    texto: "Depois de conectar um banco",
    href: "/alertas/novo-teto",
  },
] as const;

function ConnectHero({ block }: { block?: boolean }) {
  const button = (
    <ButtonLink href="/onboarding/bancos" variant="primary" size="lg" block={block}>
      <Icon name="plus" size={18} />
      <span>Conectar banco</span>
    </ButtonLink>
  );
  return (
    <MataCard>
      <span className="text-14 text-[#C5D8CB]">Saldo em 0 bancos</span>
      <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        —
      </span>
      <span className="text-14 text-[#E4EEE6]">
        Conecte um banco para ver saldo, entradas e saídas do mês.
      </span>
      {block ? button : <div className="flex items-center gap-2.5">{button}</div>}
    </MataCard>
  );
}

function FirstSteps({ className }: { className?: string }) {
  return (
    <Panel className={cn("p-4.5", className)}>
      <PanelHeader
        title="Primeiros passos"
        subtitle="1 de 4 concluído"
        titleClassName="text-18 tracking-normal"
      />
      <div aria-hidden="true" className="relative h-2 rounded-[4px] bg-shade">
        <div className="h-2 w-1/4 rounded-[4px] bg-tucano" />
      </div>
      <RowList>
        {steps.map((step) => (
          <ListRow
            key={step.titulo}
            href={step.href}
            title={step.titulo}
            meta={step.texto}
            leading={<RowIcon icon={step.icon} tone="tucano" />}
            trailing={
              <span aria-hidden="true" className="text-caption">
                <Icon name="chevron-right" size={18} />
              </span>
            }
          />
        ))}
        <ListRow
          href="/assistentes"
          title="Conhecer os assistentes"
          meta="Feito"
          leading={
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-folha-bg text-folha"
            >
              <Icon name="check" size={18} strokeWidth={2.4} />
            </span>
          }
        />
      </RowList>
    </Panel>
  );
}

const tip = (
  <AgentTip
    agent="capivara"
    named
    action={
      <ButtonLink href="/investimentos/novo" variant="secondary" size="sm">
        <span>Cadastrar investimento</span>
      </ButtonLink>
    }
  >
    Oi, {user.nome}! Enquanto você não conecta um banco, dá para cadastrar investimentos à mão ou
    testar o simulador com números seus.
  </AgentTip>
);

const later = [
  { icon: "trending-up", titulo: "Ritmo do mês e previsão de fechamento" },
  { icon: "target", titulo: "Tetos de gasto e avisos" },
  { icon: "repeat-alt", titulo: "Assinaturas detectadas" },
] as const;

const emptyCards = [
  {
    icon: "target",
    titulo: "Tetos de gasto",
    texto:
      "Depois de conectar, crie um teto por categoria e receba avisos antes de passar do limite.",
  },
  {
    icon: "repeat-alt",
    titulo: "Assinaturas",
    texto: "Detectadas sozinhas a partir dos lançamentos recorrentes.",
  },
  {
    icon: "trending-up",
    titulo: "Ritmo do mês",
    texto: "Gasto acumulado comparado com a sua média, dia a dia.",
  },
] as const;

/** Início de quem ainda não conectou nenhum banco (`/?estado=novo`). */
export function NewUserHome() {
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<NewUserHeader title="guará" />}
    >
      <h1 className="m-0 font-display text-28 font-extrabold @tab:hidden">
        Boa tarde, {user.nome}.
      </h1>
      <DetailHeader title={`Boa tarde, ${user.nome}.`} subtitle="Terça, 23 de setembro" />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <ConnectHero block />
        <FirstSteps />
        {tip}
        <PreviewListPanel title="O que aparece depois de conectar" items={later} />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <div className="grid grid-cols-2 items-stretch gap-4">
          <ConnectHero />
          {tip}
        </div>
        <div className="grid grid-cols-2 items-stretch gap-4">
          <FirstSteps />
          <PreviewListPanel title="O que aparece depois de conectar" items={later} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <EmptyStatTiles
          items={[
            { label: "Saldo consolidado", hint: "conecte um banco" },
            { label: "Entradas do mês", hint: "sem lançamentos" },
            { label: "Saídas do mês", hint: "sem lançamentos" },
            { label: "Previsão de fechamento", hint: "precisa de 1 mês de dados" },
          ]}
        />
        <div className="grid grid-cols-3 items-stretch gap-5">
          <ConnectHero />
          <FirstSteps />
          {tip}
        </div>
        <div className="grid grid-cols-3 items-stretch gap-5">
          {emptyCards.map((card) => (
            <Panel key={card.titulo} className="justify-center p-5.5">
              <div className="flex flex-col items-center gap-2.5 px-2 py-3 text-center">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
                >
                  <Icon name={card.icon} size={20} />
                </span>
                <strong className="font-display text-18 font-bold">{card.titulo}</strong>
                <p className="m-0 text-14 leading-[1.55] text-mist">{card.texto}</p>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </Page>
  );
}
