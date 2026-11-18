"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog, DialogText } from "@/components/ui/confirm-dialog";
import { Field, FieldHint, FieldLabel, RadioCard, TextInput } from "@/components/ui/form";
import { Note } from "@/components/ui/note";
import { Presence } from "@/components/ui/presence";
import { ApiError } from "@/lib/api";
import { todayInSaoPaulo } from "@/lib/format";
import { centsToDecimal, parseDecimalInput, parseMoneyInput } from "@/lib/money-input";

import {
  useAddMovement,
  useRemovePosition,
  useUpdatePosition,
  type AssetView,
  type PositionPatch,
} from "../live";

export type AssetDialog = "editar" | "movimentar" | "remover" | null;

const errorText = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

const today = () => todayInSaoPaulo();

const moneyText = (cents: number | null) =>
  cents === null ? "" : centsToDecimal(cents).replace(".", ",");

/** Os três diálogos da página do ativo, um por vez. */
export function AssetDialogs({
  asset,
  open,
  onClose,
}: {
  asset: AssetView;
  open: AssetDialog;
  onClose: () => void;
}) {
  return (
    <Presence show={open !== null}>
      {open === "editar" && <EditDialog asset={asset} onClose={onClose} />}
      {open === "movimentar" && <MovementDialog asset={asset} onClose={onClose} />}
      {open === "remover" && <RemoveDialog asset={asset} onClose={onClose} />}
    </Presence>
  );
}

/** Correção: nome; com ticker, quantidade e preço médio; sem ticker, o valor de hoje. */
function EditDialog({ asset, onClose }: { asset: AssetView; onClose: () => void }) {
  const update = useUpdatePosition(asset.id);
  const { form } = asset;
  const [name, setName] = useState(form.name);
  const [quantity, setQuantity] = useState(
    asset.cotado ? String(Number(form.quantity)).replace(".", ",") : "",
  );
  const [average, setAverage] = useState(moneyText(form.averagePriceCents));
  const [value, setValue] = useState(moneyText(form.manualValueCents));
  // Posição dos EUA: o preço médio em reais sai do dólar da compra; aqui só o nome.
  const abroad = asset.bolsa !== null;
  const [invalid, setInvalid] = useState<string | null>(null);

  function save() {
    const body: PositionPatch = {};
    const trimmed = name.trim();
    if (!trimmed) return setInvalid("Informe o nome.");
    if (trimmed !== form.name) body.name = trimmed;
    if (asset.cotado && !abroad) {
      const q = parseDecimalInput(quantity);
      const avg = parseMoneyInput(average);
      if (q === null || Number(q) <= 0) return setInvalid("Informe a quantidade.");
      if (avg === null) return setInvalid("Informe o preço médio.");
      if (Number(q) !== Number(form.quantity)) body.quantity = q;
      if (avg !== form.averagePriceCents) body.averagePriceCents = avg;
    }
    if (!asset.cotado) {
      const cents = parseMoneyInput(value);
      if (cents === null) return setInvalid("Informe o valor de hoje.");
      if (cents !== form.manualValueCents) body.manualValueCents = cents;
    }
    setInvalid(null);
    if (Object.keys(body).length === 0) return onClose();
    update.mutate(body, { onSuccess: onClose });
  }

  return (
    <ConfirmDialog
      title={`Corrigir ${asset.nome}`}
      onClose={onClose}
      className="md:w-[30rem] lg:w-[32.5rem]"
    >
      <DialogText>
        Correção não conta como aporte nem resgate. Para registrar dinheiro que entrou ou saiu, use
        &quot;Registrar movimentação&quot;.
      </DialogText>
      <Field>
        <FieldLabel htmlFor="ativo-nome">Nome</FieldLabel>
        <TextInput
          id="ativo-nome"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      {asset.cotado && !abroad && (
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="ativo-quantidade">Quantidade</FieldLabel>
            <TextInput
              id="ativo-quantidade"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ativo-preco">Preço médio (R$)</FieldLabel>
            <TextInput
              id="ativo-preco"
              inputMode="decimal"
              value={average}
              onChange={(e) => setAverage(e.target.value)}
            />
          </Field>
        </div>
      )}
      {!asset.cotado && (
        <Field>
          <FieldLabel htmlFor="ativo-valor">Valor de hoje (R$)</FieldLabel>
          <TextInput
            id="ativo-valor"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <FieldHint>O valor que aparece no extrato da instituição.</FieldHint>
        </Field>
      )}
      {(invalid || update.error) && (
        <Note icon="alert-triangle" tone="warning">
          {invalid ?? errorText(update.error, "Não deu para salvar. Tente de novo.")}
        </Note>
      )}
      <Button variant="primary" size="lg" block disabled={update.isPending} onClick={save}>
        <span>{update.isPending ? "Salvando…" : "Salvar correção"}</span>
      </Button>
    </ConfirmDialog>
  );
}

/** Aporte ou resgate: a API recalcula a quantidade e o preço médio. */
function MovementDialog({ asset, onClose }: { asset: AssetView; onClose: () => void }) {
  const add = useAddMovement(asset.id);
  const abroad = asset.bolsa !== null;
  const [kind, setKind] = useState<"contribution" | "redemption">("contribution");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(today);
  const [invalid, setInvalid] = useState<string | null>(null);

  function save() {
    const q = asset.cotado ? parseDecimalInput(quantity) : null;
    if (asset.cotado && (q === null || Number(q) <= 0)) return setInvalid("Informe a quantidade.");
    if (!date || date > today()) return setInvalid("A data não pode ser futura.");
    if (abroad) {
      const usd = parseDecimalInput(amount);
      if (usd === null || Number(usd) <= 0) return setInvalid("Informe o valor em US$.");
      setInvalid(null);
      return add.mutate(
        { kind, originalAmount: usd, quantity: q ?? undefined, occurredOn: date },
        { onSuccess: onClose },
      );
    }
    const cents = parseMoneyInput(amount);
    if (cents === null || cents <= 0) return setInvalid("Informe o valor.");
    setInvalid(null);
    add.mutate(
      { kind, amountCents: cents, quantity: q ?? undefined, occurredOn: date },
      { onSuccess: onClose },
    );
  }

  return (
    <ConfirmDialog
      title={`Registrar movimentação em ${asset.nome}`}
      heading="Registrar movimentação"
      onClose={onClose}
      className="md:w-[30rem] lg:w-[32.5rem]"
    >
      <fieldset aria-label="Tipo" className="m-0 grid grid-cols-2 gap-3 border-none p-0">
        <RadioCard
          name="tipo"
          title="Aporte"
          description="Dinheiro que entrou"
          checked={kind === "contribution"}
          onChange={() => setKind("contribution")}
        />
        <RadioCard
          name="tipo"
          title="Resgate"
          description="Dinheiro que saiu"
          checked={kind === "redemption"}
          onChange={() => setKind("redemption")}
        />
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="mov-valor">{abroad ? "Valor (US$)" : "Valor (R$)"}</FieldLabel>
          <TextInput
            id="mov-valor"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        {asset.cotado ? (
          <Field>
            <FieldLabel htmlFor="mov-quantidade">Quantidade</FieldLabel>
            <TextInput
              id="mov-quantidade"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor="mov-data">Data</FieldLabel>
            <TextInput
              id="mov-data"
              type="date"
              max={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        )}
      </div>
      {asset.cotado && (
        <Field>
          <FieldLabel htmlFor="mov-data">Data</FieldLabel>
          <TextInput
            id="mov-data"
            type="date"
            max={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      )}
      <FieldHint>Com custos e taxas. A data não pode ser futura.</FieldHint>
      {(invalid || add.error) && (
        <Note icon="alert-triangle" tone="warning">
          {invalid ?? errorText(add.error, "Não deu para registrar. Tente de novo.")}
        </Note>
      )}
      <Button variant="primary" size="lg" block disabled={add.isPending} onClick={save}>
        <span>
          {add.isPending
            ? "Registrando…"
            : kind === "contribution"
              ? "Registrar aporte"
              : "Registrar resgate"}
        </span>
      </Button>
    </ConfirmDialog>
  );
}

function RemoveDialog({ asset, onClose }: { asset: AssetView; onClose: () => void }) {
  const router = useRouter();
  const remove = useRemovePosition(asset.id);
  return (
    <ConfirmDialog
      title={`Remover ${asset.nome}`}
      onClose={onClose}
      centered
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(undefined, { onSuccess: () => router.replace("/investimentos") })
            }
          >
            <span>{remove.isPending ? "Removendo…" : "Remover"}</span>
          </Button>
        </>
      }
    >
      <DialogText>
        A posição e as movimentações dela saem da carteira. Não dá para desfazer.
      </DialogText>
      {remove.error && (
        <Note icon="alert-triangle" tone="warning">
          {errorText(remove.error, "Não deu para remover. Tente de novo.")}
        </Note>
      )}
    </ConfirmDialog>
  );
}
