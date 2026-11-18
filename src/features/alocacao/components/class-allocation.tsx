"use client";

import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import { diffColor, formatDiff, formatPercent } from "../format";
import type { ClassSlice, PortfolioAllocation, ProfileTarget } from "../live";
import { TargetBar, TargetNumbers } from "./allocation-parts";
import { Donut, type DonutSize } from "./donut";

/*
 * Alocação nas quatro classes da API: a carteira de hoje contra o alvo do perfil. Sem perfil
 * respondido, só a carteira (sem alvo, sem "fora do alvo").
 */

const describe = (items: { nome: string; value: number }[]) =>
  items.map((item) => `${item.nome} ${formatPercent(item.value)}`).join(", ");

/** Quadradinho na cor da classe. */
export function ClassSwatch({ color, size = 10 }: { color: string; size?: 10 | 12 }) {
  return (
    <span
      aria-hidden="true"
      className={cn("shrink-0", size === 12 ? "size-3 rounded-[4px]" : "size-2.5 rounded-[3px]")}
      style={{ background: color }}
    />
  );
}

/** Legenda das cores das classes. */
export function ClassLegend({ classes, className }: { classes: ClassSlice[]; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 text-13 text-mist",
        className,
      )}
    >
      {classes.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1.5">
          <ClassSwatch color={c.cor} />
          {c.nome}
        </span>
      ))}
    </div>
  );
}

/** "Responda o perfil": sem ele, não há alvo para comparar. */
export function NoProfileNote({ className }: { className?: string }) {
  return (
    <p className={cn("m-0 text-13 leading-[1.55] text-mist", className)}>
      Você ainda não respondeu o perfil de investidor, então não há alvo para comparar.{" "}
      <Link href="/perfil/investidor" className="font-bold text-sand underline">
        Responder o perfil
      </Link>
    </p>
  );
}

/** Par de roscas: a carteira de hoje ao lado do alvo do perfil (só a carteira, sem perfil). */
export function AllocationVsTarget({
  allocation,
  ativos,
  dims,
  className,
  titleClassName = "text-14",
  gapClassName = "gap-3",
}: {
  allocation: PortfolioAllocation;
  /** Quantas posições entram na conta (centro da rosca da carteira). */
  ativos: number;
  dims: DonutSize;
  className?: string;
  titleClassName?: string;
  gapClassName?: string;
}) {
  const { perfil, classes } = allocation;
  const current = classes.map((c) => ({ nome: c.nome, value: c.atual }));
  const portfolio = (
    <div className="flex min-w-0 flex-col items-center gap-2.5">
      <strong className={titleClassName}>Sua carteira</strong>
      <Donut
        arcs={classes.map((c) => ({ id: c.id, color: c.cor, value: c.atual }))}
        dims={dims}
        caption="Atual"
        value={ativos === 1 ? "1 ativo" : `${ativos} ativos`}
        label={`Sua carteira: ${describe(current)}`}
      />
    </div>
  );
  if (!perfil) {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        {portfolio}
        <NoProfileNote className="text-center" />
      </div>
    );
  }
  const target = classes.map((c) => ({ nome: c.nome, value: c.alvo ?? 0 }));
  return (
    <div className={cn("grid grid-cols-2", gapClassName, className)}>
      {portfolio}
      <div className="flex min-w-0 flex-col items-center gap-2.5">
        <strong className={titleClassName}>Perfil {perfil.nome}</strong>
        <Donut
          arcs={classes.map((c) => ({ id: c.id, color: c.cor, value: c.alvo ?? 0 }))}
          dims={dims}
          caption="Alvo"
          value={perfil.nome}
          label={`Alvo do perfil ${perfil.nome}: ${describe(target)}`}
        />
      </div>
    </div>
  );
}

/** A escala das barras: a maior porcentagem (atual ou alvo), com folga. */
const barScale = (classes: ClassSlice[]) =>
  Math.min(100, Math.max(10, ...classes.flatMap((c) => [c.atual, c.alvo ?? 0])) * 1.1);

/** Classe por classe: a barra da carteira com a marca do alvo. */
export function ClassBarList({
  allocation,
  stacked,
}: {
  allocation: PortfolioAllocation;
  /** Números na linha de baixo da barra (celular e tablet). */
  stacked?: boolean;
}) {
  const { classes, perfil } = allocation;
  const scale = barScale(classes);
  const summary = classes
    .map(
      (c) =>
        `${c.nome} ${formatPercent(c.atual)}${c.alvo === null ? "" : ` contra ${formatPercent(c.alvo)}`}`,
    )
    .join("; ");
  return (
    <ul
      role="img"
      aria-label={`Classe por classe${perfil ? `, sua carteira contra o alvo do perfil ${perfil.nome}` : ""}: ${summary}.`}
      className="m-0 flex list-none flex-col p-0"
    >
      {classes.map((c) => (
        <li key={c.id} className="flex flex-col gap-1.5 py-2">
          <div className="flex items-center gap-2.5">
            <ClassSwatch color={c.cor} />
            <span className="min-w-0 grow text-14 font-semibold">{c.nome}</span>
            {!stacked && <TargetNumbers atual={c.atual} alvo={c.alvo} />}
          </div>
          <TargetBar atual={c.atual} alvo={c.alvo} color={c.cor} scale={scale} />
          {stacked && (
            <div className="flex justify-end">
              <TargetNumbers atual={c.atual} alvo={c.alvo} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Cabeçalho da lista: o título e a legenda da marca do alvo. */
export function ClassBarHeading({
  title = "Classe por classe",
  withTarget,
}: {
  title?: string;
  withTarget: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <strong className="text-14">{title}</strong>
      {withTarget && (
        <span className="inline-flex items-center gap-1.5 text-12 text-caption">
          <span aria-hidden="true" className="h-3 w-0.5 bg-sand" />
          alvo do perfil
        </span>
      )}
    </div>
  );
}

/** "Fora do alvo em 2 de 4 classes. A maior diferença é Renda variável, 12,1 p.p. acima." */
export function OffTargetSummary({
  allocation,
  withBiggest = true,
  className,
}: {
  allocation: PortfolioAllocation;
  withBiggest?: boolean;
  className?: string;
}) {
  const { foraDoAlvo, classes } = allocation;
  const biggest = foraDoAlvo[0];
  if (!allocation.perfil) return null;
  return (
    <p className={cn("m-0 text-13 text-mist", className)}>
      {foraDoAlvo.length === 0 ? (
        <>
          <strong className="text-sand">Todas as classes</strong> estão dentro do alvo.
        </>
      ) : (
        <>
          Fora do alvo em{" "}
          <strong className="text-sand">
            {foraDoAlvo.length} de {classes.length} classes
          </strong>
          {withBiggest && biggest?.diff != null ? (
            <>
              . A maior diferença é <strong className="text-tucano">{biggest.nome}</strong>,{" "}
              <strong className="text-sand">
                {formatDiff(Math.abs(biggest.diff)).replace("+", "")}{" "}
                {biggest.diff > 0 ? "acima" : "abaixo"}
              </strong>
              .
            </>
          ) : (
            "."
          )}
        </>
      )}
    </p>
  );
}

/** Quatro números do topo da Alocação (tablet e desktop). */
export function AllocationTiles({
  allocation,
  ativos,
  large,
}: {
  allocation: PortfolioAllocation;
  ativos: number;
  large?: boolean;
}) {
  const { perfil, foraDoAlvo, classes } = allocation;
  const biggest = foraDoAlvo[0];
  const tiles = [
    {
      label: "Seu perfil",
      value: perfil?.nome ?? "—",
      hint: perfil ? `definido em ${perfil.definidoEm}` : "ainda não respondido",
    },
    {
      label: "Na alocação",
      value: allocation.total,
      hint: `${ativos === 1 ? "1 ativo" : `${ativos} ativos`} · sem os bens`,
    },
    {
      label: "Fora do alvo",
      value: perfil ? `${foraDoAlvo.length} de ${classes.length}` : "—",
      hint: "classes a mais de 2 p.p. do alvo",
      tone: "text-tucano",
    },
    {
      label: "Maior diferença",
      value: biggest?.diff != null ? formatDiff(biggest.diff) : "—",
      hint: biggest?.nome ?? "nenhuma classe fora do alvo",
      tone: "text-urucum",
    },
  ];
  return (
    <div className={cn("grid grid-cols-4 items-stretch", large ? "gap-5" : "gap-3")}>
      {tiles.map((tile) => (
        <Panel key={tile.label} className={cn("gap-1.5", large ? "p-5.5" : "p-4")}>
          <span className="text-14 text-mist">{tile.label}</span>
          <span
            className={cn(
              "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
              large ? "text-26" : "text-20",
              tile.tone ?? "text-sand",
            )}
          >
            {tile.value}
          </span>
          <span className="text-13 text-caption">{tile.hint}</span>
        </Panel>
      ))}
    </div>
  );
}

/** "Quanto falta para o alvo", em reais: embaixo do nome ("stacked") ou à direita ("side"). */
export function ClassGapList({
  allocation,
  layout,
}: {
  allocation: PortfolioAllocation;
  layout: "stacked" | "side";
}) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {allocation.classes.map((c) => {
        const distance = c.distanciaCents ?? 0;
        const color = diffColor(c.diff ?? 0);
        const gap =
          distance >= 0
            ? `${formatCurrency(distance)} acima`
            : `faltam ${formatCurrency(-distance)}`;
        const targetCents = c.valorCents - distance;
        const meta = `hoje ${c.valor} · alvo ${formatCurrency(targetCents)}`;
        return (
          <li key={c.id} className="flex items-center gap-3 border-b border-line py-3">
            <ClassSwatch color={c.cor} />
            <span className="flex min-w-0 grow flex-col leading-[1.35]">
              <span className="font-semibold">{c.nome}</span>
              {layout === "stacked" ? (
                <span className="text-12 text-caption">
                  <strong className="text-13" style={{ color }}>
                    {gap}
                  </strong>
                  <br />
                  {meta}
                </span>
              ) : (
                <span className="text-12 text-caption">{meta}</span>
              )}
            </span>
            {layout === "side" && (
              <span
                className="shrink-0 leading-[1.35] font-bold whitespace-nowrap tabular-nums"
                style={{ color }}
              >
                {gap}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** As mensagens neutras da API, classe por classe (o que está acima, abaixo ou no alvo). */
export function ClassMessages({ allocation }: { allocation: PortfolioAllocation }) {
  const messages = allocation.classes.filter((c) => c.mensagem);
  if (messages.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {messages.map((c) => (
        <li key={c.id} className="flex items-start gap-2.5 text-14 leading-[1.5] text-mist">
          <span className="mt-1.5">
            <ClassSwatch color={c.cor} />
          </span>
          {c.mensagem}
        </li>
      ))}
    </ul>
  );
}

/** Carteira-alvo de um perfil do questionário, com a carteira de hoje ao lado (Comparar perfis). */
export function ProfileTargetCard({
  profile,
  allocation,
}: {
  profile: ProfileTarget;
  allocation: PortfolioAllocation | undefined;
}) {
  const current = allocation?.perfil?.kind === profile.kind;
  const classes = allocation?.classes ?? [];
  return (
    <Panel className={cn("gap-3 p-5", current && "border-tucano")}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="m-0 font-display text-20 font-bold">{profile.nome}</h2>
        {current && <span className="text-13 font-bold text-tucano">Seu perfil</span>}
      </div>
      <p className="m-0 text-14 leading-[1.5] text-mist">{profile.descricao}</p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {classes.map((c) => {
          const alvo = profile.alvo[c.id];
          return (
            <li key={c.id} className="flex flex-col gap-1.5 py-1.5">
              <div className="flex items-center gap-2.5">
                <ClassSwatch color={c.cor} />
                <span className="min-w-0 grow text-14 font-semibold">{c.nome}</span>
                <TargetNumbers atual={c.atual} alvo={alvo} />
              </div>
              <TargetBar atual={c.atual} alvo={alvo} color={c.cor} scale={100} />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
