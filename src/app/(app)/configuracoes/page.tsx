import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { SettingsScreen } from "@/features/perfil/components/settings-screen";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/** Configurações (e o caso de notificações desligadas no aparelho: ?aparelho=desligado). */
export default async function ConfiguracoesPage({ searchParams }: PageProps<"/configuracoes">) {
  const deviceOff = (await searchParams).aparelho === "desligado";
  return (
    <Page
      padding="form"
      zoom={deviceOff ? undefined : 1.2}
      paddingClassName="pb-30 lg:pb-8"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Configurações" back="/" />}
    >
      <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Configurações" }]} />
      <SettingsScreen deviceOff={deviceOff} />
    </Page>
  );
}
