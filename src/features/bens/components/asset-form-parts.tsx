import type { ReactNode } from "react";

import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/** "Prévia no patrimônio": total de hoje → com o bem, e o que muda. */
export function NetWorthPreview({
  hoje,
  depois,
  items,
  children,
  className,
}: {
  hoje: string;
  depois: string;
  items: { label: string; value: string }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("p-4 @tab:p-5.5 @desk:p-6", className)}>
      <PanelHeader
        title="Prévia no patrimônio"
        subtitle="Bens entram no patrimônio total, não na alocação do perfil"
        titleClassName="text-17 tracking-normal"
      />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <div className="flex flex-col gap-0.5 rounded-[0.875rem] bg-field p-3">
          <span className="text-12 text-caption">Patrimônio total hoje</span>
          <strong className="tabular-nums">{hoje}</strong>
        </div>
        <span className="text-caption">
          <Icon name="chevron-right" size={18} />
        </span>
        <div className="flex flex-col gap-0.5 rounded-[0.875rem] bg-folha-bg p-3">
          <span className="text-12 text-folha">Com este bem</span>
          <strong className="tabular-nums">{depois}</strong>
        </div>
      </div>
      <DetailList items={items} />
      {children}
    </Panel>
  );
}
