"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { useSession } from "@/features/acesso/session";
import { ProfileTargetCard } from "@/features/alocacao/components/class-allocation";
import { useAllocation, useProfileTargets } from "@/features/alocacao/live";

/** Os perfis do questionário, cada um com a carteira-alvo, e a carteira de hoje ao lado (API). */
export default function PerfisPage() {
  const { live } = useSession();
  const profiles = useProfileTargets({ enabled: live });
  const allocation = useAllocation({ enabled: live });
  const failed = !live || profiles.error || allocation.error;
  const ready = profiles.data && allocation.data;
  const perfil = allocation.data?.perfil;
  const title = profiles.data ? `Os ${profiles.data.length} perfis` : "Os perfis";

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title={title}
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
          { label: title },
        ]}
      />
      <DetailHeader
        title={`${title} de investidor`}
        subtitle="Carteira-alvo de cada perfil, por classe"
        actions={
          <ButtonLink href="/perfil/investidor" variant="secondary" className="text-15">
            <span>{perfil ? "Refazer o questionário" : "Responder o questionário"}</span>
          </ButtonLink>
        }
      />
      {failed ? (
        <ErrorBlock />
      ) : !ready ? (
        <LoadingStatus />
      ) : (
        <>
          <p className="m-0 text-14 leading-[1.55] text-mist @tab:text-15 @desk:text-16">
            Cada perfil divide a carteira entre as classes. As barras mostram a sua carteira de hoje
            e a marca branca, o alvo de cada perfil.{" "}
            {perfil ? (
              <>
                O seu, definido pelo questionário em {perfil.definidoEm}, é o{" "}
                <strong className="text-sand">{perfil.nome}</strong>.
              </>
            ) : (
              "Você ainda não respondeu o questionário."
            )}
          </p>
          <div className="grid grid-cols-1 items-stretch gap-4 @tab:grid-cols-2 @desk:grid-cols-3 @desk:gap-5">
            {profiles.data!.map((profile) => (
              <ProfileTargetCard
                key={profile.kind}
                profile={profile}
                allocation={allocation.data}
              />
            ))}
          </div>
          <Note icon="info-lg" tone="info">
            É só uma referência para comparar. O Guará não compra nem vende nada; você decide se e
            como ajustar.
          </Note>
        </>
      )}
      <ButtonLink
        href="/perfil/investidor"
        variant="secondary"
        size="lg"
        block
        className="@tab:hidden"
      >
        <span>{perfil ? "Refazer o questionário" : "Responder o questionário"}</span>
      </ButtonLink>
    </Page>
  );
}
