"use client";

import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConversationList } from "@/features/conversas/components/conversation-list";
import {
  ConversationSearch,
  useDebounced,
} from "@/features/conversas/components/conversation-search";

export default function HistoricoConversasPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query);
  return (
    <>
      <MobileHeader title="Conversas" account />
      <div className="hidden border-b border-line px-7 py-2.5 @tab:flex">
        <Breadcrumb className="flex-wrap" items={[{ label: "Conversas" }]} />
      </div>
      <header className="hidden h-[4.5625rem] items-center gap-2 border-b border-line pr-5 pl-7 @tab:flex">
        <div className="grow leading-[1.3]">
          <h1 className="m-0 font-display text-22 font-bold tracking-[-0.01em]">
            Histórico de conversas
          </h1>
          <span className="text-13 text-caption">Suas conversas com o Guará</span>
        </div>
        <ButtonLink href="/conversas" variant="forest" className="text-15">
          <Icon name="plus" size={18} />
          <span>Nova conversa</span>
        </ButtonLink>
      </header>
      <div className="flex flex-col gap-4 px-4 pt-1 pb-27 @tab:px-7 @tab:py-6">
        <ButtonLink
          href="/conversas"
          variant="forest"
          size="lg"
          block
          className="text-15 @tab:hidden"
        >
          <Icon name="plus" size={18} />
          <span>Nova conversa</span>
        </ButtonLink>
        <ConversationSearch
          id="busca-conversas"
          value={query}
          onChange={setQuery}
          inputClassName="h-[2.875rem] @tab:h-12"
        />
        <div className="flex flex-col">
          <ConversationList query={debounced} />
        </div>
      </div>
    </>
  );
}
