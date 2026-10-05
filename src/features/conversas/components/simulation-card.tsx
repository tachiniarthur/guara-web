import { ChartSvg, chartColors } from "@/components/charts/primitives";
import { Button } from "@/components/ui/button";
import { simulations } from "@/features/simulador/data";

const W = 632;
const H = 150;
const TOP = 15.5;
const BOTTOM = 128;

const sliders = [
  { id: "conversa-prazo", label: "Prazo", value: "25 anos", position: 50 },
  {
    id: "conversa-renda",
    label: "Renda desejada (valores de hoje)",
    value: "R$ 10.000/mês",
    position: 40,
  },
  { id: "conversa-rentabilidade", label: "Rentabilidade real", value: "4,0% a.a.", position: 45 },
  { id: "conversa-retirada", label: "Taxa de retirada", value: "4,0% a.a.", position: 40 },
];

/** Curva compacta do patrimônio até a meta, sem eixo de valores. */
function SavingsCurve() {
  const { series, ticks } = simulations.aposentadoria.result.chart;
  const values = series.projected;
  const last = values.length - 1;
  const max = Math.max(...values);
  const x = (i: number) => 4 + (i * (W - 8)) / last;
  const y = (v: number) => BOTTOM - (v / max) * (BOTTOM - TOP);
  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");

  return (
    <ChartSvg
      width={W}
      height={H}
      fluid={false}
      label="Patrimônio acumulado de 2026 a 2051, chegando a R$ 3 milhões"
      className="block max-w-full"
    >
      <line x1="0" x2={W} y1={TOP} y2={TOP} stroke={chartColors.tucano} strokeDasharray="4 4" />
      <text x="4" y={TOP - 6} fontSize="12" fontWeight="700" fill={chartColors.tucano}>
        Meta R$ 3,0 mi
      </text>
      <path
        d={`${line} L${x(last).toFixed(1)},${BOTTOM} L4.0,${BOTTOM} Z`}
        fill={chartColors.arara}
        fillOpacity=".10"
      />
      <path d={line} fill="none" stroke={chartColors.arara} strokeWidth="2.2" />
      {ticks.map((tick) => (
        <text
          key={tick.index}
          x={x(tick.index).toFixed(1)}
          y={H - 4}
          textAnchor="middle"
          fontSize="11"
          fill={chartColors.label}
        >
          {tick.label}
        </text>
      ))}
    </ChartSvg>
  );
}

/** Simulação de aposentadoria dentro da conversa, com as premissas ajustáveis. */
export function SimulationCard() {
  return (
    <div className="flex flex-col gap-4 rounded-bubble border border-line bg-card px-6 py-5">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-13 text-mist">Aporte mensal necessário</span>
          <span className="font-display text-36 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
            R$ 5.640<span className="text-18 font-medium text-mist">/mês</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-13 text-mist tabular-nums">
          <span>
            Patrimônio necessário <strong className="text-sand">R$ 3,0 mi</strong>
          </span>
          <span>
            Você já tem <strong className="text-sand">R$ 48,3 mil</strong>
          </span>
        </div>
      </div>
      <SavingsCurve />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {sliders.map((slider) => (
          <div key={slider.id} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex justify-between gap-2 text-13">
              <label htmlFor={slider.id} className="text-mist">
                {slider.label}
              </label>
              <span className="font-bold tabular-nums">{slider.value}</span>
            </div>
            <input
              id={slider.id}
              type="range"
              min={0}
              max={100}
              defaultValue={slider.position}
              className="m-0 h-6 w-full accent-arara"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm">
          <span>Salvar simulação</span>
        </Button>
        <Button variant="light" size="sm">
          <span>Transformar em meta</span>
        </Button>
      </div>
    </div>
  );
}
