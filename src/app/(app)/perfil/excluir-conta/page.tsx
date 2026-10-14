import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxRow, MobileActionBar, TextInput } from "@/components/ui/form";
import { LabeledField } from "@/components/ui/form-sections";
import { Icon, type IconName } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { user } from "@/features/usuario/data";

const erased: { icon: IconName; titulo: string; texto: string }[] = [
  {
    icon: "user",
    titulo: "Seu perfil e preferências",
    texto: "Nome, e-mail, perfil de investidor e avisos",
  },
  {
    icon: "wallet",
    titulo: "Seus dados financeiros",
    texto: "Lançamentos, carteira, bens, tetos, metas e simulações",
  },
  {
    icon: "chat",
    titulo: "Conversas com os assistentes",
    texto: "Inclusive arquivos enviados no chat",
  },
  {
    icon: "bank",
    titulo: "Autorizações do Nubank e do Itaú",
    texto: "Revogadas no Open Finance, também nos bancos",
  },
  { icon: "tag", titulo: "Assinatura do plano Completo", texto: "Cancelada; não há nova cobrança" },
];

const title = "text-19 tracking-normal";

function ErasedPanel() {
  return (
    <Panel className="p-5.5">
      <PanelHeader
        title="O que será apagado"
        subtitle="Em até 30 dias, salvo o que a lei obriga a guardar"
        titleClassName={title}
      />
      <RowList>
        {erased.map((item, i) => (
          <ListRow
            key={item.titulo}
            title={item.titulo}
            meta={item.texto}
            divider={i < erased.length - 1}
            leading={
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-urucum-bg text-urucum"
              >
                <Icon name={item.icon} size={20} />
              </span>
            }
          />
        ))}
      </RowList>
    </Panel>
  );
}

function BackupPanel() {
  return (
    <Panel className="p-5.5">
      <PanelHeader title="Antes de sair" titleClassName={title} />
      <p className="m-0 text-14 leading-[1.55] text-mist">
        Baixe uma cópia dos seus dados. O arquivo chega no e-mail {user.email}.
      </p>
      <Button variant="secondary" block className="text-15">
        <Icon name="arrow-down-to" size={18} />
        <span>Baixar meus dados (LGPD)</span>
      </Button>
    </Panel>
  );
}

function ConfirmPanel({ className }: { className?: string }) {
  return (
    <Panel className={`p-5.5 ${className ?? ""}`}>
      <PanelHeader title="Confirmar" titleClassName={title} />
      <LabeledField id="excluir-confirmacao" label="Digite EXCLUIR para confirmar">
        <TextInput id="excluir-confirmacao" placeholder="EXCLUIR" />
      </LabeledField>
      <CheckboxRow
        id="excluir-entendi"
        label="Entendi que não dá para desfazer"
        labelClassName="font-bold"
      />
    </Panel>
  );
}

export default function ExcluirContaPage() {
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Excluir conta" back="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Meu perfil", href: "/perfil" }, { label: "Excluir conta" }]}
      />
      <DetailHeader
        title="Excluir conta"
        subtitle="Seus dados são apagados e as conexões com os bancos são revogadas"
      />
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @desk:items-stretch">
        <ErasedPanel />
        <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:flex @desk:min-w-0 @desk:flex-col @desk:gap-5">
          <BackupPanel />
          <ConfirmPanel className="@desk:grow" />
        </div>
      </div>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href="/perfil" variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        <ButtonLink href="/boas-vindas" variant="danger" className="text-15">
          <Icon name="trash" size={18} />
          <span>Excluir conta</span>
        </ButtonLink>
      </div>
      <MobileActionBar className="items-center">
        <ButtonLink href="/perfil" variant="ghost" size="xl">
          <span>Cancelar</span>
        </ButtonLink>
        <ButtonLink href="/boas-vindas" variant="danger" size="xl" className="grow">
          <Icon name="trash" size={18} />
          <span>Excluir conta</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
