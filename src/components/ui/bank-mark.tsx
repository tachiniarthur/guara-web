import { bankBrand } from "@/lib/banks";
import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

/**
 * Quadrado com a marca do banco (cor e sigla). Decorativo: o nome do banco vem sempre escrito ao
 * lado. `size` em px.
 */
export function BankMark({
  bank,
  size = 36,
  className,
}: {
  /** Id ("itau") ou nome ("Itaú", "Itaú débito"). */
  bank: string;
  size?: number;
  className?: string;
}) {
  const brand = bankBrand(bank);
  // Siglas longas ("itaú", "inter") ficam menores para caber.
  const fontSize = size * (brand.mark.length > 2 ? 0.3 : brand.mark.length === 2 ? 0.38 : 0.46);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center font-sans leading-none font-extrabold tracking-[-0.02em]",
        className,
      )}
      style={{
        width: rem(size),
        height: rem(size),
        borderRadius: rem(size * 0.28),
        background: brand.background,
        color: brand.color,
        fontSize: rem(fontSize),
      }}
    >
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logo} alt="" className="size-[70%] object-contain" />
      ) : (
        brand.mark
      )}
    </span>
  );
}
