import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Busca nas conversas (campo em pílula com lupa). */
export function ConversationSearch({
  id,
  className,
  inputClassName,
  iconClassName,
}: {
  id: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar conversas
      </label>
      <span
        className={cn(
          "pointer-events-none absolute top-[0.8125rem] left-3 text-caption",
          iconClassName,
        )}
      >
        <Icon name="search" size={18} />
      </span>
      <input
        id={id}
        type="search"
        placeholder="Buscar conversas"
        className={cn(
          "h-12 w-full rounded-full border border-line-strong bg-field pr-3.5 pl-[2.375rem] text-15 text-sand",
          inputClassName,
        )}
      />
    </div>
  );
}
