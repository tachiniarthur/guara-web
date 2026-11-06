"use client";

import { ProgressBar } from "@/components/ui/progress-bar";

import { useGastosData } from "../context";

const reais = (value: number | null) =>
  value === null ? "—" : `R$ ${value.toLocaleString("pt-BR")}`;

/**
 * "Previsão do mês" (Gastos): para onde o mês caminha no ritmo atual, com o que já saiu, a média
 * por dia e a comparação com agosto no mesmo dia.
 */
export function MonthForecast() {
  const f = useGastosData().monthForecast;
  const acima = (f.contraMedia ?? 0) >= 0;
  const rows = [
    { label: "Gasto até hoje", value: reais(f.ateHoje) },
    { label: "Média por dia", value: reais(f.porDia) },
    {
      label: `${f.nomeAnterior} no mesmo dia`,
      value:
        f.anteriorMesmoDia === null || f.contraAnterior === null
          ? "—"
          : `${reais(f.anteriorMesmoDia)} (${f.contraAnterior >= 0 ? "+" : "−"}${reais(Math.abs(f.contraAnterior))})`,
    },
    {
      label: `Até o fim do mês (${f.diasRestantes} dias)`,
      value: f.restante === null ? "—" : `cerca de ${reais(f.restante)}`,
    },
  ];
  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex flex-col gap-1">
        <strong className="font-display text-30 leading-tight font-extrabold tabular-nums">
          {reais(f.previsao)}
        </strong>
        <span className="text-14 text-mist">
          previsão para o fim do mês
          {f.contraMedia !== null && (
            <>
              {" · "}
              <span className={acima ? "text-tucano" : "text-folha"}>
                {Math.abs(f.contraMedia)}% {acima ? "acima" : "abaixo"} da média
              </span>{" "}
              ({reais(f.media)})
            </>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <ProgressBar
          value={(f.hoje / f.diasNoMes) * 100}
          tone="arara"
          height={8}
          label={`Dia ${f.hoje} de ${f.diasNoMes} do mês`}
        />
        <span className="text-12 text-caption">
          Dia {f.hoje} de {f.diasNoMes}
          {f.previsao
            ? ` · ${Math.round((f.ateHoje / f.previsao) * 100)}% da previsão já saiu`
            : ""}
        </span>
      </div>
      <dl className="m-0 flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 text-14 last:border-b-0"
          >
            <dt className="text-mist">{row.label}</dt>
            <dd className="m-0 font-bold whitespace-nowrap tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
