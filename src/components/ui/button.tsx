import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border font-bold whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Amarelo-tucano: ação principal. */
        primary: "border-tucano bg-tucano text-canvas hover:bg-tucano/90",
        /** Card com borda de controle. */
        secondary: "border-line-strong bg-card text-sand hover:bg-shade",
        /** Só a borda de controle. */
        outline: "border-line-strong bg-transparent text-sand hover:bg-shade",
        ghost: "border-transparent bg-transparent text-sand hover:bg-shade",
        /** Areia: escolha confirmada (ex.: "Continuar" no questionário). */
        light: "border-sand bg-sand text-canvas hover:bg-sand/90",
        /** Verde-mata com a faixa do tucano ao fundo (ver ForestBackdrop). */
        forest: "border-sand/35 bg-mata text-sand",
        /** Translúcido, para usar sobre imagens. */
        glass: "border-sand/35 bg-canvas/70 text-sand hover:bg-canvas/85",
        danger: "border-urucum bg-urucum text-canvas hover:bg-urucum/90",
      },
      size: {
        sm: "h-10 px-4.5 text-14",
        md: "h-11 px-4.5 text-14",
        lg: "h-12 px-4.5 text-15",
        xl: "h-13 px-4.5 text-15",
        "2xl": "h-14 px-6.5 text-17",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

/** Faixa do tucano com degradê escuro, usada nos botões "forest" (ex.: Nova conversa). */
export function ForestBackdrop({
  overlay = "gradient",
}: {
  overlay?: "gradient" | "flat" | "deep";
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- textura decorativa */}
      <img
        src="/images/marca/faixa-tucano.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 block size-full object-cover object-right"
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          overlay === "flat"
            ? "bg-canvas/35"
            : overlay === "deep"
              ? "bg-[linear-gradient(90deg,rgba(11,17,14,0.85)_0%,rgba(11,17,14,0.55)_50%,rgba(11,17,14,0.1)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(11,17,14,0.78)_0%,rgba(11,17,14,0.45)_60%,rgba(11,17,14,0.15)_100%)]",
        )}
      />
    </>
  );
}

type ButtonProps = ComponentProps<"button"> & Variants;

export function Button({ variant, size, block, className, children, type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    >
      {variant === "forest" && <ForestBackdrop />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & Variants & { children: ReactNode };

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
      {variant === "forest" && <ForestBackdrop />}
      {children}
    </Link>
  );
}
