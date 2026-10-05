import type { ReactNode } from "react";

import { TetoBar } from "@/features/gastos/components/teto-meter";

import { SimulationCard } from "./components/simulation-card";
import { AgentReply, ReplySuggestions, ReplyText, UserQuestion } from "./components/thread-parts";
import type { ConversationId } from "./data";

export type Thread = {
  id: ConversationId;
  title: string;
  /** Quando começou (cabeçalho do mobile e do tablet). */
  time: string;
  /** Quando começou (cabeçalho do desktop). */
  startedAt: string;
  /** Sugestões acima do campo de mensagem. */
  prompts?: string[];
  content: ReactNode;
};

export const threads: Record<ConversationId, Thread> = {
  "gastos-setembro": {
    id: "gastos-setembro",
    title: "Gastos de setembro",
    time: "Hoje, 14:32",
    startedAt: "Iniciada hoje às 14:32",
    prompts: ["Cancelar o Amazon Prime", "Resumo da semana", "Como está meu saldo?"],
    content: (
      <>
        <UserQuestion>quanto gastei com comida esse mês?</UserQuestion>
        <AgentReply agent="tamandua">
          <ReplyText>
            Farejei tudo: você gastou <strong>R$ 742,18</strong> em Alimentação, 74% do teto de R$
            1.000. Os avisos de R$ 500 e R$ 700 já foram enviados.
          </ReplyText>
          <div className="flex flex-col gap-2.5 rounded-tile border border-line bg-card p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-13 text-caption">Alimentação · setembro</span>
              <span className="font-display text-20 font-bold tracking-[-0.01em] tabular-nums">
                R$ 742,18
              </span>
            </div>
            <TetoBar
              percentual={74.2}
              estado="atenção"
              marcos={[
                { percentual: 50, rotulo: "500", atingido: true },
                { percentual: 70, rotulo: "700", atingido: true },
                { percentual: 100, rotulo: "teto 1.000", atingido: false },
              ]}
            />
          </div>
          <ReplyText>
            No ritmo atual, você fecha o mês perto de <strong>R$ 960</strong>.
          </ReplyText>
        </AgentReply>
        <UserQuestion>e assinaturas?</UserQuestion>
        <AgentReply agent="tamandua">
          <ReplyText>
            São 4 ativas, somando <strong>R$ 101,60/mês</strong>. O Amazon Prime não teve uso ligado
            a compras nos últimos 60 dias.
          </ReplyText>
        </AgentReply>
      </>
    ),
  },
  "aposentadoria-55": {
    id: "aposentadoria-55",
    title: "Aposentadoria aos 55",
    time: "Hoje, 14:40",
    startedAt: "Iniciada hoje às 14:40",
    content: (
      <>
        <UserQuestion className="max-w-[29.25rem]">
          Quanto preciso investir por mês para me aposentar em 25 anos recebendo R$ 10 mil por mês?
        </UserQuestion>
        <AgentReply agent="pacu" className="gap-3">
          <ReplyText size="sm">
            Sem pressa: considerando seu perfil moderado e os R$ 48.310,90 que você já tem
            investidos, fiz a conta com as premissas abaixo. Ajuste qualquer uma e o resultado muda
            na hora.
          </ReplyText>
          <SimulationCard />
          <p className="m-0 text-13 text-caption">
            Simulação educativa em valores de hoje (descontada a inflação). Não é recomendação de
            investimento.
          </p>
        </AgentReply>
        <ReplySuggestions
          items={[
            "E se eu esperar 30 anos? (R$ 4.150/mês)",
            "Mostre um cenário conservador",
            "Quanto consigo cortar dos gastos?",
          ]}
        />
      </>
    ),
  },
};
