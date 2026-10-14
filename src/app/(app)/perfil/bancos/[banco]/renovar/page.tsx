import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import {
  MalvoConsentDetails,
  MalvoConsentHeader,
} from "@/features/onboarding/components/malvo-consent";
import { bankFromSlug } from "@/features/onboarding/components/malvo-screens";
import { bankConnections } from "@/features/perfil/data";

export function generateStaticParams() {
  return bankConnections.filter((b) => b.status === "renovar").map((b) => ({ banco: b.id }));
}

const period = [
  { label: "Autorização atual até", value: "26/10/2026" },
  { label: "Nova autorização até", value: "23/09/2027" },
  { label: "Finalidade", value: "Organizar gastos e investimentos" },
  { label: "Via", value: "Malvo · Open Finance Brasil" },
];

export default async function RenovarPage({ params }: PageProps<"/perfil/bancos/[banco]/renovar">) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  const next = `/onboarding/bancos/${bank.id}/conectando`;
  const header = (
    <MalvoConsentHeader
      banco={bank}
      title={`Renovar autorização do ${bank.nome}`}
      subtitle="A atual termina em 26 de outubro"
      intro={`Renovando agora, gastos, saldo e investimentos do ${bank.nome} continuam chegando sem interrupção. Seu histórico não é apagado.`}
    />
  );
  const renew = (size: "md" | "xl", className?: string) => (
    <ButtonLink href={next} variant="primary" size={size} className={className}>
      <Icon name="external-link" size={18} />
      <span>Renovar no {bank.nome}</span>
    </ButtonLink>
  );

  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Renovar autorização" close="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Meu perfil", href: "/perfil" },
          { label: "Bancos conectados", href: "/perfil" },
          { label: `Renovar ${bank.nome}` },
        ]}
      />
      <DetailHeader title="Renovar autorização" />

      {/* Celular e tablet: tudo em sequência (no tablet, dentro de um card). */}
      <section className="flex flex-col gap-4.5 @tab:gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:hidden">
        {header}
        <MalvoConsentDetails banco={bank.nome} period={period} />
      </section>

      {/* Desktop: o banco num card e os detalhes em três cards. */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <Panel className="gap-3 p-6">{header}</Panel>
        <MalvoConsentDetails banco={bank.nome} period={period} cards />
      </div>

      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        {renew("md", "text-15")}
      </div>
      <MobileActionBar className="items-center">
        <ButtonLink href="/perfil" variant="ghost" size="xl">
          <span>Cancelar</span>
        </ButtonLink>
        {renew("xl", "grow")}
      </MobileActionBar>
    </Page>
  );
}
