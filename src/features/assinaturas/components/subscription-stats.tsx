import { Icon, type IconName } from "@/components/ui/icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import { subscriptionStats } from "../data";

function Stat({
  label,
  value,
  caption,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  caption?: string;
  icon?: IconName;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-12 font-bold tracking-[.06em] text-caption uppercase">
        {icon && <Icon name={icon} size={16} className="text-arara" />}
        {label}
      </span>
      <span
        className={cn(
          "font-display text-24 leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap tabular-nums @desk:text-28",
          valueClassName,
        )}
      >
        {value}
      </span>
      {caption && <span className="text-13 text-mist">{caption}</span>}
    </div>
  );
}

/**
 * Faixa do topo de Assinaturas: quantas estão ativas, o gasto do mês, a projeção para o ano e a
 * média por serviço. Duas colunas no celular, quatro a partir do tablet.
 */
export function SubscriptionStats({ className }: { className?: string }) {
  const { ativas, mensal, anual, media } = subscriptionStats;
  return (
    <section
      aria-label="Resumo das assinaturas"
      className={cn(
        "card-enter grid grid-cols-2 gap-x-4 gap-y-5 rounded-card border border-line bg-card p-5 @tab:grid-cols-4 @tab:p-6",
        className,
      )}
    >
      <Stat icon="repeat" label="Assinaturas" value={String(ativas)} caption="ativas" />
      <Stat label="Gasto mensal" value={formatCurrency(mensal)} caption="por mês" />
      <Stat
        label="Projeção anual"
        value={formatCurrency(anual)}
        caption="em 12 meses"
        valueClassName="text-tucano"
      />
      <Stat
        label="Média por serviço"
        value={formatCurrency(media)}
        caption="por assinatura"
        valueClassName="text-folha"
      />
    </section>
  );
}
