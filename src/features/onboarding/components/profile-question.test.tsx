import { act, fireEvent, render, screen } from "@testing-library/react";

import { useProfileAnswers } from "@/stores/profile-answers";

import { profileQuestions } from "../data";
import { ProfileQuestionFields, QuestionContinue } from "./profile-question";

describe("Onboarding · pergunta do perfil", () => {
  it("começa sem resposta e só deixa continuar depois de escolher", () => {
    act(() => useProfileAnswers.setState({ answers: { onboarding: {}, refazer: {} } }));
    render(
      <>
        <ProfileQuestionFields
          question={profileQuestions[0]!}
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
});
