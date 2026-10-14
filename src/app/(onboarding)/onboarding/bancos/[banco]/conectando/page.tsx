import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { banks } from "@/features/onboarding/data";
import {
  bankFromSlug,
  MalvoShell,
  StatusNote,
} from "@/features/onboarding/components/malvo-screens";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return banks.map((bank) => ({ banco: bank.id }));
}

type StepState = "feito" | "agora" | "depois";

function Spinner() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      role="img"
      aria-label="Carregando"
      className="block size-18 motion-safe:animate-spin"
    >
      <circle cx="36" cy="36" r="30" fill="none" stroke="#1A241F" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r="30"
        fill="none"
        stroke="#F2C230"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="70 119"
        transform="rotate(-60 36 36)"
      />
    </svg>
  );
}

export default async function ConectandoBancoPage({
  params,
}: {
  params: Promise<{ banco: string }>;
}) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  const steps: { titulo: string; texto: string; estado: StepState }[] = [
    { titulo: `Autorização no ${bank.nome}`, texto: "Confirmada às 14:31", estado: "feito" },
    {
      titulo: "Buscando contas e cartões",
      texto: "2 contas e 1 cartão encontrados",
      estado: "agora",
    },
    { titulo: "Buscando investimentos", texto: "Aguardando", estado: "depois" },
    { titulo: "Organizando lançamentos em categorias", texto: "Aguardando", estado: "depois" },
  ];
  const continueApp = (block?: boolean) => (
    <ButtonLink href="/" variant="secondary" size="xl" block={block}>
      <span>Continuar usando o app</span>
    </ButtonLink>
  );
  return (
    <MalvoShell
      desktopWidth="lg:max-w-[40rem]"
      className="min-h-[49.5rem] justify-center gap-4.5 md:min-h-0 md:gap-6.5 lg:gap-7"
      mobileActions={continueApp(true)}
    >
      <div className="flex flex-col items-center gap-3.5 pt-3 pb-1 text-center">
        <Spinner />
        <h1 className="m-0 font-display text-24 font-extrabold">Conectando o {bank.nome}…</h1>
        <p className="m-0 text-15 leading-[1.55] text-mist">
          Você autorizou no app do {bank.nome}. Agora estamos buscando seus dados.
        </p>
      </div>
      <ol aria-live="polite" className="m-0 list-none p-0">
        {steps.map((step) => (
          <li key={step.titulo} className="flex items-center gap-3 border-b border-line py-2.5">
            {step.estado === "feito" ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-folha-bg text-folha">
                <Icon name="check" size={16} strokeWidth={2.4} />
              </span>
            ) : (
              <span
                className={cn(
                  "size-7 shrink-0 rounded-full",
                  step.estado === "agora"
                    ? "border-3 border-tucano"
                    : "border-2 border-line-strong",
                )}
              />
            )}
            <span className="flex grow flex-col leading-[1.4]">
              <span
                className={cn(
                  step.estado === "agora" ? "font-bold" : "font-medium",
                  step.estado === "depois" ? "text-caption" : "text-sand",
                )}
              >
                {step.titulo}
              </span>
              <span className="text-13 text-caption">{step.texto}</span>
            </span>
          </li>
        ))}
      </ol>
      <StatusNote tone="arara" icon="clock">
        Isso pode levar até 1 minuto. Pode sair desta tela: avisamos quando terminar.
      </StatusNote>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 md:flex">
        {continueApp()}
      </div>
    </MalvoShell>
  );
}
