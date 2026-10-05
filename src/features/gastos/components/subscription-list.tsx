import type { SubscriptionSummary } from "../data";

/** Assinaturas detectadas: inicial em quadrado, próxima cobrança e valor. */
export function SubscriptionList({ items }: { items: SubscriptionSummary[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((item) => (
        <li key={item.id} className="flex min-h-11 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-canvas font-display font-bold"
          >
            {item.nome.charAt(0)}
          </span>
          <span className="flex grow flex-col leading-[1.3]">
            <span className="font-medium">{item.nome}</span>
            <span className="text-12 text-caption">{item.proxima}</span>
          </span>
          <span className="font-bold tabular-nums">{item.valor}</span>
        </li>
      ))}
    </ul>
  );
}
