import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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
    </Page>
  );
}
