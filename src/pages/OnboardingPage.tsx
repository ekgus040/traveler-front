import { useMemo, useState } from "react";
import {
  ONBOARDING_QUESTIONS,
  type OnboardingQuestion,
} from "../data/content";
import {
  OnboardingHero,
  OnboardingQuestionCard,
  OnboardingSummary,
} from "../components/onboarding";

type OnboardingSelections = Record<string, string>;

type OnboardingPageProps = {
  questions?: OnboardingQuestion[];
  initialSelections?: OnboardingSelections;
  onComplete?: (selections: OnboardingSelections) => void;
};

export function OnboardingPage({
  questions = ONBOARDING_QUESTIONS,
  initialSelections,
  onComplete,
}: OnboardingPageProps) {
  const [selections, setSelections] = useState<OnboardingSelections>(() => ({
    ...Object.fromEntries(questions.map((question) => [question.id, ""])),
    ...initialSelections,
  }));

  const completedCount = useMemo(
    () => questions.filter((question) => selections[question.id]).length,
    [questions, selections],
  );
  const canComplete = completedCount === questions.length;

  function handleSelect(questionId: string, value: string) {
    setSelections((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function handleComplete() {
    if (!canComplete) {
      return;
    }

    onComplete?.(selections);
  }

  return (
    <section className="space-y-6">
      <OnboardingHero
        totalQuestions={questions.length}
        completedCount={completedCount}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          {questions.map((question) => (
            <OnboardingQuestionCard
              key={question.id}
              question={question}
              selectedValue={selections[question.id]}
              onSelect={handleSelect}
            />
          ))}
        </section>

        <OnboardingSummary
          questions={questions}
          selections={selections}
          canComplete={canComplete}
          onComplete={handleComplete}
        />
      </div>
    </section>
  );
}

export default OnboardingPage;
