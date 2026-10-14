import { Icon, type IconName } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";

/** Lista com ícone em bloco rebaixado à esquerda, título e uma linha de apoio. */
export function IconRowList({
  items,
}: {
  items: readonly { icon: IconName; titulo: string; texto: string }[];
}) {
  return (
    <RowList>
      {items.map((item, i) => (
        <ListRow
          key={item.titulo}
          title={item.titulo}
          meta={item.texto}
          divider={i < items.length - 1}
          leading={
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
            >
              <Icon name={item.icon} size={20} />
            </span>
          }
        />
      ))}
    </RowList>
  );
}
