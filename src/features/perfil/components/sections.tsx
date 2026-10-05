import Link from "next/link";

import { Button, ButtonLink, ForestBackdrop } from "@/components/ui/button";
import { CheckboxRow } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SegmentedTiles } from "@/components/ui/segmented-tiles";
import { user } from "@/features/usuario/data";
import { cn } from "@/lib/utils";

import {
  account,
  bankConnections,
  devices,
  investorProfile,
  notificationTypes,
  plan,
  textSizes,
  type BankConnection,
} from "../data";

type SectionProps = { className?: string };
/** Os blocos aparecem em arranjos diferentes por largura; o sufixo mantém os ids únicos. */
type WithIds = SectionProps & { idSuffix: string };

function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  return (
    <PanelHeader title={children} subtitle={subtitle} titleClassName="text-18 tracking-normal" />
  );
}

/** Nome, e-mail e o atalho para editar, sobre a faixa do tucano. */
export function AccountCard({ className }: SectionProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-w-0 flex-col gap-4 overflow-hidden rounded-card border border-line-strong bg-mata p-5",
        className,
      )}
    >
      <ForestBackdrop overlay="deep" />
      <div className="flex items-center gap-3.5">
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-tucano text-20 font-bold text-canvas"
        >
          {user.iniciais}
        </div>
        <div className="flex min-w-0 grow flex-col leading-[1.35]">
          <strong className="text-18">{user.nome}</strong>
          <span className="text-14 text-mist">{account.email}</span>
        </div>
        <Button variant="glass" size="sm">
          <span>Editar</span>
        </Button>
      </div>
    </section>
  );
}

export function InvestorProfileCard({ className }: SectionProps) {
  return (
    <Panel className={cn("gap-3.5", className)}>
      <Title>Perfil de investidor</Title>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#172838] text-arara">
          <Icon name="shield" />
        </span>
        <div className="flex grow flex-col leading-[1.35]">
          <strong>{investorProfile.perfil}</strong>
          <span className="text-13 text-caption">{investorProfile.detalhe}</span>
        </div>
      </div>
      <ButtonLink href="/onboarding/perfil" variant="secondary">
        <span>Refazer questionário</span>
      </ButtonLink>
    </Panel>
  );
}

const bankActionClass = "h-10 gap-1.5 px-3.5 text-13";

function BankItem({ bank }: { bank: BankConnection }) {
  const ok = bank.status === "ok";
  return (
    <li
      className={cn(
        "flex flex-col gap-3.5 rounded-[1.125rem] border bg-field p-4",
        ok ? "border-line" : "border-[#5C4A1A]",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-[2.875rem] shrink-0 items-center justify-center rounded-xl border border-line bg-canvas font-display text-17 font-bold"
        >
          {bank.inicial}
        </span>
        <span className="flex min-w-0 grow flex-col leading-[1.3]">
          <strong className="text-16">{bank.nome}</strong>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-13 font-bold",
              ok ? "text-folha" : "text-tucano",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", ok ? "bg-folha" : "bg-tucano")}
            />
            {ok ? "Funcionando" : "Renove em breve"}
          </span>
        </span>
      </div>
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-[0.875rem] px-3.5 py-3 text-13 leading-normal text-sand",
          ok ? "bg-folha-bg" : "bg-tucano-bg",
        )}
      >
        <span className={cn("mt-px", ok ? "text-folha" : "text-tucano")}>
          <Icon name={ok ? "check-alt" : "alert-triangle"} size={16} />
        </span>
        <span>
          {bank.mensagem.texto}
          {bank.mensagem.destaque && (
            <>
              {" "}
              <strong>{bank.mensagem.destaque}</strong>
            </>
          )}
          {bank.mensagem.depois}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-12 text-caption">O que o Guará vê</span>
        <div className="flex flex-wrap gap-1.5">
          {bank.escopo.map((item) => (
            <span
              key={item}
              className="inline-flex h-6 items-center rounded-full bg-shade px-2.5 text-12 font-bold whitespace-nowrap text-mist"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5 text-13 @tab:gap-x-5">
        <div className="flex flex-col gap-0.5">
          <dt className="text-caption">Última atualização</dt>
          <dd className="m-0 font-semibold">{bank.atualizado}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-caption">
            Autorização <span className="hidden @tab:inline">válida </span>até
          </dt>
          <dd className={cn("m-0 font-semibold", ok ? "text-sand" : "text-tucano")}>
            {bank.validade}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        {ok ? (
          <Button variant="outline" size="sm" className={bankActionClass}>
            <Icon name="refresh" size={16} />
            <span>Atualizar agora</span>
          </Button>
        ) : (
          <Button variant="primary" size="sm" className={bankActionClass}>
            <Icon name="link-alt" size={16} />
            <span>Renovar autorização</span>
          </Button>
        )}
        <Button variant="outline" size="sm" className={bankActionClass}>
          <Icon name="eye" size={16} />
          <span>Ver o que é compartilhado</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(bankActionClass, "text-urucum hover:bg-urucum-bg")}
        >
          <span>Desconectar</span>
        </Button>
      </div>
    </li>
  );
}

/** Status, permissões e validade de cada conexão do Open Finance. */
export function BanksCard({ className }: SectionProps) {
  const livres = plan.total - plan.usadas;
  return (
    <Panel className={cn("gap-4", className)}>
      <Title subtitle="Status, permissões e validade de cada conexão">Bancos conectados</Title>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-13">
          <span className="text-mist">
            <strong className="text-sand">
              {plan.usadas} de {plan.total}
            </strong>{" "}
            conexões usadas no plano {plan.nome}
          </span>
          <a href="#" className="font-bold text-sand underline underline-offset-3">
            Ver planos
          </a>
        </div>
        <div
          role="img"
          aria-label={`${plan.usadas} de ${plan.total} conexões usadas`}
          className="flex h-2 gap-1"
        >
          {Array.from({ length: plan.total }, (_, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-[0.25rem]", i < plan.usadas ? "bg-folha" : "bg-line")}
            />
          ))}
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
        {bankConnections.map((bank) => (
          <BankItem key={bank.id} bank={bank} />
        ))}
        <li className="col-span-full">
          <Link
            href="/onboarding/bancos"
            className="flex items-center gap-3.5 rounded-[1.125rem] border-[1.5px] border-dashed border-line-strong p-4 text-sand no-underline hover:bg-shade"
          >
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-shade text-tucano"
            >
              <Icon name="plus" />
            </span>
            <span className="flex grow flex-col leading-[1.35]">
              <strong className="text-15">Conectar mais um banco</strong>
              <span className="text-13 text-caption">
                Você ainda tem {livres} conexão no seu plano
              </span>
            </span>
            <Icon name="chevron-right" size={18} className="text-caption" />
          </Link>
        </li>
      </ul>
      <Note icon="shield" iconClassName="text-folha">
        Conexão pelo Open Finance: o Guará só lê seus dados, nunca movimenta dinheiro. Você pode
        desconectar aqui ou no app do banco quando quiser.
      </Note>
    </Panel>
  );
}

const notificationGrid = "grid grid-cols-[minmax(0,1fr)_4rem_4rem]";

/** Canais (celular e e-mail) por tipo de aviso. */
export function NotificationsCard({ className }: SectionProps) {
  return (
    <Panel className={cn("gap-2.5", className)}>
      <Title>Notificações</Title>
      <div role="table" aria-label="Canais por tipo de aviso">
        <div
          role="row"
          className={cn(
            notificationGrid,
            "text-12 font-bold tracking-[.06em] text-caption uppercase",
          )}
        >
          <span role="columnheader">Aviso</span>
          <span role="columnheader" className="text-center">
            Celular
          </span>
          <span role="columnheader" className="text-center">
            E-mail
          </span>
        </div>
        {notificationTypes.map((type) => (
          <div
            key={type}
            role="row"
            className={cn(notificationGrid, "min-h-[3.3125rem] items-center border-b border-line")}
          >
            <span role="rowheader" className="text-15">
              {type}
            </span>
            {[
              { channel: "celular", label: `${type} por notificação no celular` },
              { channel: "email", label: `${type} por e-mail` },
            ].map((cell) => (
              <span key={cell.channel} role="cell" className="flex justify-center">
                <input
                  type="checkbox"
                  aria-label={cell.label}
                  defaultChecked
                  className="m-0 size-5.5 accent-sand"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function AppearanceCard({ className, idSuffix }: WithIds) {
  return (
    <Panel className={cn("gap-3.5", className)}>
      <Title>Aparência e acessibilidade</Title>
      <div className="flex flex-col gap-2">
        <span className="text-14 font-bold">Tamanho do texto</span>
        <SegmentedTiles label="Tamanho do texto" options={textSizes} itemClassName="h-10" />
      </div>
      <CheckboxRow id={`reduzir-animacoes-${idSuffix}`} label="Reduzir animações" isSwitch />
      <CheckboxRow
        id={`ocultar-valores-${idSuffix}`}
        label="Ocultar valores ao abrir o app"
        isSwitch
      />
    </Panel>
  );
}

export function SecurityCard({ className, idSuffix }: WithIds) {
  return (
    <Panel className={cn("gap-2.5", className)}>
      <Title>Segurança e privacidade</Title>
      <CheckboxRow
        id={`biometria-${idSuffix}`}
        label="Entrar com biometria"
        description="Face ID ou digital"
        defaultChecked
        isSwitch
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">
          Aparelhos com acesso
        </span>
        <ul className="m-0 list-none p-0">
          {devices.map((device) => (
            <li key={device.id} className="flex items-center gap-3 border-b border-line py-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-shade text-mist">
                <Icon name={device.icon} size={18} />
              </span>
              <span className="flex min-w-0 grow flex-col leading-[1.35]">
                <span className="font-medium">{device.nome}</span>
                <span className="text-13 text-caption">{device.detalhe}</span>
              </span>
              <span
                className={cn(
                  "text-13 whitespace-nowrap",
                  "atual" in device ? "text-folha" : "text-caption",
                )}
              >
                {device.quando}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <a href="#" className={panelLinkClass}>
          Sair de todos os aparelhos
          <Icon name="chevron-right" size={16} />
        </a>
        <a href="#" className={panelLinkClass}>
          Baixar meus dados (LGPD)
          <Icon name="chevron-right" size={16} />
        </a>
        <a href="#" className="flex min-h-8 items-center text-14 font-bold text-urucum underline">
          Excluir conta
        </a>
      </div>
    </Panel>
  );
}
