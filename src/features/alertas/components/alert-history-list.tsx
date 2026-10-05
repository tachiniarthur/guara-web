import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Tag } from "@/components/ui/tag";

import type { AlertHistoryItem } from "../data";

/** Histórico de avisos. `stacked` coloca a etiqueta de pendência embaixo do texto (mobile). */
export function AlertHistoryList({
  items,
  stacked = false,
}: {
  items: AlertHistoryItem[];
  stacked?: boolean;
}) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 border-b border-line py-3">
          <AgentAvatar agent={item.agent} size={32} variant="ring" />
          <span className="flex min-w-0 grow flex-col leading-[1.4]">
            <span className="font-medium">{item.texto}</span>
            <span className="text-12 text-caption">{item.quando}</span>
            {stacked && item.pendente && (
              <Tag tone="urucum" className="mt-1 self-start">
                {item.pendente}
              </Tag>
            )}
          </span>
          {!stacked && item.pendente && <Tag tone="urucum">{item.pendente}</Tag>}
        </li>
      ))}
    </ul>
  );
}
