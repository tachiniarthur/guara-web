import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { ProfileCard } from "@/features/alocacao/components/profile-card";
import { portfolioAllocation, profileById, profiles } from "@/features/alocacao/data";

export default function PerfisPage() {
  const seu = profileById[portfolioAllocation.perfil].nome;
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Os 4 perfis"
          subtitle="Carteira-alvo de cada perfil"
          back="/investimentos/alocacao"
          balanced
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Alocação", href: "/investimentos/alocacao" },
          { label: "Os 4 perfis" },
        ]}
      />
      <DetailHeader
        title="Os 4 perfis de investidor"
        subtitle="Carteira-alvo de cada perfil, em 5 grupos"
        actions={
          <ButtonLink href="/perfil/investidor" variant="secondary" className="text-15">
            <span>Refazer o questionário</span>
          </ButtonLink>
        }
      />
      <p className="m-0 text-14 leading-[1.55] text-mist @tab:text-15 @desk:text-16">
        Cada perfil divide a carteira em 5 grupos e suas subclasses. O seu, definido pelo
        questionário em {portfolioAllocation.definidoEm}, é o{" "}
        <strong className="text-sand">{seu}</strong>. Os outros aparecem para comparar.
      </p>
      <div className="grid grid-cols-1 items-stretch gap-4 @tab:grid-cols-2 @desk:grid-cols-4 @desk:gap-5">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      <Note icon="info-lg" tone="info">
        O perfil <strong>Sofisticado</strong> é para quem já investe em crédito estruturado, private
        equity e cripto. Ele só é sugerido quando as respostas do questionário indicam essa
        experiência.
      </Note>
      <ButtonLink
        href="/perfil/investidor"
        variant="secondary"
        size="lg"
        block
        className="@tab:hidden"
      >
        <span>Refazer o questionário</span>
      </ButtonLink>
    </Page>
  );
}
