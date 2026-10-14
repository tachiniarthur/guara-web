import { Icon } from "@/components/ui/icon";
import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

import {
  diffColor,
  formatDiff,
  formatPercent,
  groups,
  profileById,
  portfolioAllocation,
  type GroupId,
  type ProfileId,
} from "../data";

type DonutSize = { size: number; radius: number; stroke: number; value: number };

/** Tamanhos das roscas nos protótipos (lado, raio, espessura e corpo do número central). */
export const donutSizes = {
  lg: { size: 170, radius: 71, stroke: 24, value: 16 },
  md: { size: 160, radius: 66, stroke: 22, value: 16 },
  sm: { size: 128, radius: 50, stroke: 18, value: 14 },
  result: { size: 150, radius: 61, stroke: 21, value: 16 },
  card: { size: 132, radius: 52, stroke: 18, value: 14 },
  xl: { size: 180, radius: 76, stroke: 25, value: 16 },
  cardTablet: { size: 130, radius: 51, stroke: 18, value: 14 },
  xs: { size: 104, radius: 38, stroke: 15, value: 14 },
} satisfies Record<string, DonutSize>;

/** Rosca dos 5 grupos, começando às 12h, com rótulo e valor no centro. */
export function GroupDonut({
  values,
  dims,
  caption,
  value,
  label,
}: {
  values: Record<GroupId, number>;
  dims: DonutSize;
  /** Linha de cima do centro ("Atual", "Alvo"). */
  caption: string;
  /** Linha de baixo do centro ("12 ativos", "Moderado"). */
  value: string;
  /** Rótulo acessível. */
  label: string;
}) {
  const { size, radius, stroke } = dims;
  const c = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = groups.reduce((sum, g) => sum + values[g.id], 0);
  const lengths = groups.map((g) => (values[g.id] / total) * circumference);
  const arcs = groups.flatMap((g, i) => {
    const start = lengths.slice(0, i).reduce((sum, l) => sum + l, 0);
    const length = lengths[i] ?? 0;
    return values[g.id] > 0 ? [{ id: g.id, color: g.cor, length, start }] : [];
  });
  return (
    <svg
      width={rem(size)}
      height={rem(size)}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className="block shrink-0"
    >
      <circle cx={c} cy={c} r={radius} fill="none" stroke="#1A241F" strokeWidth={stroke} />
      {arcs.map((arc) => (
        <circle
          key={arc.id}
          cx={c}
          cy={c}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${(arc.length - 2).toFixed(1)} ${(circumference - arc.length + 2).toFixed(1)}`}
          strokeDashoffset={(-arc.start).toFixed(1)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      ))}
      <text
        x={c}
        y={c - 6}
        textAnchor="middle"
        fontSize="12"
        fill="#93A198"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {caption}
      </text>
      <text
        x={c}
        y={c + 14}
        textAnchor="middle"
        fontSize={dims.value}
        fontWeight="700"
        fill="#F2EFE6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </text>
    </svg>
  );
}

function describe(values: Record<GroupId, number>) {
  return groups.map((g) => `${g.nome} ${formatPercent(values[g.id])}`).join(", ");
}

/** Par de roscas: a carteira real ao lado do alvo do perfil. */
export function PortfolioVsTarget({
  dims,
  profile = portfolioAllocation.perfil,
  className,
  titleClassName = "text-14",
  gapClassName = "gap-3",
}: {
  dims: DonutSize;
  profile?: ProfileId;
  className?: string;
  titleClassName?: string;
  gapClassName?: string;
}) {
  const target = profileById[profile];
  return (
    <div className={cn("grid grid-cols-2", gapClassName, className)}>
      <div className="flex min-w-0 flex-col items-center gap-2.5">
        <strong className={titleClassName}>Sua carteira</strong>
        <GroupDonut
          values={portfolioAllocation.atual}
          dims={dims}
          caption="Atual"
          value={`${portfolioAllocation.ativos} ativos`}
          label={`Sua carteira: ${describe(portfolioAllocation.atual)}`}
        />
      </div>
      <div className="flex min-w-0 flex-col items-center gap-2.5">
        <strong className={titleClassName}>Perfil {target.nome}</strong>
        <GroupDonut
          values={target.alvo}
          dims={dims}
          caption="Alvo"
          value={target.nome}
          label={`Alvo do perfil ${target.nome}: ${describe(target.alvo)}`}
        />
      </div>
    </div>
  );
}

/** Quadradinho na cor do grupo. */
export function GroupSwatch({ id, size = 10 }: { id: GroupId; size?: 10 | 12 }) {
  const group = groups.find((g) => g.id === id);
  return (
    <span
      aria-hidden="true"
      className={cn("shrink-0", size === 12 ? "size-3 rounded-[4px]" : "size-2.5 rounded-[3px]")}
      style={{ background: group?.cor }}
    />
  );
}

/** Legenda das cores dos 5 grupos. */
export function GroupLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 text-13 text-mist",
        className,
      )}
    >
      {groups.map((g) => (
        <span key={g.id} className="inline-flex items-center gap-1.5">
          <GroupSwatch id={g.id} />
          {g.nome}
        </span>
      ))}
    </div>
  );
}

/** Barra da carteira (preenchida) com a marca branca do alvo do perfil. */
export function TargetBar({
  atual,
  alvo,
  color,
  scale,
  size = "md",
}: {
  atual: number;
  alvo: number;
  color: string;
  /** Percentual que ocupa a barra inteira. */
  scale: number;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <div
      aria-hidden="true"
      className={cn("relative bg-shade", lg ? "h-2.5 rounded-[5px]" : "h-2 rounded-[4px]")}
    >
      <div
        className={cn(lg ? "h-2.5 rounded-[5px]" : "h-2 rounded-[4px]")}
        style={{ width: `${((atual / scale) * 100).toFixed(1)}%`, background: color }}
      />
      <span
        className={cn("absolute -top-1 w-0.5 rounded-[1px] bg-sand", lg ? "h-4.5" : "h-4")}
        style={{ left: `calc(${(alvo / scale) * 100}% - 1px)` }}
      />
    </div>
  );
}

/** "alvo 48% · atual 46% · −2 p.p." */
export function TargetNumbers({
  atual,
  alvo,
  className,
  diffClassName = "min-w-[4.375rem]",
}: {
  atual: number;
  alvo: number;
  className?: string;
  diffClassName?: string;
}) {
  const diff = atual - alvo;
  return (
    <span
      className={cn("flex items-baseline gap-3 text-13 whitespace-nowrap tabular-nums", className)}
    >
      <span className="text-caption">
        alvo <strong className="text-sand">{formatPercent(alvo)}</strong>
      </span>
      <span className="text-caption">
        atual <strong className="text-sand">{formatPercent(atual)}</strong>
      </span>
      <strong className={cn("text-right", diffClassName)} style={{ color: diffColor(diff) }}>
        {formatDiff(diff)}
      </strong>
    </span>
  );
}

/** Lista "Grupo por grupo" (Investimentos e Adicionar investimento). */
export function GroupBarList({
  stacked,
  scale = 60,
  profile = portfolioAllocation.perfil,
}: {
  /** Números na linha de baixo da barra (celular e tablet). */
  stacked?: boolean;
  scale?: number;
  profile?: ProfileId;
}) {
  const target = profileById[profile];
  const summary = groups
    .map(
      (g) =>
        `${g.nome} ${formatPercent(portfolioAllocation.atual[g.id])} contra ${formatPercent(target.alvo[g.id])}`,
    )
    .join("; ");
  return (
    <ul
      role="img"
      aria-label={`Grupo por grupo, sua carteira contra o alvo do perfil ${target.nome}: ${summary}.`}
      className="m-0 flex list-none flex-col p-0"
    >
      {groups.map((g) => {
        const atual = portfolioAllocation.atual[g.id];
        const alvo = target.alvo[g.id];
        return (
          <li key={g.id} className="flex flex-col gap-1.5 py-2">
            <div className="flex items-center gap-2.5">
              <GroupSwatch id={g.id} />
              <span className="min-w-0 grow text-14 font-semibold">{g.nome}</span>
              {!stacked && <TargetNumbers atual={atual} alvo={alvo} />}
            </div>
            <TargetBar atual={atual} alvo={alvo} color={g.cor} scale={scale} />
            {stacked && (
              <div className="flex justify-end">
                <TargetNumbers atual={atual} alvo={alvo} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Cabeçalho da lista: "Grupo por grupo" e a legenda da marca do alvo. */
export function GroupBarHeading({ title = "Grupo por grupo" }: { title?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <strong className="text-14">{title}</strong>
      <span className="inline-flex items-center gap-1.5 text-12 text-caption">
        <span aria-hidden="true" className="h-3 w-0.5 bg-sand" />
        alvo do perfil
      </span>
    </div>
  );
}

/** Rosca do alvo de um perfil ao lado da lista de percentuais por grupo. */
export function TargetDonutWithList({
  profile = portfolioAllocation.perfil,
  dims,
}: {
  profile?: ProfileId;
  dims: DonutSize;
}) {
  const target = profileById[profile];
  return (
    <div className="flex items-center justify-center gap-6 md:justify-start">
      <GroupDonut
        values={target.alvo}
        dims={dims}
        caption="Alvo"
        value={target.nome}
        label={`Carteira-alvo do perfil ${target.nome}: ${describe(target.alvo)}`}
      />
      <ul className="m-0 hidden min-w-0 grow list-none p-0 md:block">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center gap-2 py-1 text-14">
            <GroupSwatch id={g.id} />
            <span className="min-w-0 grow">{g.nome}</span>
            <strong className="tabular-nums">{formatPercent(target.alvo[g.id])}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubclassNumbers({ atual, alvo }: { atual: number; alvo: number }) {
  const diff = atual - alvo;
  return (
    <span className="flex items-baseline gap-3 text-13 whitespace-nowrap tabular-nums">
      <span className="text-caption">alvo {formatPercent(alvo)}</span>
      <span className="font-bold">{formatPercent(atual)}</span>
      <span className="min-w-18 text-right font-bold" style={{ color: diffColor(diff) }}>
        {formatDiff(diff)}
      </span>
    </span>
  );
}

/**
 * Grupos da carteira-alvo que abrem as subclasses (Alocação e resultado do perfil).
 * "wide": números ao lado do nome · "compact": números embaixo da barra (celular e tablet).
 */
export function GroupDetailsList({
  layout,
  openGroup,
  scale = 80,
  profile = portfolioAllocation.perfil,
  targetOnly,
}: {
  layout: "wide" | "compact";
  /** Só o alvo do perfil (sem a carteira atual), como no "Seu perfil hoje". */
  targetOnly?: boolean;
  /** Grupos que já começam abertos ("all": todos). */
  openGroup?: GroupId | GroupId[] | "all";
  scale?: number;
  profile?: ProfileId;
}) {
  const wide = layout === "wide";
  const target = profileById[profile];
  return (
    <div>
      {groups.map((g) => {
        const alvo = target.alvo[g.id];
        const atual = targetOnly ? alvo : portfolioAllocation.atual[g.id];
        const diff = atual - alvo;
        const subclasses = portfolioAllocation.subclasses.filter((s) => s.grupo === g.id);
        const numbers = targetOnly ? (
          <span className="text-13 text-caption">
            alvo <strong className="text-sand">{formatPercent(alvo)}</strong>
          </span>
        ) : (
          <>
            <span className="text-13 text-caption">
              alvo <strong className="text-sand">{formatPercent(alvo)}</strong>
            </span>
            <span className="text-13 text-caption">
              atual <strong className="text-sand">{formatPercent(atual)}</strong>
            </span>
            <strong className="min-w-18 text-right text-13" style={{ color: diffColor(diff) }}>
              {formatDiff(diff)}
            </strong>
          </>
        );
        return (
          <details
            key={g.id}
            open={
              openGroup === "all" ||
              (Array.isArray(openGroup) ? openGroup.includes(g.id) : g.id === openGroup)
            }
            className="group border-b border-line py-3"
          >
            <summary className="flex cursor-pointer list-none flex-col gap-2 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <GroupSwatch id={g.id} size={12} />
                <strong className={cn("min-w-0 grow", targetOnly ? "text-14" : "text-15")}>
                  {g.nome}
                </strong>
                {wide && (
                  <span className="flex items-baseline gap-3.5 whitespace-nowrap tabular-nums">
                    {numbers}
                  </span>
                )}
                <span aria-hidden="true" className="flex text-caption group-open:rotate-90">
                  <Icon name="chevron-right" size={16} />
                </span>
              </span>
              <TargetBar atual={atual} alvo={alvo} color={g.cor} scale={scale} size="lg" />
              {!wide && (
                <span className="flex justify-between gap-2.5 whitespace-nowrap tabular-nums">
                  {numbers}
                </span>
              )}
            </summary>
            <ul className="m-0 mt-2.5 list-none p-0">
              {subclasses.map((s) => (
                <li
                  key={s.nome}
                  className={cn(
                    "gap-1 border-t border-line py-[0.5625rem] pl-5.5",
                    wide
                      ? "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3"
                      : "flex flex-col",
                  )}
                >
                  <span className="flex min-w-0 flex-col leading-[1.35]">
                    <span className="text-14 font-semibold">{s.nome}</span>
                    {s.detalhe && (
                      <span className="text-12 text-caption">
                        {targetOnly ? s.detalhe.split(" · ")[0] : s.detalhe}
                      </span>
                    )}
                  </span>
                  {targetOnly ? (
                    <span className="flex items-baseline gap-3 text-13 whitespace-nowrap tabular-nums">
                      <span className="text-caption">alvo {formatPercent(s.alvo)}</span>
                    </span>
                  ) : (
                    <SubclassNumbers atual={s.atual} alvo={s.alvo} />
                  )}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

/** Nível do perfil na escala de 4 (Conservador · Moderado · Arrojado · Sofisticado). */
export function ProfileLevels({ profile = portfolioAllocation.perfil }: { profile?: ProfileId }) {
  const levels = ["conservador", "moderado", "arrojado", "sofisticado"] as const;
  const index = levels.indexOf(profile);
  const nome = profileById[profile].nome;
  return (
    <div
      role="img"
      aria-label={`Seu perfil: ${nome}, o ${index + 1}º de 4 níveis: Conservador, Moderado, Arrojado e Sofisticado`}
      className="flex gap-1.5"
    >
      {levels.map((level) => {
        const current = level === profile;
        return (
          <div key={level} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className={cn("h-2 w-full rounded-[4px]", current ? "bg-tucano" : "bg-shade")} />
            <span
              className={cn(
                "text-13",
                current ? "font-extrabold text-sand" : "font-medium text-caption",
              )}
            >
              {profileById[level].nome}
            </span>
          </div>
        );
      })}
    </div>
  );
}
