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
  MIN_HEIGHT,
  clampColumns,
  columnRange,
  heightLabel,
  moveBlock,
  snapHeight,
  stepColumns,
  stepHeight,
  tabletHalf,
  updateBlock,
  widthLabel,
} from "../model";
import type { ScreenLayout } from "../use-screen-layout";

/**
 * Colunas no desktop (1 a 12) e no tablet (metade ou tudo, ver `tabletHalf`). Classes escritas
 * por extenso: o Tailwind não enxerga classes montadas. Celular: sempre a largura toda.
 */
const DESK = [
  "",
  "@desk:col-span-1",
  "@desk:col-span-2",
  "@desk:col-span-3",
  "@desk:col-span-4",
  "@desk:col-span-5",
  "@desk:col-span-6",
  "@desk:col-span-7",
  "@desk:col-span-8",
  "@desk:col-span-9",
  "@desk:col-span-10",
  "@desk:col-span-11",
  "@desk:col-span-12",
] as const;
const spanOf = (def: BlockDef, columns: number) =>
  cn("col-span-12", tabletHalf(def, columns) && "@tab:col-span-6", DESK[columns]);

/** Arranjo em uso agora (o da página, pelas mesmas medidas dos `@tab`/`@desk` do CSS). */
type GridMode = "phone" | "tablet" | "desk";
function gridMode(grid: HTMLElement): GridMode {
  const page = grid.parentElement?.closest<HTMLElement>(".\\@container") ?? grid;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = page.getBoundingClientRect().width;
  // Sem medida (fora da tela, testes): o arranjo mais completo.
  if (width === 0 || width >= 68.75 * rem) return "desk";
  return width >= 37.5 * rem ? "tablet" : "phone";
}

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
 * bloco pode ser arrastado (mouse, toque longo de 250 ms ou teclado pela alça), ter a largura
 * mudada coluna a coluna (alça do lado, ou − e +), a altura de 8 em 8 px (alça de baixo; dois
 * cliques voltam à automática), as duas juntas (alça do canto) e ser ocultado.
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

/** O bloco fora da edição: só a coluna e a altura escolhida. */
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
    <div className={cn("flex min-w-0 flex-col *:grow", spanOf(def, block.columns))}>
      <HeightBox minHeight={block.minHeight}>{children}</HeightBox>
    </div>
  );
}

/**
 * Altura escolhida: o card cresce até ela e os gráficos ocupam o espaço (nunca corta nem rola
 * dentro do bloco). Automática: a do conteúdo.
 */
function HeightBox({ minHeight, children }: { minHeight: number | null; children: ReactNode }) {
  return (
    <div
      className="flex min-w-0 flex-col *:grow"
      style={minHeight === null ? undefined : { minHeight }}
    >
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
              {active ? <DragGhost label={labelOf(active.id)} columns={active.columns} /> : null}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </MotionConfig>
  );
}

/** O que acompanha o dedo: leve (sem redesenhar gráficos), com o nome e a largura do bloco. */
function DragGhost({ label, columns }: { label: string; columns: number }) {
  return (
    <div className="flex h-full min-h-24 scale-[1.02] cursor-grabbing items-center justify-center gap-2 rounded-card border-2 border-sand bg-card shadow-[0_18px_40px_rgba(0,0,0,.35)]">
      <Icon name="grip" size={18} strokeWidth={2.6} className="text-mist" />
      <span className="text-15 font-bold">{label}</span>
      <span className="text-13 text-mist">· {widthLabel(columns)}</span>
    </div>
  );
}

type Patch = Partial<Omit<LayoutBlock, "id">>;

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
  onChange: (patch: Patch) => void;
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
  /** Enquanto uma alça é arrastada: mostra a medida no meio do bloco. */
  const [resizing, setResizing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { min, max } = columnRange(def);
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
  const mode = () => (gridRef.current ? gridMode(gridRef.current) : "desk");
  const stepWidth = (direction: -1 | 1) => {
    const current = mode();
    if (current === "phone") return;
    const next = stepColumns(def, block.columns, direction, current);
    if (next !== block.columns) onChange({ columns: next });
  };
  const currentHeight = () => boxRef.current?.getBoundingClientRect().height ?? MIN_HEIGHT;
  const stepBlockHeight = (direction: -1 | 1) =>
    onChange({ minHeight: stepHeight(block.minHeight, currentHeight(), direction) });

  return (
    // Fora: a coluna (o deslocamento do dnd-kit fica nulo com o reordenar ao vivo).
    // Dentro: reflow, entrada e saída (Motion). Cada um no seu elemento, sem brigar.
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("flex min-w-0 touch-manipulation flex-col *:grow", spanOf(def, block.columns))}
      {...pointerListeners}
    >
      <motion.div
        // Reflow dos vizinhos (arrasto, tamanho, ocultar). Só a posição anima: o tamanho segue o
        // ponteiro na hora (esticar o conteúdo deformaria os gráficos).
        layout="position"
        transition={REFLOW}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.17 } }}
        className={cn(
          "relative flex min-w-0 flex-col rounded-card outline-2 outline-offset-4 outline-dashed select-none *:grow",
          resizing ? "outline-sand" : "outline-line-strong",
          isDragging && "opacity-40",
          !isDragging && "cursor-grab",
        )}
      >
        {/* O conteúdo continua à vista, mas não reage a clique nem a foco durante a edição. */}
        <div ref={boxRef} inert className="flex min-w-0 flex-col *:grow">
          <HeightBox minHeight={block.minHeight}>{children}</HeightBox>
        </div>

        {resizing && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-1/2 rounded-full border border-line-strong bg-canvas/95 px-3.5 py-1.5 text-13 font-bold whitespace-nowrap text-sand shadow-[0_8px_24px_rgba(0,0,0,.35)] backdrop-blur"
          >
            {widthLabel(block.columns)} · {heightLabel(block.minHeight)}
          </div>
        )}

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
          <PillButton
            label={`Diminuir a largura de ${def.label}`}
            icon="minus"
            disabled={block.columns <= min}
            className="hidden @tab:flex"
            onClick={() => stepWidth(-1)}
          />
          <PillButton
            label={`Aumentar a largura de ${def.label}`}
            icon="plus"
            disabled={block.columns >= max}
            className="hidden @tab:flex"
            onClick={() => stepWidth(1)}
          />
          {block.minHeight !== null && (
            <PillButton
              label={`Altura automática para ${def.label}`}
              icon="refresh"
              onClick={() => onChange({ minHeight: null })}
            />
          )}
          <PillButton
            label={`Ocultar ${def.label}`}
            icon="eye-off"
            onClick={() => onChange({ hidden: true })}
          />
        </div>

        <ResizeHandle
          axis="y"
          label={`Altura de ${def.label}: ${heightLabel(block.minHeight)}. Setas para cima e para baixo mudam; Delete volta à automática.`}
          title="Arraste para mudar a altura · dois cliques: automática"
          block={block}
          def={def}
          gridRef={gridRef}
          boxRef={boxRef}
          onResizing={setResizing}
          onChange={onChange}
          onKey={(key) => {
            if (key === "ArrowDown") stepBlockHeight(1);
            else if (key === "ArrowUp") stepBlockHeight(-1);
            else if (key === "Delete" || key === "Backspace") onChange({ minHeight: null });
            else return false;
            return true;
          }}
        />
        {max > min && (
          <>
            <ResizeHandle
              axis="x"
              label={`Largura de ${def.label}: ${widthLabel(block.columns)}. Setas para os lados mudam.`}
              title="Arraste para mudar a largura"
              block={block}
              def={def}
              gridRef={gridRef}
              boxRef={boxRef}
              onResizing={setResizing}
              onChange={onChange}
              onKey={(key) => {
                if (key === "ArrowRight") stepWidth(1);
                else if (key === "ArrowLeft") stepWidth(-1);
                else return false;
                return true;
              }}
            />
            <ResizeHandle
              axis="both"
              label={`Largura e altura de ${def.label}: ${widthLabel(block.columns)}, ${heightLabel(block.minHeight)}. Setas mudam.`}
              title="Arraste para mudar largura e altura"
              block={block}
              def={def}
              gridRef={gridRef}
              boxRef={boxRef}
              onResizing={setResizing}
              onChange={onChange}
              onKey={(key) => {
                if (key === "ArrowRight") stepWidth(1);
                else if (key === "ArrowLeft") stepWidth(-1);
                else if (key === "ArrowDown") stepBlockHeight(1);
                else if (key === "ArrowUp") stepBlockHeight(-1);
                else return false;
                return true;
              }}
            />
          </>
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
  className,
}: {
  label: string;
  icon: "minus" | "plus" | "eye-off" | "refresh";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
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

const HANDLE_CLASS: Record<"x" | "y" | "both", string> = {
  // Lado direito, no meio (tablet e desktop).
  x: "top-1/2 -right-3 hidden h-14 w-6 -translate-y-1/2 cursor-ew-resize @tab:flex",
  // Embaixo, no meio (todas as larguras).
  y: "-bottom-3 left-1/2 h-6 w-14 -translate-x-1/2 cursor-ns-resize flex",
  // Canto de baixo à direita (tablet e desktop).
  both: "-right-3 -bottom-3 hidden size-7 cursor-nwse-resize @tab:flex",
};

/**
 * Alça de redimensionar. Segue o ponteiro: a largura encaixa coluna a coluna (no tablet, metade
 * ou tudo) e a altura de 8 em 8 px, e o bloco muda na hora, com a medida no meio dele. O estado
 * só muda quando a medida encaixada muda (não a cada movimento do ponteiro).
 */
function ResizeHandle({
  axis,
  label,
  title,
  block,
  def,
  gridRef,
  boxRef,
  onResizing,
  onChange,
  onKey,
}: {
  axis: "x" | "y" | "both";
  label: string;
  title: string;
  block: LayoutBlock;
  def: BlockDef;
  gridRef: React.RefObject<HTMLDivElement | null>;
  boxRef: React.RefObject<HTMLDivElement | null>;
  onResizing: (resizing: boolean) => void;
  onChange: (patch: Patch) => void;
  /** Teclado: devolve `true` quando a tecla foi usada. */
  onKey: (key: string) => boolean;
}) {
  const start = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    column: number;
    gridWidth: number;
    mode: GridMode;
  } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const grid = gridRef.current;
    const box = boxRef.current;
    // A coluna é a caixa de fora (a de dentro pode estar no meio de uma animação).
    const cell = event.currentTarget.parentElement?.parentElement;
    if (!grid || !box || !cell) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const gridWidth = grid.getBoundingClientRect().width;
    start.current = {
      x: event.clientX,
      y: event.clientY,
      width: cell.getBoundingClientRect().width,
      height: box.getBoundingClientRect().height,
      column: (gridWidth + gap) / 12,
      gridWidth,
      mode: gridMode(grid),
    };
    onResizing(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const origin = start.current;
    if (!origin) return;
    const patch: Patch = {};
    if (axis !== "y" && origin.mode !== "phone") {
      const width = origin.width + event.clientX - origin.x;
      const columns =
        origin.mode === "desk"
          ? clampColumns(def, width / origin.column)
          : // Tablet: duas colunas só. Passou de 3/4 da grade, largura toda.
            clampColumns(def, width > origin.gridWidth * 0.75 ? 12 : 6);
      if (columns !== block.columns) patch.columns = columns;
    }
    if (axis !== "x") {
      const height = snapHeight(origin.height + event.clientY - origin.y);
      if (height !== block.minHeight) patch.minHeight = height;
    }
    // O handler é recriado a cada render: `block` é sempre o atual.
    if (Object.keys(patch).length > 0) onChange(patch);
  };
  const end = () => {
    if (!start.current) return;
    start.current = null;
    onResizing(false);
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      className={cn(
        "absolute z-10 items-center justify-center rounded-full border border-line-strong bg-canvas text-mist shadow-[0_6px_16px_rgba(0,0,0,.25)] hover:border-sand hover:text-sand focus-visible:outline-2 focus-visible:outline-sand",
        HANDLE_CLASS[axis],
      )}
      style={{ touchAction: "none" }}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={axis === "y" ? () => onChange({ minHeight: null }) : undefined}
      onKeyDown={(event) => {
        if (onKey(event.key)) event.preventDefault();
      }}
    >
      <Icon
        name={axis === "x" ? "move-horizontal" : axis === "y" ? "move-vertical" : "move-diagonal"}
        size={14}
      />
    </button>
  );
}
