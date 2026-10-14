import { cn } from "@/lib/utils";

/** Progresso do questionário: "Pergunta 1 de 6" e seis segmentos. */
export function QuestionProgress({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-13 text-mist">{label}</span>
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-[2px]", i < done ? "bg-sand" : "bg-line")}
          />
        ))}
      </div>
    </div>
  );
}
