import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { bankAccess } from "../data";

export type AccessItem = { icon?: IconName; title: string; text?: string };

/**
 * "O que o Guará acessa", em destaque para passar segurança de relance: o que ele lê (verde) ao
 * lado do que nunca faz (vermelho, com cadeado), e de onde vem a conexão.
 */
export function AccessPanel({
  bank,
  sees = bankAccess.sees.map((title) => ({ title })),
  compact = false,
  className,
}: {
  /** Desktop: título ao lado das duas colunas, para caber na tela sem rolar (lista de bancos). */
  compact?: boolean;
  /** Nome do banco, quando a conexão é com um banco só. */
  bank?: string;
  /** O que é lido (com ícone e detalhe na tela de autorização). */
  sees?: AccessItem[];
  className?: string;
}) {
  return (
    <section
      aria-label={bank ? `O que o Guará acessa no ${bank}` : "O que o Guará acessa"}
      className={cn(
        "flex flex-col gap-4 rounded-card border border-folha/35 bg-card p-4.5 md:p-5.5",
        compact &&
          "lg:grid lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-3 lg:p-4",
        className,
      )}
    >
      <div
        className={cn("flex items-center gap-3", compact && "lg:flex-col lg:items-start lg:gap-2")}
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-folha-bg text-folha"
        >
          <Icon name="shield-check" size={22} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="m-0 font-display text-19 leading-tight font-bold">
            {bank ? `O que o Guará acessa no ${bank}` : "O que o Guará acessa"}
          </h2>
          <span className="text-13 text-mist">
            Só leitura, pelo Open Finance Brasil, regulado pelo Banco Central
          </span>
        </div>
      </div>
      <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2", compact && "lg:contents")}>
        <div className="flex flex-col gap-2.5 rounded-tile bg-folha-bg/60 p-3.5">
          <span className="text-12 font-bold tracking-[.06em] text-folha uppercase">
            O Guará vê
          </span>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {sees.map((item) => (
              <li key={item.title} className="flex items-start gap-2.5 text-14">
                <span aria-hidden="true" className="mt-px text-folha">
                  <Icon name={item.icon ?? "check"} size={18} strokeWidth={item.icon ? 1.8 : 2.4} />
                </span>
                <span className="flex flex-col leading-[1.35]">
                  <span className="font-semibold text-sand">{item.title}</span>
                  {item.text && <span className="text-12 text-mist">{item.text}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2.5 rounded-tile bg-urucum-bg p-3.5">
          <span className="text-12 font-bold tracking-[.06em] text-urucum uppercase">
            O Guará nunca
          </span>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {bankAccess.never.map((text) => (
              <li key={text} className="flex items-start gap-2.5 text-14">
                <span aria-hidden="true" className="mt-px text-urucum">
                  <Icon name="lock" size={18} />
                </span>
                <span className="leading-[1.35] font-semibold text-sand">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p
        className={cn(
          "m-0 flex items-start gap-2 text-13 leading-normal text-mist",
          compact && "lg:hidden",
        )}
      >
        <Icon name="info" size={16} className="mt-0.5" />
        Você autoriza no app do banco e pode revogar quando quiser, aqui em Meu perfil ou no próprio
        banco.
      </p>
    </section>
  );
}
