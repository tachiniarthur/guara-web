import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PasswordForm } from "@/features/perfil/components/password-form";

export default function SenhaDeAcessoPage() {
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-5 @desk:gap-6"
      header={<MobileHeader title="Senha de acesso" back="/configuracoes" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Configurações", href: "/configuracoes" }, { label: "Senha de acesso" }]}
      />
      <DetailHeader title="Senha de acesso" />
      <section className="flex w-full max-w-[40rem] flex-col gap-5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6">
        <PasswordForm />
      </section>
    </Page>
  );
}
