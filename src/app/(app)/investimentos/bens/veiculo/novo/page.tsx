import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SelectInput, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { ListFilter } from "@/components/ui/list-filter";
import { Note } from "@/components/ui/note";
import { PillToggle } from "@/components/ui/pill-toggle";
import { SearchField } from "@/components/ui/search-field";
import { FormSection, LabeledField, SaveActions } from "@/components/ui/form-sections";
import { NetWorthPreview } from "@/features/bens/components/asset-form-parts";
import { patrimonioHoje, vehicleDraft as draft } from "@/features/bens/data";

/** Veículo encontrado na Tabela FIPE, com o valor do mês. */
function FipeMatch() {
  const { fipe } = draft;
  return (
    <div className="flex flex-col gap-2.5 rounded-[1.125rem] border-2 border-folha bg-folha-bg p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
        >
          <Icon name="car-front" size={20} />
        </span>
        <span className="flex grow flex-col leading-[1.35]">
          <strong>{fipe.titulo}</strong>
          <span className="text-13 text-mist">{fipe.ano}</span>
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-13 text-mist">Valor na Tabela FIPE de {fipe.mes}</span>
        <span className="font-display text-24 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {fipe.valor}
        </span>
      </div>
      <span className="text-13 text-mist">{fipe.variacao}</span>
    </div>
  );
}

function Select({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <LabeledField id={id} label={label}>
      <SelectInput id={id} defaultValue={value}>
        <option>{value}</option>
      </SelectInput>
    </LabeledField>
  );
}

export default function NovoVeiculoPage() {
  return (
    <Page
      padding="form"
      zoom={1.25}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Cadastrar veículo" back="/investimentos/novo" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Adicionar", href: "/investimentos/novo" },
          { label: "Veículo" },
        ]}
      />
      <DetailHeader title="Cadastrar veículo" />

      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] @desk:items-stretch">
        <FormSection title="Buscar na Tabela FIPE" subtitle="Escolha marca, modelo e ano">
          <SearchField
            label="Buscar na Tabela FIPE: marca, modelo ou ano"
            size="list"
            className="@tab:hidden"
          />
          <SearchField label="Ex.: Onix 2022" size="list" className="hidden @tab:block" />
          <LabeledField label="Tipo">
            <ListFilter label="Tipo do veículo" options={draft.tipos} className="flex-wrap" />
          </LabeledField>
          <div className="contents @tab:grid @tab:grid-cols-3 @tab:items-start @tab:gap-3 @desk:gap-4">
            <Select id="veiculo-marca" label="Marca" value={draft.marca} />
            <Select id="veiculo-modelo" label="Modelo" value={draft.modelo} />
            <Select id="veiculo-ano" label="Ano e combustível" value={draft.ano} />
          </div>
          <FipeMatch />
        </FormSection>

        {/* Tablet: detalhes ao lado da prévia; desktop: detalhes ao lado da busca. */}
        <div className="contents @tab:grid @tab:grid-cols-2 @tab:items-stretch @tab:gap-4 @desk:contents">
          <FormSection title="Detalhes" className="@tab:gap-4">
            <LabeledField
              id="veiculo-nome"
              label="Nome"
              hint="Como ele vai aparecer na sua lista de bens"
            >
              <TextInput id="veiculo-nome" defaultValue={draft.nome} />
            </LabeledField>
            <LabeledField label="Situação">
              <PillToggle
                label="Situação"
                options={[
                  { value: "quitado", label: "Quitado" },
                  { value: "financiado", label: "Financiado" },
                ]}
                className="flex self-stretch"
                itemClassName="flex-1"
              />
            </LabeledField>
            <LabeledField
              id="veiculo-placa"
              label="Placa"
              optional="opcional, só para você identificar"
            >
              <TextInput id="veiculo-placa" placeholder="ABC1D23" />
            </LabeledField>
          </FormSection>
          <NetWorthPreview
            hoje={patrimonioHoje.semVeiculo}
            depois={patrimonioHoje.comBem}
            items={draft.previa}
            className="@desk:hidden"
          />
        </div>
      </div>

      <NetWorthPreview
        hoje={patrimonioHoje.semVeiculo}
        depois={patrimonioHoje.comBem}
        items={draft.previa}
        className="hidden @desk:flex"
      >
        <Note icon="info-lg" tone="info">
          O valor do veículo atualiza sozinho todo mês pela Tabela FIPE.
        </Note>
      </NetWorthPreview>
      <SaveActions
        label="Salvar veículo"
        href="/investimentos/bens/onix"
        cancelHref="/investimentos/novo"
      />
    </Page>
  );
}
