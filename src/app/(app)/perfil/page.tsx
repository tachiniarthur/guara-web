import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { ProfileDataForm } from "@/features/perfil/components/profile-data-form";
import { DisconnectDialog } from "@/features/perfil/components/disconnect-dialog";
import { SectionRow } from "@/features/perfil/components/section-row";
import { BanksFields, InvestorProfileFields } from "@/features/perfil/components/sections";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * Meu perfil: os dados da conta já editáveis, o perfil de investidor e os bancos conectados, um
 * bloco largo embaixo do outro. As preferências ficam em Configurações (menu da conta).
 */
export default function PerfilPage() {
  return (
    <>
      <Page
        padding="form"
        paddingClassName="pb-8"
        className="gap-4 @tab:gap-5"
        header={<MobileHeader title="Meu perfil" back="/" />}
      >
        <Breadcrumb className="hidden flex-wrap @tab:flex" items={[{ label: "Meu perfil" }]} />
        <header className="hidden @tab:flex">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Meu perfil
          </h1>
        </header>
        <SectionRow
          title="Seus dados"
          description="Como os assistentes chamam você e como falamos com você."
        >
          <ProfileDataForm />
        </SectionRow>
        <SectionRow
          title="Perfil de investidor"
          description="Usado só em Investimentos, para comparar sua carteira com uma divisão-alvo."
        >
          <InvestorProfileFields />
        </SectionRow>
        <SectionRow
          title="Bancos conectados"
          description="Status, permissões e validade de cada conexão pelo Open Finance."
        >
          <BanksFields />
        </SectionRow>
      </Page>
      <Suspense>
        <DisconnectDialog />
      </Suspense>
    </>
  );
}
