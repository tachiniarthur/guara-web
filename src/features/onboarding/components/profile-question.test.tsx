import { act, fireEvent, render, screen } from "@testing-library/react";

import { useProfileAnswers } from "@/stores/profile-answers";

import { questionnaireMock } from "../questionnaire.mock";
import { ProfileQuestionFields, QuestionContinue, RequireEarlierAnswers } from "./profile-question";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

beforeEach(() => replace.mockClear());

describe("Onboarding · pergunta do perfil", () => {
  it("começa sem resposta e só deixa continuar depois de escolher", () => {
    act(() => useProfileAnswers.setState({ answers: { onboarding: {}, refazer: {} } }));
    render(
      <>
        <ProfileQuestionFields
          question={questionnaireMock.questions[0]!}
          numero={1}
          total={6}
          name="p1"
          scope="onboarding"
        />
        <QuestionContinue scope="onboarding" numero={1} href="/onboarding/perfil/2" />
      </>,
    );
    expect(
      screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    expect(screen.queryByRole("link", { name: "Continuar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("radio")[1]!);
    expect(screen.getByRole("link", { name: "Continuar" })).toHaveAttribute(
      "href",
      "/onboarding/perfil/2",
    );
  });

  it("pelo endereço, não pula perguntas: volta para a primeira sem resposta", () => {
    act(() => useProfileAnswers.setState({ answers: { onboarding: { 1: 0 }, refazer: {} } }));
    render(<RequireEarlierAnswers before={5} />);
    expect(replace).toHaveBeenCalledWith("/onboarding/perfil/2");
  });

  it("no refazer, volta para a pergunta que falta em Meu perfil", () => {
    act(() => useProfileAnswers.setState({ answers: { onboarding: {}, refazer: { 1: 0 } } }));
    render(<RequireEarlierAnswers before={4} scope="refazer" />);
    expect(replace).toHaveBeenCalledWith("/perfil/investidor?pergunta=2");
  });

  it("com as anteriores respondidas, fica", () => {
    act(() => useProfileAnswers.setState({ answers: { onboarding: { 1: 0, 2: 1 }, refazer: {} } }));
    render(<RequireEarlierAnswers before={3} />);
    expect(replace).not.toHaveBeenCalled();
  });
});
