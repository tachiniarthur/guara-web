"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { CardBody, CardNote } from "@/components/states/screen-state-context";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

import { countryExposure, type CountryExposure } from "../data";
import { InteractiveGlobe, type GlobeOrbit, type GlobePlace } from "../globe/interactive-globe";

type Variant = "desktop" | "tablet" | "mobile";

const colorHex = { tucano: "#F2C230", arara: "#6DB3EC", folha: "#6CC08E" } as const;
const dotColor = { tucano: "bg-tucano", arara: "bg-arara", folha: "bg-folha" } as const;
const textColor = { tucano: "text-tucano", arara: "text-arara", folha: "text-folha" } as const;

const places: GlobePlace[] = countryExposure.flatMap((c) =>
  c.globo
    ? [
        {
          id: c.id,
          iso: c.globo.iso,
          lat: c.globo.lat,
          lng: c.globo.lng,
          color: colorHex[c.cor],
          label: `${c.pais} · ${c.percentual}%`,
        },
      ]
    : [],
);

const stateless = countryExposure.find((c) => !c.globo);
const orbit: GlobeOrbit | undefined = stateless && {
  id: stateless.id,
  color: colorHex[stateless.cor],
  label: `${stateless.ativos[0]?.nome ?? stateless.pais} · ${stateless.percentual}%`,
};

const globeLabel = `Globo com a exposição por país: ${countryExposure
  .map((c) => `${c.pais} ${c.percentual}%`)
  .join(", ")}.`;

/** Ativos que o usuário tem naquele lugar (abre no item escolhido da lista). */
function PlaceAssets({ place, compact }: { place: CountryExposure; compact: boolean }) {
  return (
    <div className="flex flex-col gap-1 pb-3 pl-6">
      <span className={cn("text-caption", compact ? "text-12" : "text-13")}>
        {place.globo?.local ?? "Cripto, sem país de origem"}
      </span>
      <ul className="m-0 flex list-none flex-col p-0">
        {place.ativos.map((asset) => {
          const content = (
            <>
              <span className="min-w-0 grow truncate">{asset.nome}</span>
              <span className="shrink-0 text-mist tabular-nums">{asset.total}</span>
              {asset.slug ? (
                <Icon name="chevron-right" size={14} className="shrink-0 text-caption" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
            </>
          );
          const row = cn(
            "flex min-h-9 items-center gap-2 border-t border-line first:border-t-0",
            compact ? "text-13" : "text-14",
          );
          return (
            <li key={asset.nome}>
              {asset.slug ? (
                <Link
                  href={`/investimentos/${asset.slug}`}
                  className={cn(row, "text-sand no-underline hover:text-tucano")}
                >
                  {content}
                </Link>
              ) : (
                <span className={row}>{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Exposição por país: globo interativo (arrastar para girar), barra e lista. */
export function WorldCard({ variant }: { variant: Variant }) {
  const desktop = variant === "desktop";
  const mobile = variant === "mobile";
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ id: string; key: number } | null>(null);

  function choose(id: string | null) {
    setSelected(id);
    if (id && places.some((p) => p.id === id)) setFocus((f) => ({ id, key: (f?.key ?? 0) + 1 }));
  }

  const globe = (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center gap-2",
        desktop ? "max-w-[27.5rem]" : "max-w-[18.75rem]",
      )}
    >
      <InteractiveGlobe
        places={places}
        orbit={orbit}
        selectedId={selected}
        onSelect={choose}
        focusId={focus?.id}
        focusKey={focus?.key}
        label={globeLabel}
      />
      <span className="flex items-center gap-1.5 text-12 text-caption">
        <Icon name="refresh" size={14} />
        Arraste para girar · toque num país{desktop && " para ver os ativos"}
      </span>
    </div>
  );

  const details = (
    <>
      <div
        role="img"
        aria-label={countryExposure.map((c) => `${c.pais} ${c.percentual}%`).join(", ")}
        className="flex h-3 gap-0.5 overflow-hidden rounded-full"
      >
        {countryExposure.map((c) => (
          <span key={c.id} className={dotColor[c.cor]} style={{ width: `${c.percentual}%` }} />
        ))}
      </div>
      <ul className="m-0 list-none p-0">
        {countryExposure.map((c) => (
          <li key={c.id} className="border-b border-line">
            <button
              type="button"
              aria-expanded={selected === c.id}
              aria-controls={`ativos-${variant}-${c.id}`}
              onClick={() => choose(selected === c.id ? null : c.id)}
              className={cn(
                "-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-tile border-none bg-transparent px-2 py-3 text-left text-sand hover:bg-shade",
                selected === c.id && "bg-shade",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-3 shrink-0 rounded-full", dotColor[c.cor])}
              />
              <span className="flex min-w-0 grow flex-col leading-[1.35]">
                <strong className={desktop ? "text-15" : "text-14"}>{c.pais}</strong>
                <span className={cn("text-caption", desktop ? "text-13" : "text-12")}>
                  {c.detalhe}
                </span>
              </span>
              <span className="flex flex-col items-end leading-[1.35]">
                <strong
                  className={cn(
                    "font-display tabular-nums",
                    textColor[c.cor],
                    desktop ? "text-20" : "text-19",
                  )}
                >
                  {c.percentual}%
                </strong>
                <span
                  className={cn(
                    "whitespace-nowrap text-mist tabular-nums",
                    desktop ? "text-13" : "text-12",
                  )}
                >
                  {c.valor}
                </span>
              </span>
            </button>
            {selected === c.id && (
              <div id={`ativos-${variant}-${c.id}`}>
                <PlaceAssets place={c} compact={!desktop} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className={cn("m-0 leading-normal text-mist", desktop ? "text-14" : "text-13")}>
        <strong className="text-sand">18%</strong> do que você investiu não depende só da economia
        brasileira. Isso ajuda a diversificar o risco.
      </p>
    </>
  );

  return (
    <Panel className={cn("gap-3.5", mobile && "p-4")}>
      <PanelHeader
        title="Onde seu dinheiro está no mundo"
        subtitle={<CardNote>Exposição dos seus investimentos por país</CardNote>}
        titleClassName={mobile ? "text-18" : undefined}
      />
      <CardBody className="grow gap-3.5">
        {mobile ? (
          <>
            <div className="px-3">{globe}</div>
            {details}
          </>
        ) : (
          <div className="grid grow grid-cols-2 items-center gap-6">
            <div className="min-w-0">{globe}</div>
            <div className="flex min-w-0 flex-col gap-3.5">{details}</div>
          </div>
        )}
      </CardBody>
    </Panel>
  );
}
