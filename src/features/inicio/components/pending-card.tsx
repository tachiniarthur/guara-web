import Link from "next/link";

import { CardAction, CardBody } from "@/components/states/screen-state-context";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { CountBadge } from "@/components/ui/count-badge";
import { cn } from "@/lib/utils";

import { pendingItems } from "../data";

/** "Precisa de você": decisões pendentes que a turma separou. */
export function PendingCard({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-3.5", className)}>
      <CardHeader
        title="Precisa de você"
        action={
          <CardAction>
            <CountBadge
              count={pendingItems.length}
              size="lg"
              label={`${pendingItems.length} pendências`}
            />
          </CardAction>
        }
      />
      <CardBody className="grow">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {pendingItems.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-tile px-2.5 py-2",
                item.urgente ? "bg-urucum-bg" : "bg-shade",
              )}
            >
              <AgentAvatar agent={item.agent} size={44} />
              <span className="flex min-w-0 grow flex-col leading-[1.3]">
                <strong className="text-15 @tab:truncate">{item.titulo}</strong>
                <span className="text-13 text-mist @tab:truncate">{item.detalhe}</span>
                <span
                  className={cn("text-12 font-bold", item.urgente ? "text-urucum" : "text-caption")}
                >
                  {item.origem}
                </span>
              </span>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: item.urgente ? "primary" : "outline", size: "md" }),
                  "px-3.5 @tab:px-5",
                )}
              >
                <span>{item.acao}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
