"use client";

import { useState, type ReactNode } from "react";

import type { ScreenState } from "@/components/states/screen-state";
import {
  ErrorBlock,
  FilterEmptyBlock,
  StateBlock,
  StateSwap,
} from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { ListFilter } from "@/components/ui/list-filter";

import { notifications, type AppNotification } from "../data";
import { NotificationCard, NotificationGroupTitle, NotificationList } from "./notification-list";

const filters = ["Todas", "Gastos", "Investimentos", "Conta"] as const;
type Filter = (typeof filters)[number];

const matches = (filter: Filter) => (item: AppNotification) =>
  filter === "Todas" || item.categoria === filter.toLowerCase();

/**
 * Filtro e listas de avisos (novas e anteriores). O filtro vale de verdade: com
 * `?estado=vazio-filtro` ele abre em "Investimentos", que ainda não tem avisos.
 * `aside` são os painéis da coluna da direita no desktop (e do fim da tela no mobile).
 */
export function NotificationsFeed({
  state,
  channels,
  month,
}: {
  state: ScreenState | null;
  channels: ReactNode;
  month: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>(
    state === "vazio-filtro" ? "Investimentos" : "Todas",
  );
  const items = state === "vazio" ? [] : notifications.filter(matches(filter));
  const fresh = items.filter((n) => n.nova);
  const older = items.filter((n) => !n.nova);
  const failed = state === "erro";

  const emptyCard =
    items.length > 0 ? null : state === "vazio" ? (
      <NotificationCard className="min-h-62">
        <StateBlock
          icon="check"
          title="Tudo em dia"
          action={
            <ButtonLink href="/perfil" size="md">
              <span>Escolher como receber</span>
            </ButtonLink>
          }
        >
          Você não tem notificações. Avisos de tetos, preços e compras fora do padrão aparecem aqui.
        </StateBlock>
      </NotificationCard>
    ) : (
      <NotificationCard className="min-h-85">
        <FilterEmptyBlock onClear={() => setFilter("Todas")}>
          {`Nenhuma notificação de ${filter}. Seus 3 alertas de preço ainda não dispararam.`}
        </FilterEmptyBlock>
      </NotificationCard>
    );

  const lists = (
    <>
      {fresh.length > 0 && <NotificationList items={fresh} failed={failed} />}
      {older.length > 0 && (
        <>
          <NotificationGroupTitle className="mt-2 @desk:mt-0">Anteriores</NotificationGroupTitle>
          <StateSwap replacement={failed && <ErrorBlock />}>
            <NotificationList items={older} />
          </StateSwap>
        </>
      )}
      {emptyCard}
    </>
  );

  return (
    <>
      <ListFilter
        options={[...filters]}
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        label="Filtrar notificações"
        className="-mr-4 overflow-hidden @tab:mr-0 @tab:flex-wrap"
      />
      {fresh.length > 0 && (
        <NotificationGroupTitle>{`Novas · ${fresh.length}`}</NotificationGroupTitle>
      )}

      <div className="contents @desk:hidden">
        {lists}
        {channels}
      </div>

      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
        <div className="flex min-w-0 flex-col gap-3">{lists}</div>
        <div className="flex min-w-0 flex-col gap-5">
          {channels}
          {month}
        </div>
      </div>
    </>
  );
}
