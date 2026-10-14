import type { ReactNode } from "react";

import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconName } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";

import { EmptyStatTiles, NewUserHeader, PreviewListPanel } from "./components";

/**
 * Molde das telas sem dados de quem ainda não conectou banco: estado vazio com o próximo passo,
 * cards de apoio e, no desktop, quatro números em "—".
 */
function EmptyScreen({
  title,
  subtitle,
  stats,
  empty,
  side,
  sideGridOnTablet,
}: {
  title: string;
  subtitle: string;
  stats: { label: string; hint: string }[];
  empty: { icon: IconName; title: string; message: string; actions: ReactNode };
  side: ReactNode[];
  /** No tablet, os cards de apoio ficam lado a lado. */
  sideGridOnTablet?: boolean;
}) {
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<NewUserHeader title={title} />}
    >
      <DetailHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
        <EmptyState icon={empty.icon} title={empty.title} actions={empty.actions}>
          {empty.message}
        </EmptyState>
        {sideGridOnTablet ? (
          <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
            {side}
          </div>
        ) : (
          side
        )}
      </div>
      <div className="hidden flex-col gap-6 @desk:flex">
        <EmptyStatTiles items={stats} />
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch gap-5">
          <EmptyState icon={empty.icon} title={empty.title} actions={empty.actions} large>
            {empty.message}
          </EmptyState>
          <div className="flex min-w-0 flex-col gap-4 [&>*:last-child]:grow">{side}</div>
        </div>
      </div>
    </Page>
  );
}

export function NewUserSpending() {
  return (
    <EmptyScreen
      title="Gastos"
      subtitle="Nenhum banco conectado"
      stats={[
        { label: "Saídas do mês", hint: "sem lançamentos" },
        { label: "Entradas do mês", hint: "sem lançamentos" },
        { label: "Lançamentos", hint: "nenhum ainda" },
        { label: "Assinaturas detectadas", hint: "nenhuma ainda" },
      ]}
      empty={{
        icon: "wallet",
        title: "Seus gastos aparecem aqui",
        message:
          "Conecte um banco e o Guará organiza cada lançamento em categorias, mostra o ritmo do mês e avisa antes de passar do teto.",
        actions: (
          <ButtonLink href="/onboarding/bancos" variant="forest" className="text-15">
            <Icon name="plus" size={18} />
            <span>Conectar banco</span>
          </ButtonLink>
        ),
      }}
      side={[
        <AgentTip key="tip" agent="tamandua" named>
          Assim que os dados chegarem, eu farejo para onde foi cada real e conto sem julgar.
        </AgentTip>,
        <PreviewListPanel
          key="exemplo"
          title="Exemplo do que você vai ver"
          items={[
            {
              icon: "tag",
              titulo: "Alimentação",
              texto: "mercado, restaurantes e delivery",
              valor: "—",
            },
            {
              icon: "car-front",
              titulo: "Transporte",
              texto: "app, combustível e ônibus",
              valor: "—",
            },
            { icon: "repeat-alt", titulo: "Assinaturas", texto: "detectadas sozinhas", valor: "—" },
          ]}
          note="Valores aparecem depois da primeira sincronização."
        />,
      ]}
    />
  );
}

function InfoPanel({
  title,
  subtitle,
  text,
  action,
}: {
  title: string;
  subtitle: string;
  text: string;
  action: ReactNode;
}) {
  return (
    <Panel className="p-4.5">
      <PanelHeader title={title} subtitle={subtitle} titleClassName="text-17 tracking-normal" />
      <p className="m-0 text-14 leading-[1.55] text-mist">{text}</p>
      {action}
    </Panel>
  );
}

export function NewUserInvestments() {
  return (
    <EmptyScreen
      title="Investimentos"
      subtitle="Nenhuma posição ainda"
      sideGridOnTablet
      stats={[
        { label: "Patrimônio investido", hint: "nenhuma posição" },
        { label: "Rentabilidade no ano", hint: "sem histórico" },
        { label: "Proventos no ano", hint: "sem histórico" },
        { label: "Patrimônio total com bens", hint: "nenhum bem cadastrado" },
      ]}
      empty={{
        icon: "trending-up",
        title: "Sua carteira começa aqui",
        message:
          "Conecte banco ou corretora para trazer suas posições sozinhas, ou cadastre à mão o que não vem pelo Open Finance (ações, FIIs, cripto, imóveis e veículos).",
        actions: (
          <>
            <ButtonLink href="/onboarding/bancos" variant="primary" className="text-15">
              <span>Conectar banco</span>
            </ButtonLink>
            <ButtonLink href="/investimentos/novo" variant="secondary" className="text-15">
              <Icon name="plus" size={18} />
              <span>Cadastrar à mão</span>
            </ButtonLink>
          </>
        ),
      }}
      side={[
        <InfoPanel
          key="perfil"
          title="Perfil de investidor"
          subtitle="Ainda não respondido"
          text="Com o perfil, o Guará compara sua carteira com uma divisão-alvo e o Pacu sugere ajustes."
          action={
            <ButtonLink href="/perfil/investidor" variant="secondary" block className="text-15">
              <span>Responder agora · 2 minutos</span>
            </ButtonLink>
          }
        />,
        <InfoPanel
          key="alertas"
          title="Alertas de preço"
          subtitle="Funcionam mesmo sem carteira"
          text="Escolha qualquer ação, FII ou cripto e o Caramelo avisa quando chegar no preço."
          action={
            <ButtonLink href="/alertas/novo-preco" variant="secondary" block className="text-15">
              <Icon name="plus" size={18} />
              <span>Criar alerta de preço</span>
            </ButtonLink>
          }
        />,
      ]}
    />
  );
}
