import { agents, type AgentId } from "@/features/assistentes/data";
import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

/** Contorno de pincelada: raio 46,5 ± 1,6 com 22 ondas (duas linhas em fases opostas). */
function wavyRing(phase: 1 | -1) {
  const points: string[] = [];
  for (let i = 0; i <= 360; i++) {
    const t = (i / 360) * Math.PI * 2;
    const r = 46.5 + phase * 1.6 * Math.sin(22 * t);
    points.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${points.join(" L")}`;
}

const RING_A = wavyRing(1);
const RING_B = wavyRing(-1);

type AgentAvatarProps = {
  agent: AgentId;
  /** Lado em px. */
  size: number;
  /**
   * "brush": retrato com anel de pincelada (menus, chat, pendências).
   * "ring": retrato com anel liso na cor do bioma (listas e cards compactos).
   */
  variant?: "brush" | "ring";
  className?: string;
};

/** Retrato do bicho com anel na cor do bioma. Decorativo: o nome vem sempre escrito ao lado. */
export function AgentAvatar({ agent, size, variant = "brush", className }: AgentAvatarProps) {
  const { anel, retrato } = agents[agent];

  if (variant === "ring") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(242,239,230,.35)]",
          className,
        )}
        style={{
          width: rem(size),
          height: rem(size),
          padding: size >= 42 ? 3 : 2,
          background: anel,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- retrato pequeno e estático */}
        <img src={retrato} alt="" className="block size-full rounded-full object-cover" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("relative block shrink-0", className)}
      style={{ width: rem(size), height: rem(size) }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="block shrink-0">
        <circle cx="50" cy="50" r="49" fill={anel} />
        <path d={RING_A} fill="none" stroke="#F2EFE6" strokeWidth=".6" opacity=".9" />
        <path d={RING_B} fill="none" stroke="#F2EFE6" strokeWidth=".6" opacity=".9" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- retrato pequeno e estático */}
      <img
        src={retrato}
        alt=""
        className="absolute top-[6%] left-[6%] block size-[88%] rounded-full object-cover"
      />
    </span>
  );
}
