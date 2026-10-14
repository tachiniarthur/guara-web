import type { ReactNode } from "react";

import { TetoBar } from "@/features/gastos/components/teto-meter";

import { ChatDateChip } from "./components/messages";
import { SimulationCard } from "./components/simulation-card";
import {
  CalledBy,
  TypingCursor,
  TypingIndicator,
  UnavailableAlert,
  UnsentMessage,
} from "./components/thread-status";
import { AgentReply, ReplySuggestions, ReplyText, UserQuestion } from "./components/thread-parts";
import type { ConversationId } from "./data";

export type Thread = {
  id: ConversationId;
  title: string;
  /** Quando começou (cabeçalho do mobile e do tablet). */
  time: string;
  /** Linha de apoio do painel de chat ("Hoje, 14:32 · com o Tamanduá"). */
  subtitle: string;
  /** Apoio do cabeçalho em tela cheia, quando inclui com quem é a conversa. */
  pageSubtitle?: string;
  /** A resposta ainda está sendo escrita (o envio vira "parar"). */
  typing?: boolean;
  /** Anexo que não chegou a ser enviado, acima do campo. */
  attachmentFailed?: boolean;
  /** O conteúdo já começa com o marcador de data (o painel não repete o título). */
  ownDateChip?: boolean;
  /** A conversa com a última mensagem sem enviar (`?estado=nao-enviada`). */
  unsentContent?: ReactNode;
  /** Quando começou (cabeçalho do desktop). */
  startedAt: string;
  /** Sugestões acima do campo de mensagem. */
  prompts?: string[];
  content: ReactNode;
};

const prompts = ["Cancelar o Amazon Prime", "Resumo da semana", "Como está meu saldo?"];

export const threads: Record<ConversationId, Thread> = {
  "gastos-setembro": {
    id: "gastos-setembro",
    title: "Gastos de setembro",
    time: "Hoje, 14:32",
    subtitle: "Hoje, 14:32 · com o Tamanduá",
    startedAt: "Iniciada hoje às 14:32",
    prompts,
    unsentContent: (
      <>
        <ChatDateChip small>Hoje, 14:32</ChatDateChip>
        <UserQuestion>quanto gastei com comida esse mês?</UserQuestion>
        <AgentReply agent="tamandua" className="gap-2">
          <ReplyText size="adaptive">
            Farejei tudo: você gastou <strong>R$ 742,18</strong> em Alimentação, 74% do teto de R$
            1.000. Os avisos de R$ 500 e R$ 700 já foram enviados.
          </ReplyText>
        </AgentReply>
        <UnsentMessage>e com transporte?</UnsentMessage>
      </>
    ),
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
    subtitle: "Hoje, 14:40 · com o Pacu",
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
  "rendimento-setembro": {
    id: "rendimento-setembro",
    title: "Rendimento de setembro",
    time: "Hoje, 14:40",
    subtitle: "Hoje, 14:40 · com o Pacu",
    pageSubtitle: "Hoje, 14:40 · com o Pacu",
    ownDateChip: true,
    startedAt: "Iniciada hoje às 14:40",
    prompts,
    typing: true,
    content: (
      <>
        <ChatDateChip small>Hoje, 14:40</ChatDateChip>
        <UserQuestion>quanto rendeu minha carteira em setembro?</UserQuestion>
        <CalledBy agent="pacu" />
        <AgentReply agent="pacu" className="gap-2">
          <ReplyText size="adaptive">
            Em setembro sua carteira rendeu <strong>R$ 862,40</strong>, ou <strong>+1,8%</strong>. O
            CDI do mês foi menor, então você ficou acima dele. Quem mais ajudou foi
            <TypingCursor />
          </ReplyText>
          <TypingIndicator agent="pacu" />
        </AgentReply>
      </>
    ),
  },
  "petr4-hoje": {
    id: "petr4-hoje",
    title: "PETR4 hoje",
    time: "Hoje, 14:45",
    subtitle: "Hoje, 14:45 · aguardando o Pacu",
    pageSubtitle: "Hoje, 14:45 · aguardando o Pacu",
    ownDateChip: true,
    startedAt: "Iniciada hoje às 14:45",
    prompts,
    content: (
      <>
        <ChatDateChip small>Hoje, 14:45</ChatDateChip>
        <UserQuestion>a PETR4 caiu hoje?</UserQuestion>
        <CalledBy agent="pacu" />
        <UnavailableAlert agent="pacu" />
      </>
    ),
  },
  "extrato-itau": {
    id: "extrato-itau",
    title: "Extrato do Itaú",
    time: "Hoje, 14:50",
    subtitle: "Hoje, 14:50 · com a Capivara",
    pageSubtitle: "Hoje, 14:50 · com a Capivara",
    ownDateChip: true,
    startedAt: "Iniciada hoje às 14:50",
    prompts,
    attachmentFailed: true,
    content: (
      <>
        <ChatDateChip small>Hoje, 14:50</ChatDateChip>
        <UserQuestion>consegue ler meu extrato do Itaú?</UserQuestion>
        <AgentReply agent="capivara" role="Coordena a turma" className="gap-2">
          <ReplyText size="adaptive">
            Consigo, sim. Mande o PDF, a foto ou a imagem do extrato (até 10 MB) e eu passo para o
            Tamanduá.
          </ReplyText>
        </AgentReply>
      </>
    ),
  },
};
