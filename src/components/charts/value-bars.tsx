export type ValueBar = { label: string; value: number; display: string; color: string };

/**
 * Barras verticais simples com o valor em cima e o mês embaixo (histórico de um teto ou de uma
 * assinatura). A largura do viewBox muda por formato; a altura acompanha o maior valor.
 */
export function ValueBars({
  items,
  width,
  height,
  base,
  scale,
  label,
}: {
  items: ValueBar[];
  /** Tamanho do viewBox e linha de base das barras. */
  width: number;
  height: number;
  base: number;
  /** Unidades do viewBox por unidade de valor. */
  scale: number;
  label: string;
}) {
  const slot = (width - 16) / items.length;
  const bar = slot * 0.62;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full"
    >
      {items.map((item, i) => {
        const cx = 8 + slot * (i + 0.5);
        const h = item.value * scale;
        return (
          <g key={item.label}>
            <rect
              x={(cx - bar / 2).toFixed(1)}
              y={(base - h).toFixed(1)}
              width={bar.toFixed(1)}
              height={h.toFixed(1)}
              rx="5"
              fill={item.color}
            />
            <text
              x={cx.toFixed(1)}
              y={(base - h - 4).toFixed(1)}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#F2EFE6"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item.display}
            </text>
            <text
              x={cx.toFixed(1)}
              y={base + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#93A198"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
