import { Fragment } from "react";

import { Note } from "@/components/ui/note";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

import {
  diffColor,
  formatDiff,
  groupById,
  groups,
  offTargetGroups,
  portfolioAllocation,
  profileById,
} from "../data";
import { GroupSwatch } from "./allocation-parts";

const pct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** "Sua carteira está fora do alvo em 3 de 5 grupos: Renda variável Brasil 17,2 p.p. acima, …" */
export function OffTargetNote({ className, after }: { className?: string; after?: string }) {
  const fora = offTargetGroups();
  return (
    <Note icon="alert-triangle" tone="warning" className={cn("gap-2.5", className)}>
      Sua carteira está fora do alvo em {fora.length} de {groups.length} grupos:{" "}
      {fora.map(({ grupo, diff }, i) => (
        <Fragment key={grupo.id}>
          <strong>{grupo.nome}</strong>
          {` ${pct.format(Math.abs(diff))} p.p. ${diff > 0 ? "acima" : "abaixo"}${
            i < fora.length - 2
              ? ", "
              : i === fora.length - 2
                ? " e "
                : `.${after ? ` ${after}` : ""}`
          }`}
        </Fragment>
      ))}
    </Note>
  );
}

/** Números de cabeçalho: perfil, total na alocação, grupos fora do alvo e maior diferença. */
export function allocationStats() {
  const fora = offTargetGroups();
  const maior = fora[0];
  return {
    perfil: profileById[portfolioAllocation.perfil].nome,
    fora: `${fora.length} de ${groups.length} grupos`,
    maior: maior && { grupo: maior.grupo.nome, diff: formatDiff(maior.diff) },
  };
}

/** Quatro números do topo (tablet e desktop). */
export function AllocationStatTiles({ large }: { large?: boolean }) {
  const stats = allocationStats();
  const tiles = [
    {
      label: "Seu perfil",
      value: stats.perfil,
      hint: `definido em ${portfolioAllocation.definidoEm}`,
    },
    {
      label: "Na alocação",
      value: portfolioAllocation.total,
      hint: `${portfolioAllocation.ativos} ativos · sem os bens`,
    },
    {
      label: "Fora do alvo",
      value: stats.fora,
      hint: "diferença maior que 5 p.p.",
      tone: "text-tucano",
    },
    {
      label: "Maior diferença",
      value: stats.maior?.diff,
      hint: stats.maior?.grupo,
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

/**
 * "Quanto falta para o alvo" em reais: a distância embaixo do nome ("stacked") ou à direita
 * ("side", desktop).
 */
export function TargetGapList({ layout }: { layout: "stacked" | "side" }) {
  const alvo = profileById[portfolioAllocation.perfil].alvo;
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {portfolioAllocation.emReais.map((item) => {
        const group = groupById[item.grupo];
        const color = diffColor(portfolioAllocation.atual[item.grupo] - alvo[item.grupo]);
        const meta = `hoje ${item.hoje} · alvo ${item.alvo}`;
        return (
          <li key={item.grupo} className="flex items-center gap-3 border-b border-line py-3">
            <GroupSwatch id={item.grupo} />
            <span className="flex min-w-0 grow flex-col leading-[1.35]">
              <span className="font-semibold">{group.nome}</span>
              {layout === "stacked" ? (
                <span className="text-12 text-caption">
                  <strong className="text-13" style={{ color }}>
                    {item.falta}
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
                {item.falta}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
