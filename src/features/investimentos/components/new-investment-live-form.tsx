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
import {
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
import type { InvestmentType } from "@/features/investimentos/data";
import {
  US_EXCHANGES,
  exchangeLabel,
  normalizeTicker,
  useAssetQuote,
  useB3Asset,
  type Market,
  type UsMic,
} from "@/features/mercado/live";
import { ApiError, apiRequest } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import {
  centsToDecimal,
  decimalToCents,
  multiplyDecimalByCents,
  parseDecimalInput,
  parseMoneyInput,
} from "@/lib/money-input";

import { InvestmentTypePicker } from "./investment-type-picker";

const CreatedSchema = z.object({ id: z.string() }).loose();

/** Hoje em São Paulo, "YYYY-MM-DD" (o campo de data e o limite dele). */
const todayInSaoPaulo = () => formatDate(new Date(), "yyyy-MM-dd");

/**
 * Adicionar investimento com os dados da API: ação, FII, ETF ou cripto da B3, ou ação e ETF dos
 * EUA (preço médio em US$ e dia da compra; o valor em reais usa o dólar desse dia). O protótipo
 * continua em `NewInvestmentPrototype`.
 */
export function NewInvestmentLiveForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<InvestmentType>("Ações, FIIs e ETFs");
  const [market, setMarket] = useState<Market>("b3");
  const [mic, setMic] = useState<UsMic>("XNAS");
  const [usKind, setUsKind] = useState<"stock" | "etf">("stock");
  const [tickerText, setTickerText] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [priceText, setPriceText] = useState("");
  const [purchasedOn, setPurchasedOn] = useState(todayInSaoPaulo());
  const [problem, setProblem] = useState<string | null>(null);

  const quoted = type === "Ações, FIIs e ETFs" || type === "Cripto";
  const abroad = type === "Ações, FIIs e ETFs" && market === "us";
  const symbol = normalizeTicker(tickerText);
  const exchange = abroad ? mic : null;
  const currency = abroad ? "USD" : "BRL";
  const asset = useB3Asset(symbol, { enabled: quoted && !abroad });
  const quote = useAssetQuote(symbol, exchange, { enabled: quoted });
  const quantity = parseDecimalInput(quantityText);
  const priceCents = parseMoneyInput(priceText);
  const quoteCents = quote.data?.price ? decimalToCents(quote.data.price) : null;

  const create = useMutation({
    mutationFn: () => {
      const body = abroad
        ? {
            instrumentType: usKind,
            symbol,
            micCode: exchange,
            quantity,
            originalAveragePrice: centsToDecimal(priceCents!),
            purchasedOn,
          }
        : {
            instrumentType: asset.data?.assetType,
            symbol,
            quantity,
            averagePriceCents: priceCents,
          };
      return apiRequest("/v1/investments/positions", CreatedSchema, { method: "POST", body });
    },
    onSuccess: async () => {
      // Carteira, alocação, início e metas leem as posições.
      await queryClient.invalidateQueries();
      router.push("/investimentos");
    },
    onError: (error) =>
      setProblem(error instanceof ApiError ? error.message : "Não deu para salvar o investimento."),
  });

  const submit = () => {
    setProblem(null);
    if (!symbol) return setProblem("Informe o ticker do ativo.");
    if (!abroad && asset.data === null) return setProblem("Não encontramos esse ativo na B3.");
    if (!abroad && !asset.data) return setProblem("Aguarde: estamos conferindo o ativo.");
    if (!quantity || !/[1-9]/.test(quantity)) return setProblem("Informe a quantidade.");
    if (!priceCents) return setProblem("Informe o preço médio de compra.");
    if (abroad && !purchasedOn) return setProblem("Informe o dia da compra.");
    create.mutate();
  };

  const assetHint = !symbol
    ? abroad
      ? "Ex.: AAPL na Nasdaq, VOO na NYSE Arca."
      : "Ex.: PETR4, HGLG11, BOVA11."
    : quote.isPending
      ? "Buscando a cotação…"
      : [
          abroad
            ? exchangeLabel(exchange)
            : (asset.data?.name ?? "Não encontramos esse ativo na B3"),
          quoteCents === null
            ? abroad
              ? "sem cotação agora (ativos dos EUA dependem da liberação da sua conta)"
              : "sem cotação agora"
            : `cotação ${quote.data?.asOf ? `às ${formatDate(quote.data.asOf, "HH:mm")}` : ""}: ${formatMoney(quoteCents, currency)}`,
        ].join(" · ");

  const costCents = quantity && priceCents ? multiplyDecimalByCents(quantity, priceCents) : null;
  const valueCents = quantity && quoteCents ? multiplyDecimalByCents(quantity, quoteCents) : null;

  const actions = (size: "md" | "xl") => (
    <>
      <ButtonLink
        href="/investimentos"
        variant="ghost"
        size={size}
        className="hover:bg-transparent"
      >
        <span>Cancelar</span>
      </ButtonLink>
      <Button variant="primary" size={size} onClick={submit} disabled={!quoted || create.isPending}>
        <Icon name="check" size={18} />
        <span>{create.isPending ? "Salvando…" : "Salvar investimento"}</span>
      </Button>
    </>
  );

  return (
    <Page
      padding="form"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Adicionar investimento" close="/investimentos" />}
    >
      <Breadcrumb
        className="hidden @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Adicionar investimento" },
        ]}
      />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Adicionar investimento
          </h1>
          <p className="m-0 hidden text-15 text-mist @desk:block">
            Para o que não vem automaticamente pelo Open Finance
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @desk:gap-6">
        <section className="flex min-w-0 flex-col @tab:gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-6 @desk:p-7">
          <form
            className="m-0 flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
              <Legend className="mb-2">Tipo</Legend>
              <InvestmentTypePicker value={type} onValueChange={setType} />
            </fieldset>

            {!quoted ? (
              <Note icon="info" tone="info">
                O cadastro de renda fixa pelo site ainda está chegando. Por enquanto, ações, FIIs,
                ETFs e cripto, da B3 ou dos EUA.
              </Note>
            ) : (
              <>
                {type === "Ações, FIIs e ETFs" && (
                  <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
                    <Legend>Mercado</Legend>
                    <SegmentedControl
                      label="Mercado"
                      value={market}
                      onValueChange={(value) => {
                        setMarket(value);
                        setPriceText("");
                      }}
                      options={[
                        { value: "b3", label: "Brasil (B3)" },
                        { value: "us", label: "Estados Unidos" },
                      ]}
                    />
                  </fieldset>
                )}

                <div className="grid grid-cols-1 items-start gap-3.5 @tab:grid-cols-2">
                  <Field className={abroad ? undefined : "@tab:col-span-2"}>
                    <FieldLabel htmlFor="investimento-ativo">Ativo</FieldLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
                        <Icon name="search" />
                      </span>
                      <TextInput
                        id="investimento-ativo"
                        value={tickerText}
                        onChange={(event) => setTickerText(event.target.value)}
                        placeholder={abroad ? "Ex.: AAPL" : "Ex.: PETR4"}
                        autoCapitalize="characters"
                        aria-describedby="investimento-ativo-dica"
                        className="pl-11 font-bold uppercase"
                      />
                    </div>
                  </Field>
                  {abroad && (
                    <Field>
                      <FieldLabel htmlFor="investimento-bolsa">Bolsa</FieldLabel>
                      <SelectInput
                        id="investimento-bolsa"
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
                <span id="investimento-ativo-dica" className="-mt-3 text-13 text-mist">
                  {assetHint}
                </span>

                {abroad && (
                  <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
                    <Legend>O ativo é</Legend>
                    <SegmentedControl
                      label="Tipo do ativo dos EUA"
                      value={usKind}
                      onValueChange={setUsKind}
                      options={[
                        { value: "stock", label: "Ação" },
                        { value: "etf", label: "ETF" },
                      ]}
                    />
                  </fieldset>
                )}

                <div className="grid grid-cols-1 items-start gap-3.5 @tab:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="investimento-quantidade">Quantidade</FieldLabel>
                    <TextInput
                      id="investimento-quantidade"
                      value={quantityText}
                      onChange={(event) => setQuantityText(event.target.value)}
                      inputMode="decimal"
                      placeholder="Ex.: 10"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="investimento-preco">
                      Preço médio de compra {abroad ? "em US$" : ""}
                    </FieldLabel>
                    <TextInput
                      id="investimento-preco"
                      value={priceText}
                      onChange={(event) => setPriceText(event.target.value)}
                      inputMode="decimal"
                      placeholder={abroad ? "US$ 0,00" : "R$ 0,00"}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="investimento-data">
                    Data da compra {abroad ? "" : "(opcional)"}
                  </FieldLabel>
                  <TextInput
                    id="investimento-data"
                    type="date"
                    value={purchasedOn}
                    max={todayInSaoPaulo()}
                    onChange={(event) => setPurchasedOn(event.target.value)}
                    aria-describedby="investimento-data-dica"
                  />
                  {abroad && (
                    <FieldHint id="investimento-data-dica">
                      O preço médio em reais usa o dólar desse dia (fechamento PTAX).
                    </FieldHint>
                  )}
                </Field>
              </>
            )}

            <div role="alert" aria-live="assertive">
              {problem && (
                <Note icon="alert-triangle" tone="warning">
                  {problem}
                </Note>
              )}
            </div>
          </form>
          <div className="hidden justify-end gap-2.5 @desk:flex">{actions("md")}</div>
        </section>

        <div className="flex min-w-0 flex-col gap-4 @tab:gap-5 @desk:gap-4">
          <section className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-card p-5">
            <span className="text-13 font-bold text-mist">Prévia da posição</span>
            <dl className="m-0 grid grid-cols-2 gap-3">
              <StatTile label="Custo" value={formatMoney(costCents, currency)} />
              <StatTile label="Valor agora" value={formatMoney(valueCents, currency)} />
              {abroad && (
                <StatTile
                  label="Cotação em reais"
                  value={formatMoney(quote.data?.priceBrlCents ?? null, "BRL")}
                  className="col-span-2"
                />
              )}
            </dl>
          </section>
          <AgentTip agent="pacu" className="@desk:order-last">
            Também dá para cadastrar pelo chat. Por exemplo:{" "}
            <em>“comprei 42 cotas de HGLG11 a R$ 158”</em>.
          </AgentTip>
          <div className="hidden justify-end gap-2.5 @tab:flex @desk:hidden">{actions("md")}</div>
        </div>
      </div>

      <MobileActionBar>
        <Button
          variant="primary"
          size="xl"
          block
          onClick={submit}
          disabled={!quoted || create.isPending}
        >
          <Icon name="check" size={18} />
          <span>{create.isPending ? "Salvando…" : "Salvar investimento"}</span>
        </Button>
      </MobileActionBar>
    </Page>
  );
}
