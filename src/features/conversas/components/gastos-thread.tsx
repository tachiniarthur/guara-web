import { ProgressBar } from "@/components/ui/progress-bar";

import { GuaraMessage, ChatDateChip, MessageText, UserBubble } from "./messages";

/** Conversa de exemplo: gastos de setembro com o Guará (e o aviso de uma compra fora do padrão). */
export function GastosThread() {
  return (
    <>
      <ChatDateChip>Hoje, 14:02 · Gastos de setembro</ChatDateChip>
      <UserBubble>quanto gastei com comida esse mês?</UserBubble>
      <GuaraMessage tag="gastos">
        <MessageText>
          Você gastou <strong>R$ 742,18</strong> em Alimentação.
        </MessageText>
        <div className="flex flex-col gap-2 rounded-[0.875rem] bg-canvas p-3">
          <div className="flex justify-between">
            <span className="text-13 text-mist">Alimentação</span>
            <strong className="tabular-nums">R$ 742 de R$ 1.000</strong>
          </div>
          <ProgressBar value={74} tone="tucano" height={10} />
          <span className="flex items-center gap-1.5 text-13 font-bold text-tucano">
            74% do teto
          </span>
        </div>
        <MessageText>O que mais pesou foi o delivery: 6 pedidos, R$ 218,40.</MessageText>
      </GuaraMessage>
      <UserBubble>e se eu cortar o delivery pela metade?</UserBubble>
      <GuaraMessage tag="gastos">
        <MessageText>
          Sobram uns <strong>R$ 110 por mês</strong>. Se quiser, mostro onde deixar isso rendendo.
        </MessageText>
      </GuaraMessage>
      <GuaraMessage tag="fora do padrão" tagTone="urucum">
        <MessageText>
          Antes disso: a compra das 02:14 ainda está sem resposta. Foi você?
        </MessageText>
      </GuaraMessage>
    </>
  );
}
