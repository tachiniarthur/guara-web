import Link from "next/link";
import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { AccountCard, BanksCard, InvestorProfileCard } from "@/features/perfil/components/sections";
import { DisconnectDialog } from "@/features/perfil/components/disconnect-dialog";

/** Atalho para Configurações (notificações, aparência e segurança ficam lá). */
function SettingsShortcut({ className }: { className?: string }) {
  return (
    <Panel className={className}>
      <Link
        href="/configuracoes"
        className="-m-1 flex items-center gap-3.5 rounded-tile p-1 text-sand no-underline hover:bg-shade"
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
        >
          <Icon name="sliders" />
        </span>
        <span className="flex grow flex-col leading-[1.35]">
          <strong className="text-15">Configurações</strong>
          <span className="text-13 text-caption">
            Notificações, tamanho do texto, biometria e aparelhos
          </span>
        </span>
        <Icon name="chevron-right" size={18} className="text-caption" />
      </Link>
    </Panel>
  );
}

/** Meu perfil: a conta (nome, e-mail e celular), o perfil de investidor e os bancos conectados. */
export default function PerfilPage() {
  return (
    <>
      <Page
        padding="form"
        zoom={1.2}
        paddingClassName="pb-8"
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={<MobileHeader title="Meu perfil" back="/" />}
      >
        <header className="hidden items-end justify-between gap-4 @tab:flex">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Meu perfil
          </h1>
        </header>

        {/* Celular e tablet: empilhado (no tablet, conta e perfil lado a lado). */}
        <div className="flex flex-col gap-4 @desk:hidden">
          <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
            <AccountCard />
            <InvestorProfileCard />
          </div>
          <BanksCard />
          <SettingsShortcut />
        </div>

        {/* Desktop: conta, perfil e o atalho à esquerda; os bancos à direita. */}
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-stretch gap-5 @desk:grid">
          <div className="flex min-w-0 flex-col gap-5">
            <AccountCard />
            <InvestorProfileCard />
            <SettingsShortcut />
          </div>
          <BanksCard />
        </div>
      </Page>
      <Suspense>
        <DisconnectDialog />
      </Suspense>
    </>
  );
}
