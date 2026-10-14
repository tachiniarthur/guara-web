import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import type { ProfileQuestion } from "../data";

/** Uma pergunta do questionário de perfil: enunciado, 4 opções em cards e o "por que". */
export function ProfileQuestionFields({
  question,
  numero,
  total,
  name,
  kicker,
  legendClassName = "md:text-28 md:font-extrabold",
}: {
  question: ProfileQuestion;
  numero: number;
  total: number;
  /** Nome do grupo de rádio (único na página). */
  name: string;
  /** Linha acima do enunciado (por padrão, "Pergunta N de 6"). */
  kicker?: string;
  /** Corpo do enunciado (24 no celular, 28 a partir do tablet por padrão). */
  legendClassName?: string;
}) {
  return (
    <>
      <fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
        <legend className="mb-4 p-0">
          <span className="mb-2 block">
            <span className="text-13 text-caption">
              {kicker ?? `Pergunta ${numero} de ${total}`}
            </span>
          </span>
          <span
            className={cn(
              "block font-display text-24 leading-[1.3] font-bold tracking-[-0.01em]",
              legendClassName,
            )}
          >
            {question.pergunta}
          </span>
        </legend>
        {question.opcoes.map((opcao, i) => (
          <label
            key={opcao}
            htmlFor={`${name}-${i}`}
            className="flex min-h-15 cursor-pointer items-center gap-3.5 rounded-bubble border border-line-strong bg-field px-4 py-2.5 text-16 font-medium has-checked:border-2 has-checked:border-sand has-checked:font-bold"
          >
            <input
              id={`${name}-${i}`}
              type="radio"
              name={name}
              defaultChecked={i === question.escolhida}
              className="m-0 size-5.5 shrink-0 accent-sand"
            />
            <span className="leading-[1.35]">{opcao}</span>
          </label>
        ))}
      </fieldset>
      <details open className="border-t border-line pt-2">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-15 font-bold">
          <Icon name="info-lg" size={18} />
          Por que perguntamos isso?
        </summary>
        <p className="m-0 mt-1 text-14 leading-[1.6] text-mist">{question.porque}</p>
      </details>
    </>
  );
}
