import { ProgressBar } from "@/components/ui/progress-bar";

import { AgentMessage, ChatDateChip, MessageText, UserBubble } from "./messages";

/** Conversa de exemplo: gastos de setembro com o Tamanduá (e o Quero-quero entrando). */
export function GastosThread() {
  return (
    <>
      <ChatDateChip>Hoje, 14:02 · Gastos de setembro</ChatDateChip>
      <UserBubble>quanto gastei com comida esse mês?</UserBubble>
      <AgentMessage agent="tamandua" tag="gastos">
        <MessageText>
          Farejei tudo: <strong>R$ 742,18</strong> em Alimentação.
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
        <MessageText>O formigueiro mais cheio foi o delivery: 6 pedidos, R$ 218,40.</MessageText>
      </AgentMessage>
      <UserBubble>e se eu cortar o delivery pela metade?</UserBubble>
      <AgentMessage agent="tamandua" tag="gastos">
        <MessageText>
          Sobram uns <strong>R$ 110 por mês</strong>. O Pacu já avisou que sabe onde deixar isso
          rendendo.
        </MessageText>
      </AgentMessage>
      <AgentMessage agent="quero-quero" tag="entrou na conversa" tagTone="urucum">
        <MessageText>
          Quero-quero! Antes disso: a compra das 02:14 ainda tá sem resposta.
        </MessageText>
      </AgentMessage>
    </>
  );
}
