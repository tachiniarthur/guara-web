import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailGrid } from "@/components/ui/detail-list";
import { AmountInput, RadioCard, SelectInput, TextInput } from "@/components/ui/form";
import { FormSection, LabeledField, SaveActions } from "@/components/ui/form-sections";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SwitchRow } from "@/components/ui/switch";
import { Tag } from "@/components/ui/tag";
import { LineChart } from "@/features/ativo/components/line-compare-chart";
import { goalDraft as draft } from "@/features/metas/data";
import { cn } from "@/lib/utils";

const grid = "contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:gap-4";

function Preview() {
  const { previa } = draft;
  return (
    <Panel className="p-4 @tab:p-5.5 @desk:p-6">
      <PanelHeader
        title="Prévia"
        subtitle="Com os depósitos e o rendimento estimado"
        titleClassName="text-17 tracking-normal"
      />
      <LineChart
        lines={[
          { nome: "Guardado com rendimento", cor: "#6CC08E", valores: previa.comRendimento },
          {
            nome: "Só os depósitos",
            cor: "#93A198",
            tracejada: true,
            valores: previa.soDepositos,
          },
        ]}
        domain={[0, 32]}
        ticks={[0, 15, 30]}
        tickLabel={(v) => (v === 0 ? "0" : `${v} mil`)}
        target={{ value: 30, label: "meta R$ 30.000", color: "#F2C230" }}
        xLabels={previa.meses}
        label={previa.rotulo}
        width={340}
        height={150}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-12 text-mist">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4.5 border-t-2 border-solid border-folha" />
          Guardado com rendimento
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-4.5 border-t-2 border-dashed border-caption" />
          Só os depósitos
        </span>
      </div>
      <DetailGrid items={previa.resumo} />
    </Panel>
  );
}

function Tracking({ className }: { className?: string }) {
  return (
    <Panel className={cn("gap-1 p-4 @tab:gap-1.5 @tab:p-5.5 @desk:p-6", className)}>
      <PanelHeader title="Acompanhamento" titleClassName="text-17 tracking-normal @tab:text-20" />
      <SwitchRow
        id="meta-onca"
        title="A Onça acompanha esta meta"
        description="Avisa se o ritmo cair e comemora cada marco"
        defaultChecked
      />
      <SwitchRow
        id="meta-lembrete"
        title="Lembrete no dia do depósito"
        description="Notificação no celular às 9h"
        defaultChecked
      />
      <AgentTip agent="onca" named className="hidden @tab:flex">
        Combinado: guardo o ritmo da viagem com você e aviso em jan/27 quando chegar a 25%.
      </AgentTip>
    </Panel>
  );
}

export default function NovaMetaPage() {
  return (
    <Page
      padding="form"
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Nova meta" close="/simulador/objetivo" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Simulador", href: "/simulador/objetivo" }, { label: "Nova meta" }]}
      />
      <DetailHeader title="Transformar em meta" />
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Tag tone="arara" status>
          <Icon name="loader" size={14} strokeWidth={2} />
          Da simulação · Juntar para um objetivo
        </Tag>
        <Link
          href="/simulador/objetivo"
          className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
        >
          Ver simulação
        </Link>
      </div>

      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] @desk:items-stretch">
        <div className="contents @desk:flex @desk:min-w-0 @desk:flex-col @desk:gap-4">
          <FormSection title="A meta" className="@desk:gap-3.5">
            <div className={grid}>
              <LabeledField id="meta-nome" label="Nome da meta">
                <TextInput id="meta-nome" defaultValue={draft.nome} />
              </LabeledField>
              <LabeledField id="meta-valor" label="Quanto custa" hint={draft.valorDica}>
                <AmountInput
                  id="meta-valor"
                  defaultValue={draft.valor}
                  className="h-16 rounded-tile text-28"
                />
              </LabeledField>
              <LabeledField id="meta-prazo" label="Prazo">
                <SelectInput id="meta-prazo" defaultValue={draft.prazo}>
                  <option>{draft.prazo}</option>
                </SelectInput>
              </LabeledField>
              <LabeledField id="meta-guardado" label="Já guardado" hint={draft.guardadoDica}>
                <TextInput id="meta-guardado" defaultValue={draft.guardado} />
              </LabeledField>
            </div>
          </FormSection>
          <FormSection title="Como guardar" className="@desk:grow @desk:gap-3.5">
            <LabeledField label="Onde guardar">
              {draft.onde.map((opcao, i) => (
                <RadioCard
                  key={opcao.titulo}
                  name="meta-onde"
                  title={opcao.titulo}
                  description={opcao.texto}
                  defaultChecked={i === 0}
                />
              ))}
            </LabeledField>
            <div className={grid}>
              <LabeledField id="meta-mensal" label="Depósito mensal" hint={draft.mensalDica}>
                <TextInput id="meta-mensal" defaultValue={draft.mensal} />
              </LabeledField>
              <LabeledField id="meta-dia" label="Dia do depósito">
                <SelectInput id="meta-dia" defaultValue={draft.dia}>
                  <option>{draft.dia}</option>
                </SelectInput>
              </LabeledField>
            </div>
          </FormSection>
        </div>
        <div className="flex flex-col gap-4.5 @tab:grid @tab:grid-cols-2 @tab:items-stretch @tab:gap-4 @desk:flex @desk:min-w-0 @desk:flex-col @desk:gap-4">
          <Preview />
          <Tracking className="@desk:grow" />
        </div>
      </div>
      <SaveActions label="Criar meta" href="/metas" cancelHref="/simulador/objetivo" />
    </Page>
  );
}
