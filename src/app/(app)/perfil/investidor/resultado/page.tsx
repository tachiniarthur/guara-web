import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { RedoResult } from "@/features/perfil/components/redo-result";

export default function ResultadoRefazerPage() {
  return (
    <Page
      padding="form"
      zoom={1.2}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Refazer perfil"
          back="/perfil/investidor"
          actions={
            <IconButtonLink href="/perfil" icon="x" label="Fechar sem salvar" variant="ghost" />
          }
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Meu perfil", href: "/perfil" },
          { label: "Refazer perfil", href: "/perfil/investidor" },
          { label: "Resultado" },
        ]}
      />
      <DetailHeader title="Resultado do perfil" />

      <RedoResult />

      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        <ButtonLink href="/perfil/investidor" variant="secondary" className="text-15">
          <span>Refazer</span>
        </ButtonLink>
        <ButtonLink href="/perfil" variant="primary" className="text-15">
          <Icon name="check" size={18} />
          <span>Salvar perfil</span>
        </ButtonLink>
      </div>
      <MobileActionBar className="items-center">
        <ButtonLink href="/perfil/investidor" variant="secondary" size="xl">
          <span>Refazer</span>
        </ButtonLink>
        <ButtonLink href="/perfil" variant="primary" size="xl" className="grow">
          <Icon name="check" size={18} />
          <span>Salvar perfil</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
