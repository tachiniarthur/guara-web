import { AgentTip } from "@/components/ui/agent-tip";
import { Button, ButtonLink } from "@/components/ui/button";
import { DetailGrid, DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { Tag } from "@/components/ui/tag";

import type { PriceAlertDetail } from "../price-alerts";
import { DirectionTag } from "./price-alert-list";
import { TargetLineChart } from "./target-line-chart";

type Props = { alert: PriceAlertDetail; fired?: boolean };

export function FiredTag() {
  return (
    <Tag tone="folha" status>
      <Icon name="check" size={14} strokeWidth={2} />
      Disparado
    </Tag>
  );
}

export function AlertSummary({ alert, fired }: Props) {
  return (
    <Panel className="gap-4 p-5.5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-[3.125rem] shrink-0 items-center justify-center rounded-[0.875rem] border border-line bg-canvas font-display text-20 font-bold"
        >
          {alert.simbolo}
        </span>
        <span className="flex grow flex-col leading-[1.3]">
          <strong className="text-20">{alert.ativo}</strong>
          <span className="text-13 text-mist">{alert.ticker} · cotação via Brapi</span>
        </span>
        {fired ? <FiredTag /> : <DirectionTag direcao={alert.direcao} status />}
      </div>
      <div className="grid grid-cols-1 items-stretch gap-2.5 @tab:grid-cols-3">
        <StatTile
          label="Preço-alvo"
          value={alert.alvo}
          hint={alert.alvoNota}
          valueClassName="text-19"
        />
        <StatTile
          label={fired ? "Cotação no aviso" : "Cotação agora"}
          value={fired ? alert.disparo.cotacao : alert.agora}
          hint={fired ? alert.disparo.hora : alert.agoraHora}
          valueClassName="text-19"
        />
        <StatTile
          label="Distância até o alvo"
          value={fired ? "atingido" : alert.distancia}
          hint={fired ? "—" : alert.distanciaValor}
          valueClassName={fired ? "text-19 text-folha" : "text-19 text-tucano"}
        />
      </div>
    </Panel>
  );
}

export function AlertActions({ alert, fired }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {fired ? (
        <ButtonLink href={`/alertas/precos/${alert.id}/editar`} variant="primary" size="sm">
          <Icon name="retry" size={18} />
          <span>Renovar com outro alvo</span>
        </ButtonLink>
      ) : (
        <>
          <ButtonLink href={`/alertas/precos/${alert.id}/editar`} variant="secondary" size="sm">
            <Icon name="edit" size={18} />
            <span>Editar</span>
          </ButtonLink>
          <Button variant="secondary" size="sm">
            <Icon name="pause" size={18} />
            <span>Pausar</span>
          </Button>
        </>
      )}
      <ButtonLink
        href={`/alertas/precos/${alert.id}?${fired ? "estado=disparado&" : ""}cancelar`}
        scroll={false}
        variant="danger-outline"
        size="sm"
      >
        <span>Cancelar alerta</span>
      </ButtonLink>
    </div>
  );
}

export function AlertChart({
  alert,
  fired,
  wide,
  className,
}: Props & { wide?: boolean; className?: string }) {
  const target = Number(alert.alvo.replace(/[^\d,]/g, "").replace(",", "."));
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader
        title="Últimos 30 dias"
        subtitle="Linha verde: seu alvo"
        titleClassName="text-18 tracking-normal"
      />
      <TargetLineChart
        prices={fired ? [...alert.precos, alert.disparo.valor] : alert.precos}
        lastLabel={fired ? "hoje" : "23/09"}
        low={alert.faixa.baixo}
        high={alert.faixa.alto}
        target={{ value: target, label: `alvo ${alert.alvo}` }}
        tickLabel={alert.faixa.rotulo}
        label={`${alert.ativo} nos últimos 30 dias: mínima ${alert.minima}, máxima ${alert.maxima}, agora ${alert.agora}; linha do alvo em ${alert.alvo}`}
        wide={wide}
      />
      <DetailGrid
        items={[
          { label: "Mínima em 30 dias", value: alert.minima },
          { label: "Máxima em 30 dias", value: alert.maxima },
        ]}
      />
    </Panel>
  );
}

export function AlertAbout({ alert, fired }: Props) {
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader title="Sobre o alerta" titleClassName="text-18 tracking-normal" />
      <DetailList
        items={[
          { label: "Tipo", value: alert.tipo },
          { label: "Criado em", value: alert.criadoEm },
          { label: "Onde avisa", value: "Celular e e-mail" },
          {
            label: "Situação",
            value: fired ? "Pausado depois do aviso" : "Ativo · confere a cada cotação",
          },
        ]}
      />
    </Panel>
  );
}

export function AlertFirings({ alert, fired, className }: Props & { className?: string }) {
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader title="Disparos" titleClassName="text-18 tracking-normal" />
      {fired ? (
        <RowList>
          <ListRow
            title={alert.disparo.quando}
            meta={`${alert.disparo.cotacao} · avisado no celular e no e-mail`}
            value={
              <Tag tone="folha" status>
                Disparado
              </Tag>
            }
            divider={false}
          />
        </RowList>
      ) : (
        <p className="m-0 text-14 leading-[1.55] text-mist">
          Ainda não disparou. Quando o preço chegar ao alvo, avisamos uma única vez e o alerta pausa
          até você decidir.
        </p>
      )}
    </Panel>
  );
}

export function NextStepPanel() {
  return (
    <Panel className="grow gap-3.5 p-5.5">
      <PanelHeader title="Próximo passo" titleClassName="text-18 tracking-normal" />
      <p className="m-0 text-14 leading-[1.55] text-mist">
        Defina um novo alvo para continuar acompanhando ou cancele o alerta.
      </p>
    </Panel>
  );
}

export function CarameloTip({ alert, fired }: Props) {
  return (
    <AgentTip agent="caramelo" named>
      {fired
        ? `Au! O ${alert.ativo} passou de ${alert.alvo} às 15:12. Avisei no celular e no e-mail. Pausei o alerta: quer renovar com outro alvo ou encerrar?`
        : `Estou de olho: confiro o ${alert.ativo} a cada cotação e aviso uma vez quando chegar a ${alert.alvo}.`}
    </AgentTip>
  );
}
