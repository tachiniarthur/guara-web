import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { plan } from "@/features/perfil/data";
import { cn } from "@/lib/utils";

import { banks } from "../data";

/**
 * Bancos para conectar pelo Open Finance. Os já conectados aparecem marcados; os outros levam
 * à autorização pelo Malvo.
 */
export function BankPicker({ connected = ["nubank"] }: { connected?: string[] }) {
  return (
    <>
      <div className="grid grid-cols-2 items-start gap-2.5">
        {banks.map((bank) => {
          const on = connected.includes(bank.id);
          const className = cn(
            "flex min-h-15 items-center gap-3 rounded-full px-3.5 text-left text-sand no-underline",
            on
              ? "border-2 border-folha bg-folha-bg"
              : "border border-line-strong bg-field hover:bg-shade",
            // No mobile o Santander aparece depois do C6, como no protótipo.
            bank.id === "santander" && "order-1 md:order-none",
          );
          const content = (
            <>
              <span
                aria-hidden="true"
                className="flex size-[2.25rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas font-display text-14 font-bold"
              >
                {bank.sigla}
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className="text-15 font-bold">{bank.nome}</span>
                {on ? (
                  <span className="flex items-center gap-1 text-12 font-bold text-folha">
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    Conectado
                  </span>
                ) : (
                  <span className="text-12 text-caption">Conectar</span>
                )}
              </span>
            </>
          );
          return on ? (
            <div key={bank.id} className={className}>
              {content}
            </div>
          ) : (
            <Link key={bank.id} href={`/onboarding/bancos/${bank.id}`} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
      <p className="m-0 text-14 text-mist">
        <strong className="text-sand">
          {connected.length} de {plan.total}
        </strong>{" "}
        bancos do plano {plan.nome}. Dá para conectar mais depois.
      </p>
    </>
  );
}
