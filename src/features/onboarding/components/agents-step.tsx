"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/features/acesso/session";
import { agentOrder, agents, type AgentId } from "@/features/assistentes/data";
import { useChooseAssistants } from "@/features/perfil/api";
import { cn } from "@/lib/utils";

import { agentIntros } from "../data";
import { usePlanAgents } from "../hooks";

const intro = Object.fromEntries(agentIntros.map((item) => [item.id, item.texto])) as Record<
  AgentId,
  string
>;

/** Arrasto mínimo (px) para trocar de assistente no toque ou no mouse. */
const SWIPE = 48;

/**
 * Escolha dos assistentes do plano num carrossel: um por vez, grande, com a cena do bicho e o
 * texto dentro do card. A pessoa escolhe até o limite do plano (todos no Pro) e pode trocar
 * depois em Meu perfil. Com login de verdade, a escolha vai para a API.
 */
export function AgentsCarousel({
  chosen,
  setChosen,
}: {
  chosen: AgentId[];
  setChosen: (update: (current: AgentId[]) => AgentId[]) => void;
}) {
  const plan = usePlanAgents();
  const limit = plan.limite ?? agentOrder.length;
  const [index, setIndex] = useState(0);
  const dragStart = useRef<number | null>(null);

  const all = plan.limite === null;
  const full = chosen.length >= limit;
  const agent = agents[agentOrder[index]!];
  const isChosen = chosen.includes(agent.id);

  const go = (next: number) =>
    setIndex(((next % agentOrder.length) + agentOrder.length) % agentOrder.length);
  const toggle = (id: AgentId) =>
    setChosen((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < limit
          ? [...current, id]
          : current,
    );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") go(index + 1);
    if (event.key === "ArrowLeft") go(index - 1);
  }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStart.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(delta) >= SWIPE) go(index + (delta < 0 ? 1 : -1));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-14 text-mist" aria-live="polite">
          {all ? (
            <>
              Seu plano {plan.nome} inclui <strong className="text-sand">todos</strong> os
              assistentes.
            </>
          ) : (
            <>
              <strong className="text-sand">
                {chosen.length} de {limit}
              </strong>{" "}
              escolhidos no plano {plan.nome}. Dá para trocar depois em Meu perfil.
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5" aria-label="Escolhidos">
          {agentOrder.map((id, position) => (
            <button
              key={id}
              type="button"
              onClick={() => go(position)}
              aria-label={`Ver ${agents[id].nome}${chosen.includes(id) ? " (escolhido)" : ""}`}
              className={cn(
                "rounded-full transition-[opacity,transform] duration-200 hover:scale-110",
                chosen.includes(id) ? "opacity-100" : "opacity-35",
                position === index && "ring-2 ring-tucano ring-offset-2 ring-offset-canvas",
              )}
            >
              <AgentAvatar agent={id} size={30} variant="ring" />
            </button>
          ))}
        </div>
      </div>

      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label="Assistentes"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative touch-pan-y overflow-hidden rounded-card outline-none select-none focus-visible:ring-2 focus-visible:ring-tucano"
      >
        <div
          className="flex transition-transform duration-500 ease-[var(--ease-out-soft)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {agentOrder.map((id, position) => {
            const item = agents[id];
            const selected = chosen.includes(id);
            return (
              <article
                key={id}
                aria-roledescription="slide"
                aria-label={`${position + 1} de ${agentOrder.length}: ${item.nome}`}
                aria-hidden={position !== index}
                className={cn(
                  "relative flex w-full shrink-0 flex-col overflow-hidden rounded-card border bg-card transition-[border-color] duration-300",
                  selected ? "border-tucano" : "border-line",
                )}
              >
                <div className="relative h-56 overflow-hidden md:h-64">
                  {/* eslint-disable-next-line @next/next/no-img-element -- cena ilustrada */}
                  <img
                    src={item.cena}
                    alt=""
                    draggable={false}
                    className={cn(
                      "block size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)]",
                      position === index ? "scale-100" : "scale-110",
                    )}
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,22,0)_40%,var(--guara-card)_100%)]" />
                  {selected && (
                    <span className="absolute top-3 right-3 flex animate-pop items-center gap-1 rounded-full bg-tucano px-2.5 py-1 text-12 font-bold text-canvas">
                      <Icon name="check" size={14} strokeWidth={2.6} />
                      Escolhido
                    </span>
                  )}
                </div>
                <div className="-mt-10 flex flex-col gap-3 px-5 pb-5">
                  <AgentAvatar agent={id} size={64} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-12 font-bold tracking-[0.06em] text-tucano uppercase">
                      {item.area}
                    </span>
                    <h3 className="m-0 font-display text-28 font-extrabold">{item.nome}</h3>
                    <span className="text-13 text-caption italic">
                      {item.cientifico} · {item.bioma}
                    </span>
                  </div>
                  <p className="m-0 text-16 leading-[1.55] text-mist">{intro[id]}</p>
                  {!all && (
                    <Button
                      variant={selected ? "secondary" : "primary"}
                      size="lg"
                      className="self-start"
                      disabled={!selected && full}
                      aria-pressed={selected}
                      tabIndex={position === index ? 0 : -1}
                      onClick={() => toggle(id)}
                    >
                      <Icon name={selected ? "x" : "plus"} size={16} />
                      <span>
                        {selected
                          ? "Tirar da minha equipe"
                          : full
                            ? "Limite do plano"
                            : "Escolher para a minha equipe"}
                      </span>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Assistente anterior"
          className="absolute top-28 left-3 flex size-10 items-center justify-center rounded-full border border-line-strong bg-canvas/80 text-sand backdrop-blur transition-transform hover:scale-105 md:top-32"
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Próximo assistente"
          className="absolute top-28 right-3 flex size-10 items-center justify-center rounded-full border border-line-strong bg-canvas/80 text-sand backdrop-blur transition-transform hover:scale-105 md:top-32"
        >
          <Icon name="chevron-right" size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {agentOrder.map((id, position) => (
          <span
            key={id}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-300",
              position === index ? "w-6 bg-tucano" : "w-1.5 bg-line-strong",
            )}
          />
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        {agent.nome}, {isChosen ? "escolhido" : "não escolhido"}
      </span>
    </div>
  );
}

/** Escolha inicial: os primeiros da turma até o limite do plano (todos no Pro). */
export function useAgentChoice() {
  const plan = usePlanAgents();
  const limit = plan.limite ?? agentOrder.length;
  // Nada vem escolhido: a pessoa escolhe cada assistente (até o limite do plano).
  const [picked, setPicked] = useState<AgentId[]>([]);
  const chosen = picked.slice(0, limit);
  const setChosen = (update: (current: AgentId[]) => AgentId[]) => setPicked(update(chosen));
  return { chosen, setChosen };
}

/**
 * Fim do onboarding: grava os assistentes escolhidos (com login de verdade) e abre o painel.
 */
export function useFinishOnboarding(chosen: AgentId[]) {
  const router = useRouter();
  const { live } = useSession();
  const save = useChooseAssistants();
  const finish = () => {
    if (!live) return router.push("/");
    save.mutate(chosen, { onSuccess: () => router.push("/") });
  };
  return { finish, busy: save.isPending, error: save.error };
}
