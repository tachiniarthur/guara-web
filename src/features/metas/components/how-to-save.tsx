"use client";

import { useState } from "react";

import { CheckboxRow, RadioCard, SelectInput, TextInput } from "@/components/ui/form";
import { LabeledField } from "@/components/ui/form-sections";
import { Icon } from "@/components/ui/icon";

import { goalDraft, type SaveOption } from "../data";

const grid = "contents @tab:grid @tab:grid-cols-2 @tab:items-start @tab:gap-3.5 @desk:gap-4";

const days = Array.from({ length: 28 }, (_, i) => i + 1);

/**
 * "Como guardar" da nova meta: onde o dinheiro fica (as aplicações que a pessoa já tem; sem
 * nenhuma, sugestões genéricas), o valor por mês, o dia de guardar e o aviso nesse dia (ligado
 * por padrão).
 */
export function HowToSave({ options, suggested }: { options: SaveOption[]; suggested: boolean }) {
  const [day, setDay] = useState(goalDraft.dia);
  return (
    <>
      <LabeledField
        label={suggested ? "Onde guardar · sugestões para começar" : "Onde guardar"}
        hint={
          suggested
            ? "Você ainda não tem aplicações conectadas. Estas costumam servir bem para metas: rendem mais que a poupança e dá para resgatar quando precisar."
            : undefined
        }
      >
        {options.map((opcao, i) => (
          <RadioCard
            key={opcao.titulo}
            name="meta-onde"
            title={opcao.titulo}
            description={opcao.texto}
            defaultChecked={i === 0}
          />
        ))}
      </LabeledField>
      <div className={grid}>
        <LabeledField id="meta-mensal" label="Valor mensal para a meta" hint={goalDraft.mensalDica}>
          <TextInput id="meta-mensal" inputMode="decimal" defaultValue={goalDraft.mensal} />
        </LabeledField>
        <LabeledField
          id="meta-dia"
          label="Dia para guardar para a meta"
          hint={day === goalDraft.diaSalario ? "Junto com o salário." : undefined}
        >
          <SelectInput
            id="meta-dia"
            value={day}
            onChange={(event) => setDay(Number(event.target.value))}
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {`Todo dia ${d}`}
              </option>
            ))}
          </SelectInput>
        </LabeledField>
      </div>
      <CheckboxRow
        id="meta-avisar"
        label={
          <span className="flex items-center gap-1.5">
            <Icon name="bell" size={16} className="text-mist" />
            {`Me avisar todo dia ${day} para guardar para esta meta`}
          </span>
        }
        description="Notificação no celular às 9h"
        defaultChecked
        accent="tucano"
        className="rounded-tile border border-line px-3.5"
      />
    </>
  );
}
