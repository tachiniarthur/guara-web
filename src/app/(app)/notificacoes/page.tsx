import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { OFFLINE_NOTE, parseScreenState, type ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { ErrorBlock, NoDataBlock, StateSwap } from "@/components/states/state-block";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { DeviceNotificationsAlert } from "@/features/notificacoes/components/device-notifications-alert";
import { NotificationsFeed } from "@/features/notificacoes/components/notifications-feed";
import {
  notificationChannels,
  notifications,
  notificationsThisMonth,
} from "@/features/notificacoes/data";

type Props = { state: ScreenState | null };

const offlineNote = (state: ScreenState | null, text: string) =>
  state === "sem-internet" ? <span className="text-tucano">{OFFLINE_NOTE}</span> : text;

function ChannelsPanel({ state }: Props) {
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title="Como você recebe os avisos"
        subtitle={offlineNote(state, "Cada aviso de teto chega uma vez por mês")}
        titleClassName="text-18 tracking-normal"
      />
      <StateSwap replacement={state === "erro" && <ErrorBlock />} className="grow gap-3.5">
        <DetailList items={notificationChannels} />
        <Link href="/perfil" className={panelLinkClass}>
          Mudar em Meu perfil
          <Icon name="chevron-right" size={16} />
        </Link>
      </StateSwap>
    </Panel>
  );
}

function MonthPanel({ state }: Props) {
  return (
    <Panel className="grow gap-3.5 p-5.5">
      <PanelHeader
        title="Neste mês"
        subtitle={offlineNote(state, "Avisos enviados em setembro")}
        titleClassName="text-18 tracking-normal"
      />
      <StateSwap
        replacement={state === "erro" ? <ErrorBlock /> : state === "vazio" && <NoDataBlock />}
        className="grow"
      >
        <DetailList items={notificationsThisMonth} />
      </StateSwap>
    </Panel>
  );
}

/** Avisos do app (e o caso de notificações desligadas no aparelho: ?aparelho=desligado). */
export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aparelho?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const disabled = params.aparelho === "desligado";
  const state = parseScreenState(params.estado);
  const fresh = notifications.filter((n) => n.nova);
  const markAll = (
    <Button variant="secondary" size="sm">
      <Icon name="check" size={18} />
      <span>Marcar todas como lidas</span>
    </Button>
  );

  return (
    <Page
      padding="detail"
      zoom={disabled ? undefined : 1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Notificações"
          back="/"
          balanced
          actions={<IconButton icon="check" label="Marcar todas como lidas" variant="ghost" />}
        />
      }
    >
      {state === "carregando" && <LoadingStatus />}
      <DetailHeader title="Notificações" subtitle={`${fresh.length} novas`} actions={markAll} />
      {disabled && <DeviceNotificationsAlert />}
      <Skeleton active={state === "carregando"}>
        <NotificationsFeed
          state={state}
          channels={<ChannelsPanel state={state} />}
          month={<MonthPanel state={state} />}
        />
      </Skeleton>
    </Page>
  );
}
