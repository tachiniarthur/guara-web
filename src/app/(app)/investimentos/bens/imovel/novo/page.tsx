import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AmountInput, SelectInput, TextInput } from "@/components/ui/form";
import { ListFilter } from "@/components/ui/list-filter";
import { Note } from "@/components/ui/note";
import { PillToggle } from "@/components/ui/pill-toggle";
import { FormSection, LabeledField, SaveActions } from "@/components/ui/form-sections";
import { NetWorthPreview } from "@/features/bens/components/asset-form-parts";
import { patrimonioHoje, propertyDraft as draft } from "@/features/bens/data";

function TypeField({ className }: { className?: string }) {
  return (
    <LabeledField label="Tipo" className={className}>
      <ListFilter label="Tipo do imóvel" options={draft.tipos} className="flex-wrap" />
    </LabeledField>
  );
}

const note = (
  <Note icon="info-lg" tone="info">
    O Guará não busca valor de imóvel automaticamente. O valor é sempre o que você informar.
  </Note>
);

export default function NovoImovelPage() {
  return (
    <Page
      padding="form"
      zoom={1.2}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Cadastrar imóvel" back="/investimentos/novo" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Adicionar", href: "/investimentos/novo" },
          { label: "Imóvel" },
        ]}
      />
      <DetailHeader title="Cadastrar imóvel" />

      <div className="flex flex-col gap-4.5 @tab:gap-5 @desk:grid @desk:grid-cols-3 @desk:items-stretch">
        <FormSection title="O imóvel">
          <div className="contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:flex @desk:flex-col @desk:gap-4">
            <LabeledField
              id="bem-nome"
              label="Nome"
              hint="Como ele vai aparecer na sua lista de bens"
            >
              <TextInput id="bem-nome" defaultValue={draft.nome} />
            </LabeledField>
            <TypeField className="@tab:hidden" />
            <LabeledField id="bem-area" label="Área" optional="opcional">
              <TextInput id="bem-area" defaultValue={draft.area} />
            </LabeledField>
            <LabeledField id="bem-cidade" label="Cidade" optional="opcional">
              <TextInput id="bem-cidade" defaultValue={draft.cidade} />
            </LabeledField>
          </div>
          <TypeField className="hidden @tab:flex" />
        </FormSection>

        <FormSection title="Valor">
          <div className="contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:flex @desk:flex-col @desk:gap-4">
            <LabeledField
              id="bem-valor"
              label="Valor estimado"
              hint="Quanto você acha que ele vale hoje. Pode ser uma estimativa."
            >
              <AmountInput
                id="bem-valor"
                defaultValue={draft.valor}
                className="h-16 rounded-tile text-28"
              />
            </LabeledField>
            <LabeledField
              id="bem-data"
              label="Data da estimativa"
              hint="Lembramos de atualizar a cada 6 meses"
            >
              <SelectInput id="bem-data" defaultValue={draft.data}>
                <option>{draft.data}</option>
              </SelectInput>
            </LabeledField>
          </div>
        </FormSection>

        <FormSection title="Financiamento">
          <LabeledField label="Está financiado?">
            <PillToggle
              label="Financiamento"
              options={[
                { value: "nao", label: "Não, quitado" },
                { value: "sim", label: "Sim, financiado" },
              ]}
              defaultValue="sim"
              className="flex self-stretch @desk:inline-flex @desk:self-start"
              itemClassName="flex-1 @desk:flex-none"
            />
          </LabeledField>
          <div className="contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:flex @desk:flex-col @desk:gap-4">
            <LabeledField
              id="bem-saldo"
              label="Saldo devedor"
              hint="O quanto falta pagar, conforme o último extrato do financiamento"
            >
              <TextInput id="bem-saldo" defaultValue={draft.saldo} />
            </LabeledField>
            <LabeledField id="bem-banco" label="Banco do financiamento" optional="opcional">
              <TextInput id="bem-banco" placeholder="Ex.: banco ou cooperativa" />
            </LabeledField>
          </div>
        </FormSection>
      </div>

      <NetWorthPreview
        hoje={patrimonioHoje.semImovel}
        depois={patrimonioHoje.comBem}
        items={draft.previa}
      >
        <div className="hidden @tab:contents">{note}</div>
      </NetWorthPreview>
      <div className="contents @tab:hidden">{note}</div>
      <SaveActions
        label="Salvar imóvel"
        href="/investimentos/bens/apto"
        cancelHref="/investimentos/novo"
      />
    </Page>
  );
}
