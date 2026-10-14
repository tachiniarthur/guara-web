import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailList } from "@/components/ui/detail-list";
import { TextInput } from "@/components/ui/form";
import { LabeledField, SaveActions } from "@/components/ui/form-sections";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { AvatarFields } from "@/features/perfil/components/edit-profile";
import { IconRowList } from "@/features/perfil/components/icon-row-list";
import { user } from "@/features/usuario/data";

const nameUses = [
  {
    icon: "user",
    titulo: "Menu lateral e Meu perfil",
    texto: "Nome e iniciais no cartão da conta",
  },
  {
    icon: "chat",
    titulo: "Conversas com os assistentes",
    texto: "A Capivara e a turma chamam você pelo nome",
  },
  { icon: "mail", titulo: "E-mails e avisos", texto: "Tetos, alertas de preço e relatórios" },
] as const;

function Fields() {
  return (
    <>
      <AvatarFields />
      <LabeledField id="perfil-nome" label="Nome" hint="Como os assistentes vão chamar você">
        <TextInput id="perfil-nome" defaultValue={user.nome} />
      </LabeledField>
      <LabeledField id="perfil-email" label="E-mail">
        <div className="relative">
          <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
            <Icon name="mail" />
          </span>
          <TextInput id="perfil-email" type="email" defaultValue={user.email} className="pl-11" />
        </div>
      </LabeledField>
      <Note icon="mail" tone="info" className="bg-arara-bg" iconClassName="text-arara">
        Se trocar o e-mail, enviamos um link de confirmação para o novo endereço. Até você
        confirmar, login e avisos continuam em <strong>{user.email}</strong>.
      </Note>
    </>
  );
}

export default function EditarPerfilPage() {
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-5 @desk:gap-6"
      header={<MobileHeader title="Editar perfil" close="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Meu perfil", href: "/perfil" }, { label: "Editar perfil" }]}
      />
      <DetailHeader title="Editar perfil" />
      <div className="flex flex-col gap-5 @desk:grid @desk:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @desk:items-stretch">
        <section className="contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-5.5 @desk:p-7">
          <Fields />
        </section>
        <div className="hidden min-w-0 flex-col gap-5 @desk:flex">
          <Panel className="p-6">
            <PanelHeader title="Onde seu nome aparece" titleClassName="tracking-normal" />
            <IconRowList items={nameUses} />
          </Panel>
          <Panel className="grow p-6">
            <PanelHeader title="E-mail da conta" titleClassName="tracking-normal" />
            <DetailList
              items={[
                { label: "Login", value: user.email },
                { label: "Avisos por e-mail", value: user.email },
              ]}
            />
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Os dois mudam juntos quando você confirmar um e-mail novo.
            </p>
          </Panel>
        </div>
      </div>
      <SaveActions label="Salvar" href="/perfil/editar/email" cancelHref="/perfil" />
    </Page>
  );
}
