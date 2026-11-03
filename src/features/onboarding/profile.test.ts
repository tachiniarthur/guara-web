import { answersSummary, estimateProfile, profileDescription, profileScore } from "./profile";

/** As 6 respostas pela posição da opção (0 a 3). */
const answers = (...options: number[]) =>
  Object.fromEntries(options.map((option, i) => [i + 1, option]));

describe("perfil de investidor", () => {
  it("chega aos quatro perfis conforme as respostas", () => {
    expect(estimateProfile(answers(0, 0, 0, 0, 0, 0))).toBe("conservador");
    expect(estimateProfile(answers(1, 2, 2, 2, 2, 2))).toBe("moderado");
    expect(estimateProfile(answers(2, 3, 3, 2, 3, 2))).toBe("arrojado");
    expect(estimateProfile(answers(2, 3, 3, 3, 3, 3))).toBe("sofisticado");
  });

  it("sem experiência com vários tipos, para no Arrojado", () => {
    expect(profileScore(answers(2, 3, 3, 2, 3, 3))).toBe(23);
    expect(estimateProfile(answers(2, 3, 3, 2, 3, 3))).toBe("arrojado");
  });

  it("no objetivo, renda extra pesa menos que crescer no longo prazo", () => {
    expect(profileScore(answers(3, 0, 0, 0, 0, 0))).toBe(8);
    expect(profileScore(answers(2, 0, 0, 0, 0, 0))).toBe(9);
  });

  it("descreve com o prazo e o resgate escolhidos, e resume as respostas", () => {
    const moderate = answers(1, 2, 2, 2, 2, 2);
    expect(profileDescription("moderado", moderate)).toBe(
      "Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte do dinheiro protegida. Seu prazo de 3 a 10 anos e a parte pequena que talvez precise resgatar combinam com uma carteira equilibrada.",
    );
    expect(answersSummary(moderate)[0]).toEqual({
      pergunta: "Objetivo",
      resposta: "Juntar para um objetivo",
    });
    expect(answersSummary({})[5]).toEqual({ pergunta: "Resgate de surpresa", resposta: "—" });
  });
});
