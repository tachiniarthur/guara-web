"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  type SortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import {
  type BlockDef,
  type LayoutBlock,
  type LayoutSize,
  SIZE_LABELS,
  moveBlock,
  tabletHalf,
  sizeForColumns,
  stepSize,
  updateBlock,
} from "../model";
import type { ScreenLayout } from "../use-screen-layout";

/**
 * Colunas no desktop por tamanho e no tablet (metade ou tudo, ver `tabletHalf`). Classes escritas
 * por extenso: o Tailwind não enxerga classes montadas. Celular: sempre a largura toda.
 */
const DESK: Record<LayoutSize, string> = {
  xs: "@desk:col-span-3",
  s: "@desk:col-span-4",
  m: "@desk:col-span-6",
  l: "@desk:col-span-8",
  xl: "@desk:col-span-12",
};
const spanOf = (def: BlockDef, size: LayoutSize) =>
  cn("col-span-12", tabletHalf(def, size) && "@tab:col-span-6", DESK[size]);

/**
 * Reflow dos vizinhos (tamanho, ocultar, reexibir): mola curta e sem ultrapassar o ponto, como
 * pede um app de finanças. Só transform (o `layout` do Motion anima por transform).
 */
const REFLOW: Transition = { type: "spring", bounce: 0, visualDuration: 0.28 };

/**
 * Sem deslocamento calculado pelo dnd-kit: com blocos de tamanhos diferentes, a estratégia de grade
 * dele sobrepõe os vizinhos. A ordem muda de verdade enquanto arrasta, a grade CSS se reorganiza e
 * o `layout` do Motion leva cada vizinho até o lugar novo.
 */
const LIVE_REORDER: SortingStrategy = () => null;

/** Soltar: o bloco assenta no lugar com a curva padrão do site. */
const DROP: DropAnimation = { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

/** Coordenadas do leitor de tela em pt-BR (dnd-kit fala em inglês por padrão). */
function announcements(labelOf: (id: string) => string): Announcements {
  return {
    onDragStart: ({ active }) =>
      `${labelOf(String(active.id))} selecionado. Use as setas para mover e espaço para soltar.`,
    onDragOver: ({ active, over }) =>
      over ? `${labelOf(String(active.id))} sobre ${labelOf(String(over.id))}.` : "",
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(String(active.id))} solto no lugar de ${labelOf(String(over.id))}.`
        : `${labelOf(String(active.id))} solto.`,
    onDragCancel: ({ active }) => `Movimento de ${labelOf(String(active.id))} cancelado.`,
  };
}

interface GridProps {
  layout: ScreenLayout;
  defs: readonly BlockDef[];
  /** Só os blocos deste grupo (as seções do Início). */
  group?: string;
  renderBlock: (id: string) => ReactNode;
  className?: string;
  /** Texto quando o grupo inteiro está oculto (só no modo de edição). */
  emptyLabel?: string;
}

/**
 * Grade de blocos da tela. Fora da edição é uma grade comum (nada muda no uso); na edição, cada
 * bloco pode ser arrastado (mouse, toque longo de 250 ms ou teclado pela alça), redimensionado
 * (alça lateral que encaixa nos tamanhos da grade, ou − e +), ocultado e, no celular, compactado.
 */
export function EditableGrid({
  layout,
  defs,
  group,
  renderBlock,
  className,
  emptyLabel,
}: GridProps) {
  const defOf = (id: string) => defs.find((def) => def.id === id)!;
  const inGroup = layout.blocks.filter((b) => defs.some((d) => d.id === b.id && d.group === group));
  const visible = inGroup.filter((b) => !b.hidden);
  const gridClass = cn("grid grid-cols-12 gap-4 @desk:gap-6", className);

  if (!layout.editing) {
    return (
      <div className={gridClass}>
        {visible.map((block) => (
          <BlockFrame key={block.id} block={block} def={defOf(block.id)}>
            {renderBlock(block.id)}
          </BlockFrame>
        ))}
      </div>
    );
  }

  return (
    <EditingGrid
      layout={layout}
      defOf={defOf}
      visible={visible}
      gridClass={gridClass}
      renderBlock={renderBlock}
      emptyLabel={emptyLabel}
    />
  );
}

/** O bloco fora da edição: só a coluna e, no celular, a altura compacta. */
function BlockFrame({
  block,
  def,
  children,
}: {
  block: LayoutBlock;
  def: BlockDef;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col *:grow", spanOf(def, block.size))}>
      {block.compact ? <Compact>{children}</Compact> : children}
    </div>
  );
}

/** Celular: altura reduzida com o fim esmaecido (no tablet e no desktop, o bloco inteiro). */
function Compact({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col *:grow @max-tab:max-h-60 @max-tab:overflow-hidden @max-tab:mask-b-from-70%">
      {children}
    </div>
  );
}

function EditingGrid({
  layout,
  defOf,
  visible,
  gridClass,
  renderBlock,
  emptyLabel,
}: {
  layout: ScreenLayout;
  defOf: (id: string) => BlockDef;
  visible: LayoutBlock[];
  gridClass: string;
  renderBlock: (id: string) => ReactNode;
  emptyLabel?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Menos movimento pedido no sistema: o bloco solto aparece no lugar, sem deslizar.
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  /** A ordem de antes do arrasto, para o Esc devolver tudo. */
  const before = useRef<LayoutBlock[] | null>(null);
  const sensors = useSensors(
    // Mouse: começa depois de 6 px (um clique nos botões do bloco continua sendo clique).
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Toque longo: um toque rápido continua rolando a página.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const labelOf = (id: string) => defOf(id).label;

  const onDragStart = ({ active }: DragStartEvent) => {
    before.current = layout.blocks;
    setActiveId(String(active.id));
  };
  // A ordem muda a cada bloco que o ponteiro cruza (os vizinhos abrem espaço na hora).
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (over && active.id !== over.id) {
      layout.change(moveBlock(layout.blocks, String(active.id), String(over.id)));
    }
  };
  const onDragEnd = () => {
    before.current = null;
    setActiveId(null);
  };
  const onDragCancel = () => {
    if (before.current) layout.change(before.current);
    onDragEnd();
  };

  const active = activeId ? visible.find((b) => b.id === activeId) : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements: announcements(labelOf),
          screenReaderInstructions: {
            draggable:
              "Para mover o bloco, aperte espaço ou enter, use as setas e aperte espaço de novo para soltar. Esc cancela.",
          },
        }}
      >
        <SortableContext items={visible.map((b) => b.id)} strategy={LIVE_REORDER}>
          <div ref={gridRef} className={gridClass}>
            <AnimatePresence initial={false}>
              {visible.map((block) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  def={defOf(block.id)}
                  gridRef={gridRef}
                  onChange={(patch) => layout.change(updateBlock(layout.blocks, block.id, patch))}
                >
                  {renderBlock(block.id)}
                </EditableBlock>
              ))}
            </AnimatePresence>
            {visible.length === 0 && emptyLabel && (
              <p className="col-span-12 m-0 rounded-card border border-dashed border-line-strong p-5 text-center text-14 text-mist">
                {emptyLabel}
              </p>
            )}
          </div>
        </SortableContext>
        {/* No `body`: um ancestral com `transform` (entrada da página) desloca o `position: fixed`. */}
        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={reduceMotion ? null : DROP}>
              {active ? <DragGhost label={labelOf(active.id)} size={active.size} /> : null}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </MotionConfig>
  );
}

/** O que acompanha o dedo: leve (sem redesenhar gráficos), com o nome e o tamanho do bloco. */
function DragGhost({ label, size }: { label: string; size: LayoutSize }) {
  return (
    <div className="flex h-full min-h-24 scale-[1.02] cursor-grabbing items-center justify-center gap-2 rounded-card border-2 border-sand bg-card shadow-[0_18px_40px_rgba(0,0,0,.35)]">
      <Icon name="grip" size={18} strokeWidth={2.6} className="text-mist" />
      <span className="text-15 font-bold">{label}</span>
      <span className="text-13 text-mist">· {SIZE_LABELS[size]}</span>
    </div>
  );
}

function EditableBlock({
  block,
  def,
  gridRef,
  onChange,
  children,
}: {
  block: LayoutBlock;
  def: BlockDef;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onChange: (patch: Partial<Omit<LayoutBlock, "id">>) => void;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const canShrink = stepSize(def, block.size, -1) !== block.size;
  const canGrow = stepSize(def, block.size, 1) !== block.size;
  // Os ouvintes do dnd-kit vêm tipados como `Function`: estes são os dos três sensores usados.
  const on = listeners as
    | {
        onMouseDown?: React.MouseEventHandler<HTMLElement>;
        onTouchStart?: React.TouchEventHandler<HTMLElement>;
        onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
      }
    | undefined;
  // Mouse e toque arrastam pelo bloco inteiro; o teclado, pela alça (foco e leitor de tela).
  const pointerListeners = { onMouseDown: on?.onMouseDown, onTouchStart: on?.onTouchStart };

  return (
    // Fora: a coluna (o deslocamento do dnd-kit fica nulo com o reordenar ao vivo).
    // Dentro: reflow, entrada e saída (Motion). Cada um no seu elemento, sem brigar.
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("flex min-w-0 touch-manipulation flex-col *:grow", spanOf(def, block.size))}
      {...pointerListeners}
    >
      <motion.div
        // Reflow dos vizinhos (arrasto, tamanho, ocultar). Só a posição anima: o tamanho encaixa
        // na hora (esticar o conteúdo deformaria os gráficos).
        layout="position"
        transition={REFLOW}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.17 } }}
        className={cn(
          "relative flex min-w-0 flex-col rounded-card outline-2 outline-offset-4 outline-line-strong outline-dashed select-none *:grow",
          isDragging && "opacity-40",
          !isDragging && "cursor-grab",
        )}
      >
        {/* O conteúdo continua à vista, mas não reage a clique nem a foco durante a edição. */}
        <div inert className="flex min-w-0 flex-col *:grow">
          {block.compact ? <Compact>{children}</Compact> : children}
        </div>

        <div
          className="absolute -top-3.5 right-3 z-10 flex items-center gap-0.5 rounded-full border border-line-strong bg-canvas p-0.5 shadow-[0_6px_16px_rgba(0,0,0,.25)]"
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`Mover ${def.label}`}
            className="flex size-11 cursor-grab items-center justify-center rounded-full text-mist hover:text-sand focus-visible:outline-2 focus-visible:outline-sand @desk:size-9"
            {...attributes}
            onKeyDown={on?.onKeyDown}
            // A alça também arrasta com mouse e toque (o resto da pílula não).
            onMouseDown={on?.onMouseDown}
            onTouchStart={on?.onTouchStart}
            style={{ touchAction: "none" }}
          >
            <Icon name="grip" size={18} strokeWidth={2.6} />
          </button>
          <span className="hidden px-1.5 text-12 whitespace-nowrap text-mist @tab:inline">
            {SIZE_LABELS[block.size]}
          </span>
          <PillButton
            label={`Diminuir ${def.label}`}
            icon="minus"
            disabled={!canShrink}
            className="hidden @tab:flex"
            onClick={() => onChange({ size: stepSize(def, block.size, -1) })}
          />
          <PillButton
            label={`Aumentar ${def.label}`}
            icon="plus"
            disabled={!canGrow}
            className="hidden @tab:flex"
            onClick={() => onChange({ size: stepSize(def, block.size, 1) })}
          />
          <PillButton
            label={block.compact ? `Mostrar ${def.label} inteiro` : `Compactar ${def.label}`}
            icon={block.compact ? "expand" : "minimize"}
            pressed={block.compact}
            className="@tab:hidden"
            onClick={() => onChange({ compact: !block.compact })}
          />
          <PillButton
            label={`Ocultar ${def.label}`}
            icon="eye-off"
            onClick={() => onChange({ hidden: true })}
          />
        </div>

        {def.sizes.length > 1 && (
          <ResizeHandle
            def={def}
            size={block.size}
            gridRef={gridRef}
            onResize={(size) => onChange({ size })}
          />
        )}
      </motion.div>
    </div>
  );
}

function PillButton({
  label,
  icon,
  onClick,
  disabled,
  pressed,
  className,
}: {
  label: string;
  icon: "minus" | "plus" | "eye-off" | "expand" | "minimize";
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-11 pressable items-center justify-center rounded-full text-mist hover:bg-shade hover:text-sand focus-visible:outline-2 focus-visible:outline-sand disabled:opacity-35 @desk:size-9",
        className,
      )}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

/**
 * Alça na borda direita (tablet e desktop): arrastar para os lados escolhe o tamanho que encaixa
 * na grade. O estado só muda quando o tamanho muda (não a cada movimento do ponteiro). Teclado:
 * setas para os lados.
 */
function ResizeHandle({
  def,
  size,
  gridRef,
  onResize,
}: {
  def: BlockDef;
  size: LayoutSize;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onResize: (size: LayoutSize) => void;
}) {
  const start = useRef<{ x: number; width: number; column: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // A coluna é a caixa de fora (a de dentro pode estar no meio de uma animação).
    const block = event.currentTarget.parentElement?.parentElement;
    const grid = gridRef.current;
    if (!block || !grid) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    start.current = {
      x: event.clientX,
      width: block.getBoundingClientRect().width,
      column: (grid.getBoundingClientRect().width + gap) / 12,
    };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const origin = start.current;
    if (!origin) return;
    const columns = (origin.width + event.clientX - origin.x) / origin.column;
    const next = sizeForColumns(def, columns);
    // O handler é recriado a cada render: `size` é sempre o tamanho atual.
    if (next !== size) onResize(next);
  };
  const end = () => {
    start.current = null;
  };

  return (
    <button
      type="button"
      aria-label={`Mudar o tamanho de ${def.label}: ${SIZE_LABELS[size]}`}
      title="Arraste para mudar o tamanho"
      className="absolute top-1/2 -right-3 z-10 hidden h-14 w-6 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-line-strong bg-canvas text-mist shadow-[0_6px_16px_rgba(0,0,0,.25)] hover:text-sand focus-visible:outline-2 focus-visible:outline-sand @tab:flex"
      style={{ touchAction: "none" }}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") onResize(stepSize(def, size, 1));
        else if (event.key === "ArrowLeft") onResize(stepSize(def, size, -1));
        else return;
        event.preventDefault();
      }}
    >
      <Icon name="move-horizontal" size={14} />
    </button>
  );
}
