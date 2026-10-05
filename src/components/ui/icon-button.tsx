import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { ForestBackdrop } from "./button";
import { Icon, type IconName } from "./icon";

export const iconButtonVariants = cva(
  "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border p-0 text-mist transition-colors",
  {
    variants: {
      variant: {
        outline: "border-line-strong bg-transparent hover:bg-shade hover:text-sand",
        ghost: "border-transparent bg-transparent hover:bg-shade hover:text-sand",
        forest: "border-sand/35 bg-mata text-sand",
        primary: "border-transparent bg-tucano text-canvas hover:bg-tucano/90",
      },
      size: { sm: "size-10", md: "size-11", lg: "size-12" },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

type Variants = VariantProps<typeof iconButtonVariants>;
type Common = Variants & { icon: IconName; iconSize?: number; label: string };

/** Botão só com ícone: o `label` vira o nome acessível. */
export function IconButton({
  icon,
  iconSize = 20,
  label,
  variant,
  size,
  className,
  type,
  ...props
}: Common & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {variant === "forest" && <ForestBackdrop overlay="flat" />}
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

export function IconButtonLink({
  icon,
  iconSize = 20,
  label,
  variant,
  size,
  className,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {variant === "forest" && <ForestBackdrop overlay="flat" />}
      <Icon name={icon} size={iconSize} />
    </Link>
  );
}
