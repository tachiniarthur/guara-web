import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListFilter } from "@/components/ui/list-filter";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { DeviceNotificationsAlert } from "@/features/notificacoes/components/device-notifications-alert";
import {
  NotificationGroupTitle,
  NotificationList,
} from "@/features/notificacoes/components/notification-list";
import {
  notificationChannels,
  notifications,
  notificationsThisMonth,
} from "@/features/notificacoes/data";

const filters = ["Todas", "Gastos", "Investimentos", "Conta"];

function ChannelsPanel() {
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title="Como você recebe os avisos"
        subtitle="Cada aviso de teto chega uma vez por mês"
        titleClassName="text-18 tracking-normal"
      />
      <DetailList items={notificationChannels} />
      <Link href="/perfil" className={panelLinkClass}>
        Mudar em Meu perfil
        <Icon name="chevron-right" size={16} />
      </Link>
    </Panel>
  );
}

/** Avisos do app (e o caso de notificações desligadas no aparelho: ?aparelho=desligado). */
export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aparelho?: string }>;
}) {
  const disabled = (await searchParams).aparelho === "desligado";
  const fresh = notifications.filter((n) => n.nova);
  const older = notifications.filter((n) => !n.nova);
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
      <DetailHeader title="Notificações" subtitle={`${fresh.length} novas`} actions={markAll} />
      {disabled && <DeviceNotificationsAlert />}
      <ListFilter
        options={filters}
        label="Filtrar notificações"
        className="-mr-4 overflow-hidden @tab:mr-0 @tab:flex-wrap"
      />
      <NotificationGroupTitle>{`Novas · ${fresh.length}`}</NotificationGroupTitle>

      <div className="contents @desk:hidden">
        <NotificationList items={fresh} />
        <NotificationGroupTitle className="mt-2">Anteriores</NotificationGroupTitle>
        <NotificationList items={older} />
        <ChannelsPanel />
      </div>

      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-3">
          <NotificationList items={fresh} />
          <NotificationGroupTitle>Anteriores</NotificationGroupTitle>
          <NotificationList items={older} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <ChannelsPanel />
          <Panel className="grow gap-3.5 p-5.5">
            <PanelHeader
              title="Neste mês"
              subtitle="Avisos enviados em setembro"
              titleClassName="text-18 tracking-normal"
            />
            <DetailList items={notificationsThisMonth} />
          </Panel>
        </div>
      </div>
    </Page>
  );
}
