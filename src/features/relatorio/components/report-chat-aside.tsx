"use client";

import Link from "next/link";
import { useState } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { chipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { MessageComposer } from "@/features/conversas/components/message-composer";
import { AgentReply } from "@/features/conversas/components/thread-parts";
import { cn } from "@/lib/utils";

const suggestions = ["Sim, separe fixo e variável", "Compare com agosto"];

/**
 * Conversa fixa à direita do Relatório no tablet deitado: o Tamanduá comenta o mês e responde
 * perguntas sobre o relatório. No desktop o relatório usa o painel de conversas comum.
 */
export function ReportChatAside({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <aside
      aria-label="Conversa com Tamanduá"
      className={cn(
        "sticky top-0 h-dvh w-90 shrink-0 flex-col border-l border-line bg-card",
        className,
      )}
    >
      <header className="flex h-[4.3125rem] shrink-0 items-center gap-2.5 border-b border-line pr-3 pl-4">
        <AgentAvatar agent="tamandua" size={34} variant="ring" />
        <span className="flex grow flex-col leading-[1.3]">
          <strong className="text-15">Tamanduá</strong>
          <span className="text-12 text-caption">Lendo este relatório com você</span>
        </span>
        <Link
          href="/conversas/gastos-setembro"
          aria-label="Abrir em tela cheia"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-mist hover:bg-shade"
        >
          <Icon name="expand" />
        </Link>
        <IconButton
          icon="x"
          label="Fechar conversa"
          variant="ghost"
          onClick={() => setOpen(false)}
        />
      </header>
      <div className="flex grow flex-col gap-4 overflow-y-auto p-4.5">
        <AgentReply agent="tamandua">
          <p className="m-0 text-15 leading-[1.6]">
            Farejei setembro até agora: sobraram <strong>R$ 2.287,53</strong>. Sem a compra de
            eletrônicos, seria o seu melhor mês desde maio.
          </p>
          <p className="m-0 text-15 leading-[1.6]">
            Quer que eu separe o que é gasto fixo do que é variável?
          </p>
        </AgentReply>
        <div role="group" aria-label="Sugestões" className="flex flex-col items-start gap-2">
          {suggestions.map((item) => (
            <button key={item} type="button" className={chipClass(false)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <MessageComposer placeholder="Pergunte sobre este relatório" className="px-3.5 pt-3 pb-4" />
    </aside>
  );
}
