import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { MobileActionBar, RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { duplicateHolding as dup } from "@/features/investimentos/posicoes";

function SourceCard({ source }: { source: "openFinance" | "manual" }) {
  const openFinance = source === "openFinance";
  return (
    <Panel className="gap-2.5">
      <div className="flex items-center gap-2.5">
        <Tag tone={openFinance ? "arara" : "neutral"} status>
          <Icon name={openFinance ? "bank" : "edit"} size={14} strokeWidth={2} />
          {openFinance ? `Open Finance · ${dup.banco}` : "Cadastro manual"}
        </Tag>
      </div>
      <strong className="font-display text-20">{dup.nome}</strong>
      <DetailList items={dup[source]} />
    </Panel>
  );
}

function Options() {
  return (
    <fieldset
      aria-label="O que fazer?"
      className="m-0 flex min-w-0 flex-col gap-2.5 border-none p-0"
    >
      {dup.opcoes.map((opcao, i) => (
        <RadioCard
          key={opcao.titulo}
          name="duplicidade"
          title={opcao.titulo}
          description={opcao.texto}
          defaultChecked={i === 0}
        />
      ))}
    </fieldset>
  );
}

const intro =
  "O mesmo título chegou pelo Open Finance do Itaú e também está no seu cadastro manual. Se for o mesmo dinheiro, a carteira conta duas vezes. Escolha o que fazer; nada muda até você confirmar.";

export default function DuplicidadePage() {
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Investimento duplicado" close="/investimentos" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Duplicidade" }]}
      />
      <DetailHeader title="Investimento duplicado" subtitle={dup.nome} />
      <p className="m-0 text-15 leading-[1.55] text-mist @desk:text-16">{intro}</p>
      <div className="grid grid-cols-1 items-stretch gap-4 @tab:grid-cols-2 @tab:gap-y-5 @desk:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] @desk:gap-5">
        <SourceCard source="openFinance" />
        <SourceCard source="manual" />
        {/* Celular: a escolha fica solta; tablet e desktop: num card. */}
        <div className="flex flex-col gap-4 @tab:col-span-2 @tab:gap-3.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:col-span-1">
          <PanelHeader title="O que fazer?" titleClassName="text-18 tracking-normal @tab:text-20" />
          <Options />
        </div>
      </div>
      <Note icon="info-lg" tone="info" className="bg-arara-bg" iconClassName="text-arara">
        Enquanto você não decide, contamos só o valor do Itaú no total da carteira para não somar em
        dobro.
      </Note>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/investimentos" variant="ghost" className="text-15">
          <span>Decidir depois</span>
        </ButtonLink>
        <ButtonLink href="/investimentos" variant="primary" className="text-15">
          <Icon name="check" size={18} />
          <span>Confirmar</span>
        </ButtonLink>
      </div>
      <MobileActionBar className="items-center">
        <ButtonLink href="/investimentos" variant="ghost" size="xl">
          <span>Depois</span>
        </ButtonLink>
        <ButtonLink href="/investimentos" variant="primary" size="xl" className="grow">
          <Icon name="check" size={18} />
          <span>Confirmar</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
