"use client";

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { DialogText, UrlDialog } from "@/components/ui/confirm-dialog";
import {
  AlertAbout,
  AlertActions,
  AlertChart,
  AlertFirings,
  AlertSummary,
  CarameloTip,
  NextStepPanel,
} from "@/features/alertas/components/alert-detail";
import { findPriceAlert } from "@/features/alertas/price-alerts";
import { usePriceAlertDetail } from "@/features/alertas/live";
import { useSession } from "@/features/acesso/session";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";

/** Um alerta de preço: com login, o da API; no protótipo, o de exemplo (`?estado=disparado`). */
export function AlertaPrecoScreen({ id, estado }: { id: string; estado?: string }) {
  const { live } = useSession();
  const real = usePriceAlertDetail(id, { enabled: live });
  if (live && !real.data) {
    if (real.missing) notFound();
    return (
      <Page
        padding="detail"
        header={<MobileHeader title="Alerta de preço" back="/alertas" balanced />}
      >
        {real.error ? <ErrorBlock /> : <LoadingStatus />}
      </Page>
    );
  }
  const alert = live ? real.data! : findPriceAlert(id);
  if (!alert) notFound();
  const fired = live ? Boolean(real.fired) : estado === "disparado";
  const props = { alert, fired };
  const direction = alert.direcao === "venda" ? "Venda" : "Compra";
  const path = `/alertas/precos/${alert.id}${fired ? "?estado=disparado" : ""}`;

  return (
    <>
      <Page
        padding="detail"
        zoom={1.4}
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={
          <MobileHeader
            title="Alerta de preço"
            subtitle={`${alert.ativo} · ${direction.toLowerCase()}`}
            back="/alertas"
            balanced
          />
        }
      >
        <Breadcrumb
          className="hidden flex-wrap @tab:flex"
          items={[
            { label: "Alertas", href: "/alertas" },
            { label: "Alertas de preço", href: "/alertas/precos" },
            { label: alert.ativo },
          ]}
        />
        <DetailHeader
          title={`Alerta do ${alert.ativo}`}
          subtitle={`${direction} · alvo de ${alert.alvo}`}
          actions={<AlertActions {...props} />}
        />

        {/* Celular */}
        <div className="contents @tab:hidden">
          {fired && <CarameloTip {...props} />}
          <AlertSummary {...props} />
          <AlertActions {...props} />
          <AlertChart {...props} />
          <AlertAbout {...props} />
          <AlertFirings {...props} />
          {!fired && <CarameloTip {...props} />}
        </div>

        {/* Tablet */}
        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          {fired && <CarameloTip {...props} />}
          <AlertSummary {...props} />
          <AlertChart {...props} />
          <div className="grid grid-cols-2 items-stretch gap-4">
            <AlertAbout {...props} />
            <AlertFirings {...props} />
          </div>
          {!fired && <CarameloTip {...props} />}
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-6 @desk:flex">
          {fired && <CarameloTip {...props} />}
          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch gap-5">
            <div className="flex min-w-0 flex-col gap-4">
              <AlertSummary {...props} />
              <AlertChart {...props} wide className="grow" />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <AlertAbout {...props} />
              {!fired && <CarameloTip {...props} />}
              <AlertFirings {...props} className={fired ? undefined : "grow"} />
              {fired && <NextStepPanel />}
            </div>
          </div>
        </div>
      </Page>
      <Suspense>
        <UrlDialog
          param="cancelar"
          title={`Cancelar o alerta do ${alert.ativo}?`}
          actions={
            <>
              <ButtonLink href={path} scroll={false} variant="ghost" size="md" className="text-15">
                <span>Manter</span>
              </ButtonLink>
              <ButtonLink href="/alertas" variant="danger" size="md" className="text-15">
                <span>Cancelar alerta</span>
              </ButtonLink>
            </>
          }
        >
          <DialogText>
            O Guará para de acompanhar o {alert.ativo} para este alvo. Você pode criar outro alerta
            quando quiser.
          </DialogText>
        </UrlDialog>
      </Suspense>
    </>
  );
}
