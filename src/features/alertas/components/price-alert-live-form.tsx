"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { chipClass } from "@/components/ui/chip";
import {
  AmountInput,
  Field,
  FieldHint,
  FieldLabel,
  Legend,
  MobileActionBar,
  SelectInput,
  StatTile,
  TextInput,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  US_EXCHANGES,
  exchangeLabel,
  normalizeTicker,
  useAssetQuote,
  type Market,
  type UsMic,
} from "@/features/mercado/live";
import { ApiError, apiRequest } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { decimalToCents, parseMoneyInput } from "@/lib/money-input";
import { cn } from "@/lib/utils";

type Direction = "buy" | "sell";

const CreatedSchema = z.object({ id: z.string() }).loose();

/** Atalhos a partir do preço atual: compra abaixo, venda acima. */
const SHORTCUTS = [5, 10, 20] as const;

function DirectionOption({
  direction,
  checked,
  onSelect,
}: {
  direction: Direction;
  checked: boolean;
  onSelect: () => void;
}) {
  const sell = direction === "sell";
  const id = `tipo-${direction}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-bubble px-3.5 py-2.5 @desk:min-h-20",
        checked ? "border-2 border-urucum bg-urucum-bg" : "border border-line-strong bg-field",
      )}
    >
      <input
        id={id}
        type="radio"
        name="tipo-alerta"
        checked={checked}
        onChange={onSelect}
        className={cn(
          "m-0 size-5.5 shrink-0 @desk:size-6",
          sell ? "accent-tucano" : "accent-folha",
        )}
      />
      <span className="flex grow flex-col leading-[1.35]">
        <span
          className={cn("flex items-center gap-1.5 font-bold", sell ? "text-urucum" : "text-folha")}
        >
          <Icon name={sell ? "arrow-up" : "arrow-down"} size={16} strokeWidth={2.2} />
          {sell ? "VENDA" : "COMPRA"}
        </span>
        <span className="text-13 text-mist @desk:text-15">
          Avise quando o preço {sell ? "subir" : "cair"} até
        </span>
      </span>
    </label>
  );
}

/**
 * Novo alerta de preço com os dados da API: ativo da B3 ou dos EUA (o alvo fica na moeda do
 * ativo, em dólar nos EUA), cotação atual pela API e envio de verdade. O protótipo continua em
 * `PriceAlertFormPage`.
 */
export function PriceAlertLiveForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [market, setMarket] = useState<Market>("b3");
  const [mic, setMic] = useState<UsMic>("XNAS");
  const [tickerText, setTickerText] = useState("");
  const [direction, setDirection] = useState<Direction>("buy");
  const [targetText, setTargetText] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const symbol = normalizeTicker(tickerText);
  const exchange = market === "us" ? mic : null;
  const quote = useAssetQuote(symbol, exchange, { enabled: true });
  const currency = market === "us" ? "USD" : "BRL";
  const money = (cents: number | null) => formatMoney(cents, currency);
  const priceCents = quote.data?.price ? decimalToCents(quote.data.price) : null;
  const targetCents = parseMoneyInput(targetText);
  const distancePct =
    priceCents && targetCents ? ((targetCents - priceCents) / priceCents) * 100 : null;

  const create = useMutation({
    mutationFn: () =>
      apiRequest("/v1/price-alerts", CreatedSchema, {
        method: "POST",
        body: {
          symbol,
          ...(exchange ? { micCode: exchange } : {}),
          direction,
          targetPriceCents: targetCents,
        },
      }),
    onSuccess: async (alert) => {
      await queryClient.invalidateQueries({ queryKey: ["alertas"] });
      await queryClient.invalidateQueries({ queryKey: ["investimentos"] });
      router.push(`/alertas/precos/${alert.id}`);
    },
    onError: (error) =>
      setProblem(error instanceof ApiError ? error.message : "Não deu para criar o alerta."),
  });

  const submit = () => {
    setProblem(null);
    if (!symbol) return setProblem("Informe o ticker do ativo.");
    if (!targetCents) return setProblem("Informe o valor-gatilho.");
    create.mutate();
  };

  const applyShortcut = (pct: number) => {
    if (!priceCents) return;
    const factor = direction === "buy" ? 100 - pct : 100 + pct;
    const cents = Math.round((priceCents * factor) / 100);
    setTargetText(money(cents));
  };

  const quoteHint = !symbol
    ? "Digite o ticker (ex.: PETR4, AAPL)."
    : quote.isPending
      ? "Buscando a cotação…"
      : priceCents === null
        ? market === "us"
          ? "Sem cotação agora. Ativos dos EUA dependem da liberação da sua conta."
          : "Sem cotação agora."
        : `${exchangeLabel(exchange)} · cotação ${quote.data?.asOf ? `às ${formatDate(quote.data.asOf, "HH:mm")}` : "sem horário"}: ${money(priceCents)}`;

  const actions = (size: "md" | "xl") => (
    <>
      <ButtonLink href="/alertas" variant="ghost" size={size} className="hover:bg-transparent">
        <span>Cancelar</span>
      </ButtonLink>
      <Button variant="primary" size={size} onClick={submit} disabled={create.isPending}>
        <Icon name="check" size={18} />
        <span>{create.isPending ? "Criando…" : "Criar alerta"}</span>
      </Button>
    </>
  );

  return (
    <Page
      padding="form"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Novo alerta de preço" close="/alertas" />}
    >
      <Breadcrumb
        className="hidden @tab:flex"
        items={[{ label: "Alertas", href: "/alertas" }, { label: "Novo alerta de preço" }]}
      />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
          Novo alerta de preço
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-2 @desk:gap-6">
        <section className="flex min-w-0 flex-col gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-6 @desk:p-8">
          <form
            className="m-0 flex flex-col gap-5.5 @desk:gap-7.5"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
              <Legend>Mercado</Legend>
              <SegmentedControl
                label="Mercado"
                value={market}
                onValueChange={(value) => {
                  setMarket(value);
                  setTargetText("");
                }}
                options={[
                  { value: "b3", label: "Brasil (B3)" },
                  { value: "us", label: "Estados Unidos" },
                ]}
              />
            </fieldset>

            <div
              className={cn(
                "grid grid-cols-1 items-start gap-3.5",
                market === "us" && "@tab:grid-cols-2",
              )}
            >
              <Field>
                <FieldLabel htmlFor="alerta-ativo">Ativo</FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
                    <Icon name="search" />
                  </span>
                  <TextInput
                    id="alerta-ativo"
                    value={tickerText}
                    onChange={(event) => setTickerText(event.target.value)}
                    placeholder={market === "us" ? "Ex.: AAPL" : "Ex.: PETR4"}
                    autoCapitalize="characters"
                    aria-describedby="alerta-ativo-dica"
                    className="pl-11 font-bold uppercase"
                  />
                </div>
              </Field>
              {market === "us" && (
                <Field>
                  <FieldLabel htmlFor="alerta-bolsa">Bolsa</FieldLabel>
                  <SelectInput
                    id="alerta-bolsa"
                    value={mic}
                    onChange={(event) => setMic(event.target.value as UsMic)}
                  >
                    {US_EXCHANGES.map((option) => (
                      <option key={option.mic} value={option.mic}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              )}
            </div>
            <span id="alerta-ativo-dica" className="-mt-3 text-13 text-mist">
              {quoteHint}
            </span>

            <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
              <Legend>Tipo de alerta</Legend>
              <div className="grid grid-cols-1 items-start gap-2.5 @tab:grid-cols-2">
                <DirectionOption
                  direction="buy"
                  checked={direction === "buy"}
                  onSelect={() => setDirection("buy")}
                />
                <DirectionOption
                  direction="sell"
                  checked={direction === "sell"}
                  onSelect={() => setDirection("sell")}
                />
              </div>
            </fieldset>

            <Field>
              <FieldLabel htmlFor="alerta-gatilho">
                Valor-gatilho {market === "us" ? "em US$" : "em R$"}
              </FieldLabel>
              <AmountInput
                id="alerta-gatilho"
                value={targetText}
                onChange={(event) => setTargetText(event.target.value)}
                placeholder={market === "us" ? "US$ 0,00" : "R$ 0,00"}
                aria-describedby="alerta-gatilho-dica"
                className="h-16 rounded-tile text-28 @desk:h-20 @desk:text-40"
              />
              <FieldHint id="alerta-gatilho-dica">
                {distancePct === null
                  ? market === "us"
                    ? "O alvo fica em dólar: a variação do câmbio não dispara o alerta."
                    : "—"
                  : `${Math.abs(distancePct).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% ${distancePct >= 0 ? "acima" : "abaixo"} do preço atual`}
              </FieldHint>
            </Field>

            <div role="group" aria-label="Atalhos de valor" className="flex gap-2">
              {SHORTCUTS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  disabled={!priceCents}
                  onClick={() => applyShortcut(pct)}
                  className={cn(chipClass(false), "disabled:opacity-50")}
                >
                  {direction === "buy" ? "−" : "+"}
                  {pct}%
                </button>
              ))}
            </div>

            <div role="alert" aria-live="assertive">
              {problem && (
                <Note icon="alert-triangle" tone="warning">
                  {problem}
                </Note>
              )}
            </div>
          </form>

          <div className="hidden justify-end gap-2.5 @desk:flex">{actions("xl")}</div>
        </section>

        <div className="flex min-w-0 flex-col gap-4 @tab:gap-5">
          <section className="flex min-w-0 flex-col gap-4 rounded-card border border-line bg-card p-5 @desk:p-7">
            <h2 className="m-0 font-display text-18 leading-[1.25] font-bold @desk:text-22">
              {symbol ?? "Ativo"} agora
            </h2>
            <dl className="m-0 grid grid-cols-2 gap-3">
              <StatTile label="Preço agora" value={money(priceCents)} tone="sand" />
              <StatTile
                label="Falta para o alerta"
                value={
                  distancePct === null
                    ? "—"
                    : `${distancePct >= 0 ? "+" : "−"}${Math.abs(distancePct).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
                }
                tone="urucum"
              />
              {market === "us" && (
                <StatTile
                  label="Em reais agora"
                  value={formatMoney(quote.data?.priceBrlCents ?? null, "BRL")}
                  tone="sand"
                />
              )}
            </dl>
            <AgentTip agent="caramelo">
              Acompanhamos o preço a cada atualização e avisamos uma única vez quando o valor for
              atingido. Depois você decide se renova o alerta.
            </AgentTip>
          </section>
          <div className="hidden justify-end gap-2.5 @tab:flex @desk:hidden">{actions("md")}</div>
        </div>
      </div>

      <MobileActionBar>
        <Button variant="primary" size="xl" block onClick={submit} disabled={create.isPending}>
          <Icon name="check" size={18} />
          <span>{create.isPending ? "Criando…" : "Criar alerta"}</span>
        </Button>
      </MobileActionBar>
    </Page>
  );
}
