import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { inlineLinkClass } from "@/components/ui/text-link";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { AlertHistoryList } from "@/features/alertas/components/alert-history-list";
import { PriceAlertList } from "@/features/alertas/components/price-alert-list";
import { alertHistory, priceAlerts } from "@/features/alertas/data";
import { TetoMeter } from "@/features/gastos/components/teto-meter";
import { tetos } from "@/features/gastos/data";

function NewTetoLink({ className }: { className?: string }) {
  return (
    <ButtonLink href="/alertas/novo-teto" size="md" className={className}>
      <Icon name="plus" size={18} />
      <span>Novo teto</span>
    </ButtonLink>
  );
}

function NewPriceAlertLink({
  label,
  variant = "primary",
  className,
}: {
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <ButtonLink href="/alertas/novo-preco" variant={variant} size="md" className={className}>
      <Icon name="plus" size={18} />
      <span>{label}</span>
    </ButtonLink>
  );
}

export default function AlertasPage() {
  return (
    <Page
      padding="list"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Alertas" back="/" />}
    >
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Alertas
          </h1>
          <p className="m-0 text-15 text-mist">
            <span className="@desk:hidden">3 tetos e 3 alertas de preço</span>
            <span className="hidden @desk:inline">
              3 tetos de gasto e 3 alertas de preço ativos
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewTetoLink className="hidden text-15 @desk:inline-flex" />
          <NewPriceAlertLink
            label="Novo alerta de preço"
            className="hidden text-15 @desk:inline-flex"
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 @tab:flex @tab:gap-2.5 @desk:hidden">
        <NewTetoLink className="@tab:text-15" />
        <NewPriceAlertLink label="Alerta de preço" variant="secondary" className="@tab:hidden" />
        <NewPriceAlertLink
          label="Novo alerta de preço"
          className="hidden text-15 @tab:inline-flex"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 @tab:grid-cols-2 @desk:gap-5">
        <Panel className="gap-5.5 p-4 @tab:gap-5 @tab:p-5">
          <PanelHeader
            className="-mb-2 @tab:mb-0"
            title={
              <Link href="/alertas/tetos" className={inlineLinkClass}>
                Tetos do mês
              </Link>
            }
            subtitle="Cada aviso chega uma vez por mês, somando crédito e débito"
            titleClassName="@max-tab:text-18 @max-tab:tracking-normal"
            action={
              <ButtonLink href="/alertas/novo-teto" size="sm" className="hidden @tab:inline-flex">
                <Icon name="plus" size={18} />
                <span>Novo teto</span>
              </ButtonLink>
            }
          />
          {tetos.map((teto) => (
            <TetoMeter key={teto.id} teto={teto} />
          ))}
        </Panel>

        <Panel className="gap-1 p-4 @tab:p-5">
          <PanelHeader
            title="Alertas de preço"
            subtitle="Aviso por notificação e e-mail"
            titleClassName="@max-tab:text-18"
            action={
              <ButtonLink href="/alertas/novo-preco" size="sm">
                <Icon name="plus" size={18} />
                <span>Novo</span>
              </ButtonLink>
            }
          />
          <PriceAlertList items={priceAlerts} />
        </Panel>
      </div>

      <Panel className="gap-1.5">
        <PanelHeader
          title="Histórico de avisos"
          subtitle="Cada aviso de teto chega só uma vez por mês"
          titleClassName="@max-tab:text-18"
        />
        <div className="@tab:hidden">
          <AlertHistoryList items={alertHistory.slice(0, 3)} stacked />
        </div>
        <div className="hidden @tab:block">
          <AlertHistoryList items={alertHistory} />
        </div>
      </Panel>
    </Page>
  );
}
