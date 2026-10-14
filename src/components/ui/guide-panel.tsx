import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./icon";
import { ListRow, RowList } from "./list-row";
import { Panel, PanelHeader } from "./panel";

export type GuideItem = { icon: IconName; titulo: string; texto: string };

/** "Como funciona": itens com ícone em bloco, título e explicação curta. */
export function GuidePanel({
  title,
  items,
  className,
}: {
  title: string;
  items: GuideItem[];
  className?: string;
}) {
  return (
    <Panel className={cn("grow gap-3.5 p-5.5", className)}>
      <PanelHeader title={title} titleClassName="text-18 tracking-normal" />
      <RowList>
        {items.map((item, i) => (
          <ListRow
            key={item.titulo}
            leading={
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
              >
                <Icon name={item.icon} />
              </span>
            }
            title={item.titulo}
            meta={item.texto}
            divider={i < items.length - 1}
          />
        ))}
      </RowList>
    </Panel>
  );
}
