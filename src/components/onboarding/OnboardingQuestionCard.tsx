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
      className={`rounded-[20px] border-2 px-5 py-5 text-left transition-all duration-300 ${
        isSelected
          ? "-translate-y-1 border-[#FF7B59] bg-gradient-to-br from-[#FFE8D6] to-[#FFCDB6] text-[#FF6B6B] shadow-[0_12px_30px_rgba(255,123,89,.2)]"
          : "border-[#2D3436]/[0.08] bg-white text-[#2D3436] hover:border-[#FF7B59]/50 hover:bg-[#FFF6EC]"
      }`}
    >
      <span className="block text-sm font-semibold">{choice.label}</span>
    </button>
  );
}

export default OnboardingQuestionCard;
