"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { dropdownPillClass } from "@/components/ui/chip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Switch } from "@/components/ui/switch";

import { compareOptions } from "../more";

const periods = [
  { value: "1M", label: "1M" },
  { value: "YTD", label: "YTD" },
  { value: "1A", label: "1A" },
  { value: "5A", label: "5A" },
] as const;

/** Interruptor "Preço ajustado"; com `href`, mudar leva para a outra visão do gráfico. */
function AdjustedSwitch({ checked, href }: { checked: boolean; href?: string }) {
  const router = useRouter();
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-14 font-semibold text-mist">
      <Switch size="sm" defaultChecked={checked} onChange={() => href && router.push(href)} />
      Preço ajustado
    </label>
  );
}

/** Período, "Comparar com" (abre o diálogo) e o interruptor de preço ajustado. */
export function ChartControls({
  compare,
  adjusted,
  adjustHref,
}: {
  compare: string;
  adjusted: boolean;
  /** Para onde levar quando o interruptor muda (ex.: o detalhe do ativo, com o ajuste ligado). */
  adjustHref?: string;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const next = new URLSearchParams(params);
  next.set("escolher", "");
  return (
    <>
      <div className="flex items-center gap-2.5">
        <PillToggle label="Período" options={periods} defaultValue="1A" textClassName="text-13" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Link
          href={`${pathname}?${next.toString().replace("escolher=", "escolher")}`}
          scroll={false}
          className={dropdownPillClass}
        >
          Comparar com: {compare}
          <Icon name="chevron-down" size={14} />
        </Link>
        <AdjustedSwitch checked={adjusted} href={adjustHref} />
      </div>
    </>
  );
}

/**
 * "Comparar com" (`?escolher`): índices para pôr ao lado do ativo no gráfico. Abre com o índice
 * atual marcado, ou com o de `?escolher=<índice>` (escolha em andamento).
 */
export function CompareDialog({ current }: { current: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  if (!params.has("escolher")) return null;
  const picked = compareOptions.find((option) => option.value === params.get("escolher"));

  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("escolher");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("comparar");
    router.replace(`${pathname}?comparar=${value}`, { scroll: false });
  };

  return (
    <ConfirmDialog title="Comparar com" onClose={close} className="md:w-[28.75rem] lg:w-[32.5rem]">
      <form onSubmit={apply} className="flex flex-col gap-3.5 md:gap-4">
        <fieldset
          aria-label="Comparar com"
          className="m-0 flex flex-col gap-3.5 border-none p-0 md:gap-4"
        >
          {compareOptions.map((option) => (
            <RadioCard
              key={option.value}
              name="comparar"
              value={option.value}
              title={option.nome}
              description={option.texto}
              defaultChecked={picked ? option === picked : option.nome === current}
            />
          ))}
        </fieldset>
        <Button type="submit" variant="primary" size="lg" block>
          <span>Aplicar</span>
        </Button>
      </form>
    </ConfirmDialog>
  );
}
