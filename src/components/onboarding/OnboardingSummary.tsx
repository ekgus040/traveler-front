import type { OnboardingQuestion } from "../../data/content";

type OnboardingSummaryProps = {
  questions: OnboardingQuestion[];
  selections: Record<string, string>;
  canComplete: boolean;
  onComplete: () => void;
};

export function OnboardingSummary({
  questions,
  selections,
  canComplete,
  onComplete,
}: OnboardingSummaryProps) {
  return (
    <aside className="shell-card h-fit">
      <div className="shell-card-body gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Summary
          </p>
          <h2 className="section-title mt-2">현재 선택</h2>
          <p className="section-copy mt-2">
            모든 질문을 고르면 취향 기반 추천을 시작할 준비가 됩니다.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((question) => {
            const selectedChoice = question.choices.find(
              (choice) => choice.value === selections[question.id],
            );

            return (
              <div
                key={question.id}
                className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-500">{question.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedChoice?.label ?? "아직 선택하지 않음"}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={!canComplete}
          onClick={onComplete}
        >
          완료하고 추천 받기
        </button>
      </div>
    </aside>
  );
}

export default OnboardingSummary;
