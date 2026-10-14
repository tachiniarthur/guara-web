import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { IconRowList } from "@/features/perfil/components/icon-row-list";
import { user } from "@/features/usuario/data";

const novoEmail = "arthur.r@exemplo.com";

const cancelLink = (
  <Link
    href="/perfil/editar"
    className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
  >
    Cancelar troca de e-mail
  </Link>
);

export default function ConfirmarEmailPage() {
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-30 lg:pb-12"
      className="gap-4.5 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Editar perfil" close="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Meu perfil", href: "/perfil" }, { label: "Editar perfil" }]}
      />
      <DetailHeader title="Editar perfil" />
      <div className="flex flex-col gap-4.5 @desk:grid @desk:grid-cols-2 @desk:items-stretch @desk:gap-5">
        <section className="contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-4.5 @desk:p-7">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span
              aria-hidden="true"
              className="flex size-18 items-center justify-center rounded-full bg-arara-bg text-arara"
            >
              <Icon name="mail" size={32} />
            </span>
            <h1 className="m-0 font-display text-24 font-extrabold">Confirme seu novo e-mail</h1>
            <p className="m-0 text-15 leading-[1.55] text-mist">
              Enviamos um link para <strong className="text-sand">{novoEmail}</strong>. Ele vale por
              24 horas.
            </p>
          </div>
          <Panel className="p-4.5">
            <DetailList
              items={[
                { label: "E-mail atual", value: user.email },
                { label: "Novo e-mail", value: `${novoEmail} · aguardando` },
                { label: "Nome", value: `${user.nome} · salvo` },
              ]}
            />
          </Panel>
          <Note icon="info-lg" tone="info">
            Não chegou? Veja a caixa de spam ou reenvie em 60 segundos.
          </Note>
        </section>
        <Panel className="hidden p-6 @desk:flex">
          <PanelHeader title="Enquanto você não confirma" titleClassName="tracking-normal" />
          <IconRowList
            items={[
              {
                icon: "lock",
                titulo: `Login continua com ${user.email}`,
                texto: "Você entra normalmente",
              },
              {
                icon: "mail",
                titulo: "Avisos seguem no e-mail atual",
                texto: "Tetos, alertas de preço e relatórios",
              },
              {
                icon: "clock",
                titulo: "O link vale por 24 horas",
                texto: "Depois disso, é só pedir outro",
              },
            ]}
          />
        </Panel>
      </div>
      <div className="flex items-center justify-center gap-2.5 @tab:hidden">{cancelLink}</div>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        {cancelLink}
        <Button variant="secondary" className="text-15">
          <span>Reenviar link</span>
        </Button>
        <ButtonLink href="/perfil" variant="primary" className="text-15">
          <span>Voltar ao perfil</span>
        </ButtonLink>
      </div>
      <MobileActionBar className="items-center">
        <Button variant="secondary" size="xl">
          <span>Reenviar</span>
        </Button>
        <ButtonLink href="/perfil" variant="primary" size="xl" className="grow">
          <span>Voltar ao perfil</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
