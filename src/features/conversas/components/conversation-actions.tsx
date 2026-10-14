"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { Icon, type IconName } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useChatPanel } from "@/stores/chat-panel";

type MenuItem = { icon: IconName; label: string; detail?: string; danger?: boolean };

function MenuList({ items, onPick }: { items: MenuItem[]; onPick: (item: MenuItem) => void }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => onPick(item)}
            className={cn(
              "flex min-h-[3.8125rem] w-full items-center gap-3.5 border-x-0 border-t-0 border-b border-line bg-transparent px-1.5 py-1 text-left",
              item.danger ? "text-urucum" : "text-sand",
            )}
          >
            <span className={item.danger ? "text-urucum" : "text-mist"}>
              <Icon name={item.icon} />
            </span>
            <span className="flex grow flex-col leading-[1.35]">
              <span className="text-16 font-semibold">{item.label}</span>
              {item.detail && <span className="text-13 text-caption">{item.detail}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Mais opções da conversa": folha no celular, menu suspenso no tablet e no desktop. "Apagar
 * conversa" pede confirmação. `initial` abre já aberto (links como `?estado=menu`).
 */
export function ConversationMenu({
  title,
  agentName,
  keepNote,
  initial,
}: {
  title: string;
  agentName: string;
  /** O que não é apagado junto com a conversa. */
  keepNote: string;
  initial?: "menu" | "apagar";
}) {
  const [open, setOpen] = useState<"menu" | "apagar" | null>(initial ?? null);
  const items: MenuItem[] = [
    { icon: "edit", label: "Renomear conversa", detail: `Agora: ${title}` },
    { icon: "pin", label: "Fixar no topo", detail: "Fica primeiro no histórico" },
    { icon: "upload", label: "Compartilhar", detail: "Gera um resumo sem valores de saldo" },
    { icon: "arrow-down-to", label: "Exportar em PDF" },
    { icon: "trash", label: "Apagar conversa", detail: "Não dá para desfazer", danger: true },
  ];

  useEffect(() => {
    if (open !== "menu") return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (item: MenuItem) => setOpen(item.danger ? "apagar" : null);

  return (
    <>
      <IconButton
        icon="more"
        label="Mais opções da conversa"
        variant="ghost"
        aria-expanded={open === "menu"}
        onClick={() => setOpen("menu")}
      />
      {open === "menu" && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar"
            tabIndex={-1}
            onClick={() => setOpen(null)}
            className="absolute inset-0 border-none bg-[rgba(5,9,7,0.72)] md:bg-[rgba(5,9,7,0.45)]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 flex flex-col gap-3.5 rounded-t-[1.75rem] border-t border-line-strong bg-card px-4 pb-7 text-sand md:inset-x-auto md:top-16 md:right-5 md:bottom-auto md:w-[20.375rem] md:gap-0 md:rounded-[1.25rem] md:border md:px-3 md:py-2 md:shadow-[0_16px_48px_rgba(0,0,0,.5)] lg:top-[4.75rem] lg:right-8 lg:w-[23.125rem] lg:px-3.5"
          >
            <div className="flex justify-center pt-2.5 pb-0.5 md:hidden">
              <span aria-hidden="true" className="h-1 w-10 rounded-[2px] bg-line-strong" />
            </div>
            <h2 className="m-0 font-display text-20 font-bold md:hidden">{title}</h2>
            <MenuList items={items} onPick={pick} />
            <Button
              variant="secondary"
              size="lg"
              block
              className="md:hidden"
              onClick={() => setOpen(null)}
            >
              <span>Cancelar</span>
            </Button>
          </div>
        </div>
      )}
      {open === "apagar" && (
        <ConfirmDialog
          title="Apagar esta conversa?"
          onClose={() => setOpen(null)}
          centered
          className="md:w-[28.75rem] lg:w-[32.5rem]"
          actions={
            <>
              <Button variant="ghost" className="text-15" onClick={() => setOpen(null)}>
                <span>Cancelar</span>
              </Button>
              <Button variant="danger" className="text-15" onClick={() => setOpen(null)}>
                <Icon name="trash" size={18} />
                <span>Apagar</span>
              </Button>
            </>
          }
        >
          <DialogText>
            {`A conversa “${title}” e as respostas d${agentName === "Capivara" ? "a" : "o"} ${agentName} somem do histórico. ${keepNote}`}
          </DialogText>
        </ConfirmDialog>
      )}
    </>
  );
}

/** "Sair da tela cheia": volta para a tela anterior com o chat aberto nesta conversa. */
export function ExitFullscreenButton({ conversationId }: { conversationId: string | null }) {
  const router = useRouter();
  const openConversation = useChatPanel((state) => state.openConversation);
  const newConversation = useChatPanel((state) => state.newConversation);
  return (
    <IconButton
      icon="minimize"
      label="Sair da tela cheia"
      variant="ghost"
      onClick={() => {
        if (conversationId) openConversation(conversationId);
        else newConversation();
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
    />
  );
}
