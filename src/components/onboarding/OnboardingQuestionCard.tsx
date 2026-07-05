import type { OnboardingChoice, OnboardingQuestion } from "../../data/content";

type OnboardingQuestionCardProps = {
  question: OnboardingQuestion;
  selectedValue?: string;
  onSelect: (questionId: string, value: string) => void;
};

export function OnboardingQuestionCard({
  question,
  selectedValue,
  onSelect,
}: OnboardingQuestionCardProps) {
  return (
    <article className="shell-card">
      <div className="shell-card-body gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Step {question.step}
            </p>
            <h2 className="section-title mt-2">{question.title}</h2>
            <p className="section-copy mt-2">{question.description}</p>
          </div>
          <span
            className={`badge h-8 px-3 ${selectedValue ? "badge-primary" : "badge-ghost border-base-300 text-slate-500"}`}
          >
            {selectedValue ? "선택 완료" : "선택 전"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {question.choices.map((choice) => (
            <ChoiceButton
              key={choice.value}
              choice={choice}
              isSelected={choice.value === selectedValue}
              onClick={() => onSelect(question.id, choice.value)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

type ChoiceButtonProps = {
  choice: OnboardingChoice;
  isSelected: boolean;
  onClick: () => void;
};

function ChoiceButton({ choice, isSelected, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        isSelected
          ? "border-primary bg-primary text-primary-content shadow-sm"
          : "border-base-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      <span className="block text-sm font-semibold">{choice.label}</span>
    </button>
  );
}

export default OnboardingQuestionCard;
