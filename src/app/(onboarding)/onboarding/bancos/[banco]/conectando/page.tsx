import { banks } from "@/features/onboarding/data";
import { BackToBanks, ConnectingSteps } from "@/features/onboarding/components/connecting-steps";
import {
  bankFromSlug,
  MalvoShell,
  StatusNote,
} from "@/features/onboarding/components/malvo-screens";

export function generateStaticParams() {
  return banks.map((bank) => ({ banco: bank.id }));
}

export default async function ConectandoBancoPage({
  params,
}: {
  params: Promise<{ banco: string }>;
}) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  return (
    <MalvoShell
      desktopWidth="lg:max-w-[40rem]"
      className="min-h-[49.5rem] justify-center gap-4.5 md:min-h-0 md:gap-6.5 lg:gap-7"
      mobileActions={<BackToBanks block />}
    >
      <ConnectingSteps bank={bank} />
      <StatusNote tone="arara" icon="clock">
        Isso pode levar até 1 minuto. Pode sair desta tela: avisamos quando terminar.
      </StatusNote>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 md:flex">
        <BackToBanks />
      </div>
    </MalvoShell>
  );
}
