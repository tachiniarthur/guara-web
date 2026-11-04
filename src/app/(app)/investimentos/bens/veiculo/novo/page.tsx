import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AmountInput, SelectInput, TextInput } from "@/components/ui/form";
import { ListFilter } from "@/components/ui/list-filter";
import { Note } from "@/components/ui/note";
import { PillToggle } from "@/components/ui/pill-toggle";
import { FormSection, LabeledField, SaveActions } from "@/components/ui/form-sections";
import { NetWorthPreview } from "@/features/bens/components/asset-form-parts";
import { patrimonioHoje, vehicleDraft as draft } from "@/features/bens/data";

/** Campos empilhados no desktop (largura toda); dois por linha no tablet. */
const fields =
  "contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:flex @desk:flex-col @desk:items-stretch @desk:gap-4";

const note = (
  <Note icon="info-lg" tone="info">
    O Guará não busca valor de veículo automaticamente. O valor é sempre o que você informar, e
    lembramos de atualizar a cada 6 meses.
  </Note>
);

/** Cadastro de veículo: tudo informado pela pessoa (sem consulta a tabelas de preço). */
export default function NovoVeiculoPage() {
  return (
    <Page
      padding="form"
      zoom={1.2}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Cadastrar veículo" back="/investimentos/novo" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Adicionar investimento", href: "/investimentos/novo" },
          { label: "Veículo" },
        ]}
      />
      <DetailHeader title="Cadastrar veículo" />

      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-3 @desk:items-stretch">
        <FormSection title="O veículo">
          <LabeledField label="Tipo">
            <ListFilter label="Tipo do veículo" options={draft.tipos} className="flex-wrap" />
          </LabeledField>
          <div className={fields}>
            <LabeledField id="veiculo-marca" label="Marca">
              <TextInput id="veiculo-marca" defaultValue={draft.marca} placeholder="Ex.: Fiat" />
            </LabeledField>
            <LabeledField id="veiculo-modelo" label="Modelo">
              <TextInput
                id="veiculo-modelo"
                defaultValue={draft.modelo}
                placeholder="Ex.: Argo 1.3"
              />
            </LabeledField>
            <LabeledField id="veiculo-ano" label="Ano">
              <TextInput
                id="veiculo-ano"
                inputMode="numeric"
                maxLength={4}
                defaultValue={draft.ano}
                placeholder="Ex.: 2022"
              />
            </LabeledField>
            <LabeledField id="veiculo-combustivel" label="Combustível" optional="opcional">
              <SelectInput id="veiculo-combustivel" defaultValue={draft.combustivel}>
                {draft.combustiveis.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectInput>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Valor">
          <div className={fields}>
            <LabeledField
              id="veiculo-valor"
              label="Valor estimado"
              hint="Quanto você acha que ele vale hoje. Pode ser uma estimativa."
            >
              <AmountInput
                id="veiculo-valor"
                defaultValue={draft.valor}
                className="h-16 rounded-tile text-28"
              />
            </LabeledField>
            <LabeledField
              id="veiculo-data"
              label="Data da estimativa"
              hint="Lembramos de atualizar a cada 6 meses"
            >
              <SelectInput id="veiculo-data" defaultValue={draft.data}>
                <option>{draft.data}</option>
              </SelectInput>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Detalhes">
          <div className={fields}>
            <LabeledField
              id="veiculo-nome"
              label="Nome"
              hint="Como ele vai aparecer na sua lista de bens"
            >
              <TextInput id="veiculo-nome" defaultValue={draft.nome} />
            </LabeledField>
            <LabeledField
              id="veiculo-placa"
              label="Placa"
              optional="opcional, só para você identificar"
            >
              <TextInput id="veiculo-placa" placeholder="ABC1D23" />
            </LabeledField>
          </div>
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
        </FormSection>
      </div>

      <NetWorthPreview
        hoje={patrimonioHoje.semVeiculo}
        depois={patrimonioHoje.comBem}
        items={draft.previa}
      >
        <div className="hidden @tab:contents">{note}</div>
      </NetWorthPreview>
      <div className="contents @tab:hidden">{note}</div>
      <SaveActions
        label="Salvar veículo"
        href="/investimentos/bens/onix"
        cancelHref="/investimentos"
        backHref="/investimentos/novo"
      />
    </Page>
  );
}
