import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import {
  AccountCard,
  AppearanceCard,
  BanksCard,
  InvestorProfileCard,
  NotificationsCard,
  SecurityCard,
} from "@/features/perfil/components/sections";
import { DisconnectDialog } from "@/features/perfil/components/disconnect-dialog";

/** Meu perfil (e o caso de notificações desligadas no aparelho: ?aparelho=desligado). */
export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ aparelho?: string }>;
}) {
  const deviceOff = (await searchParams).aparelho === "desligado";
  return (
    <>
      <Page
        padding="form"
        zoom={deviceOff ? undefined : 1.2}
        paddingClassName="pb-8"
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={<MobileHeader title="Meu perfil" back="/" />}
      >
        <header className="hidden items-end justify-between gap-4 @tab:flex">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
              Meu perfil e configurações
            </h1>
          </div>
          <div className="flex items-center gap-2" />
        </header>

        {/* Mobile: tudo empilhado. */}
        <div className="flex flex-col gap-4 @tab:hidden">
          <AccountCard />
          <InvestorProfileCard />
          <BanksCard />
          <NotificationsCard deviceOff={deviceOff} />
          <AppearanceCard idSuffix="m" />
          <SecurityCard idSuffix="m" />
        </div>

        {/* Tablet: duas colunas de ajustes e os bancos embaixo. */}
        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          <div className="grid grid-cols-2 items-stretch gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              <AccountCard />
              <InvestorProfileCard />
              <AppearanceCard idSuffix="t" className="grow" />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <NotificationsCard deviceOff={deviceOff} />
              <SecurityCard idSuffix="t" className="grow" />
            </div>
          </div>
          <BanksCard />
        </div>

        {/* Desktop: conta e bancos à esquerda, preferências à direita. */}
        <div className="hidden grid-cols-2 items-stretch gap-5 @desk:grid">
          <div className="flex min-w-0 flex-col gap-5">
            <AccountCard />
            <InvestorProfileCard />
            <BanksCard className="grow" />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <NotificationsCard deviceOff={deviceOff} />
            <AppearanceCard idSuffix="d" />
            <SecurityCard idSuffix="d" className="grow" />
          </div>
        </div>
      </Page>
      <Suspense>
        <DisconnectDialog />
      </Suspense>
    </>
  );
}
