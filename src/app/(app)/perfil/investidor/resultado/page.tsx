import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { DetailGrid } from "@/components/ui/detail-list";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { IconButtonLink } from "@/components/ui/icon-button";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  donutSizes,
  GroupDetailsList,
  ProfileLevels,
  TargetDonutWithList,
} from "@/features/alocacao/components/allocation-parts";
import { OffTargetNote } from "@/features/alocacao/components/allocation-summary";
import { portfolioAllocation, profileById } from "@/features/alocacao/data";
import { profileAnswers, profileEffects } from "@/features/onboarding/data";
import { IconRowList } from "@/features/perfil/components/icon-row-list";
import { QuestionProgress } from "@/features/perfil/components/redo-parts";
import { cn } from "@/lib/utils";

const perfil = profileById[portfolioAllocation.perfil].nome;

const effects = profileEffects.map((e) => ({
  ...e,
  texto: e.texto.replace(` do perfil ${perfil} `, " do perfil "),
}));

function Heading({ titleClassName }: { titleClassName: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-13 text-caption">Resultado</span>
      <h1
        className={cn(
          "m-0 font-display leading-[1.2] font-extrabold tracking-[-0.01em]",
          titleClassName,
        )}
      >
        Seu perfil é <span className="text-tucano">{perfil}</span>
      </h1>
      <p className="m-0 text-15 leading-[1.55] text-mist">
        Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte do
        dinheiro protegida. Seu prazo de 3 a 10 anos e a parte pequena que talvez precise resgatar
        combinam com uma carteira equilibrada.
      </p>
    </div>
  );
}

const sameNote = (
  <Note icon="check" tone="info" className="bg-folha-bg" iconClassName="text-folha">
    Antes: <strong>{perfil}</strong>, respondido em {portfolioAllocation.definidoEm}. Agora:{" "}
    <strong>{perfil}</strong>. Seu perfil continua o mesmo; ao salvar, a data é atualizada.
  </Note>
);

function SplitPanel({ size }: { size: "mobile" | "tablet" | "desktop" }) {
  const dims =
    size === "desktop" ? donutSizes.xl : size === "tablet" ? donutSizes.md : donutSizes.result;
  return (
    <Panel className={size === "desktop" ? "p-6" : "p-5"}>
      <PanelHeader
        title="Como o Guará vai dividir as sugestões"
        subtitle={`Carteira-alvo do perfil ${perfil} em 5 grupos · toque num grupo para ver as subclasses · a marca branca é a sua carteira hoje`}
        titleClassName={cn("tracking-normal", size === "mobile" ? "text-18" : "text-20")}
      />
      <TargetDonutWithList dims={dims} />
      <GroupDetailsList layout={size === "mobile" ? "compact" : "wide"} openGroup="rv-br" />
      <OffTargetNote after="O Pacu pode sugerir como ajustar, mas nada muda sem você." />
      <div className="flex justify-end">
        <Link
          href="/investimentos/alocacao/perfis"
          className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
        >
          Comparar os 4 perfis
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
    </Panel>
  );
}

function Answers({ wide }: { wide?: boolean }) {
  return (
    <Panel className={wide ? "p-6" : "p-5"}>
      <PanelHeader
        title="Suas respostas"
        titleClassName={cn("tracking-normal", wide ? "text-18" : "text-16")}
      />
      <DetailGrid items={profileAnswers.map((a) => ({ label: a.pergunta, value: a.resposta }))} />
    </Panel>
  );
}

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

      {/* Celular */}
      <div className="flex flex-col gap-5 @tab:hidden">
        <QuestionProgress label="6 de 6 respondidas" done={6} total={6} />
        <Heading titleClassName="text-26" />
        <ProfileLevels />
        {sameNote}
        <SplitPanel size="mobile" />
        <Answers />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Heading titleClassName="text-30" />
        <ProfileLevels />
        {sameNote}
        <SplitPanel size="tablet" />
        <Answers />
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel className="gap-4.5 p-6">
            <Heading titleClassName="text-32" />
            <ProfileLevels />
            {sameNote}
          </Panel>
          <Answers wide />
          <Panel className="grow p-6">
            <PanelHeader
              title="O que o perfil muda no app"
              titleClassName="text-18 tracking-normal"
            />
            <IconRowList items={effects} />
          </Panel>
        </div>
        <SplitPanel size="desktop" />
      </div>

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
