"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { type BlockDef, updateBlock } from "../model";
import type { ScreenLayout } from "../use-screen-layout";

/** "Editar layout": abre o modo de edição da tela (some enquanto ele está aberto). */
export function EditLayoutButton({
  layout,
  className,
  compact = false,
}: {
  layout: ScreenLayout;
  className?: string;
  /** Só o ícone (cabeçalho do celular). */
  compact?: boolean;
}) {
  if (layout.editing) return null;
  return (
    <Button
      variant="outline"
      size="md"
      onClick={layout.startEditing}
      aria-label={compact ? "Editar layout" : undefined}
      className={cn(compact && "size-11 px-0", className)}
    >
      <Icon name="grid" size={18} />
      {!compact && <span>Editar layout</span>}
    </Button>
  );
}

/**
 * Barra do modo de edição, presa no topo enquanto a página rola: como usar, os blocos ocultos
 * (um toque reexibe, idêntico), "Restaurar padrão" e "Concluir" (salva e sai).
 */
export function LayoutEditBar({
  layout,
  defs,
  className,
}: {
  layout: ScreenLayout;
  defs: readonly BlockDef[];
  className?: string;
}) {
  const hidden = layout.blocks.filter((b) => b.hidden);
  const labelOf = (id: string) => defs.find((def) => def.id === id)?.label ?? id;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false}>
        {layout.editing && (
          <motion.section
            key="barra"
            aria-label="Editar layout"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.17, ease: [0.22, 1, 0.36, 1] } }}
            className={cn(
              "sticky top-2 z-30 flex flex-col gap-3 rounded-card border border-line-strong bg-canvas/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,.35)] backdrop-blur @desk:flex-row @desk:items-center @desk:justify-between @desk:p-5",
              className,
            )}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <p className="m-0 flex items-center gap-2 text-15 font-bold">
                <Icon name="grid" size={18} className="text-tucano" />
                Editando o layout
              </p>
              <p className="m-0 text-13 text-mist">
                <span className="@max-tab:hidden">
                  Arraste os blocos para trocar de lugar e use a alça ao lado para mudar o tamanho.
                </span>
                <span className="@tab:hidden">
                  Segure um bloco para arrastar. O ícone de compactar deixa o bloco mais baixo.
                </span>{" "}
                Nada é apagado ao ocultar.
              </p>
              {hidden.length > 0 && (
                <div role="group" aria-label="Blocos ocultos" className="flex flex-wrap gap-2">
                  <span className="self-center text-13 text-caption">Ocultos:</span>
                  {hidden.map((block) => (
                    <Button
                      key={block.id}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        layout.change(updateBlock(layout.blocks, block.id, { hidden: false }))
                      }
                      aria-label={`Mostrar ${labelOf(block.id)}`}
                    >
                      <Icon name="eye" size={16} />
                      <span>{labelOf(block.id)}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end @desk:self-auto">
              <Button
                variant="ghost"
                size="md"
                onClick={layout.restoreDefault}
                disabled={layout.isDefault}
              >
                <Icon name="refresh" size={18} />
                <span>Restaurar padrão</span>
              </Button>
              <Button variant="primary" size="md" onClick={layout.finish}>
                <Icon name="check" size={18} />
                <span>Concluir</span>
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
