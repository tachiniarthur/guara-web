import {
  allAnswered,
  answersSummary,
  classesOf,
  riskShare,
  toAnswerBody,
  toProfileOptions,
} from "./questionnaire";
import { questionnaireMock as q } from "./questionnaire.mock";

describe("questionário de perfil (API)", () => {
  it("só monta o envio com todas as perguntas respondidas por opções que existem", () => {
    expect(toAnswerBody(q, { 1: 0, 2: 1 })).toBeNull();
    expect(toAnswerBody(q, { 1: 0, 2: 1, 3: 5 })).toBeNull();
    expect(allAnswered(q, { 1: 0, 2: 1, 3: 1 })).toBe(true);
    expect(toAnswerBody(q, { 1: 1, 2: 0, 3: 1 })).toEqual({
      goal: "growth",
      horizon: "lt_1y",
      drawdown: "hold",
    });
  });

  it("resume as respostas com os rótulos curtos da API", () => {
    expect(answersSummary(q, { 1: 1, 2: 1 })).toEqual([
      { pergunta: "Objetivo", resposta: "Crescer no longo prazo" },
      { pergunta: "Prazo", resposta: "3 a 10 anos" },
    ]);
  });

  it("perfis com o alvo por classe e a parte de risco (renda variável + alternativos)", () => {
    const [conservative, moderate] = toProfileOptions(q);
    expect(conservative).toMatchObject({ kind: "conservative", nome: "Conservador" });
    expect(moderate!.alvo).toEqual({
      fixed_income: 50,
      equities: 30,
      real_estate: 15,
      alternatives: 5,
    });
    expect(riskShare(moderate!)).toBe(35);
    expect(classesOf(q).map((c) => c.nome)).toEqual([
      "Renda fixa",
      "Renda variável",
      "Imobiliário",
      "Alternativos",
    ]);
  });
});
