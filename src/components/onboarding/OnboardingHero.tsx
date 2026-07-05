type OnboardingHeroProps = {
  totalQuestions: number;
  completedCount: number;
};

export function OnboardingHero({
  totalQuestions,
  completedCount,
}: OnboardingHeroProps) {
  return (
    <section className="shell-card overflow-hidden">
      <div className="shell-card-body relative gap-6">
        <div
          className="absolute inset-x-6 top-0 h-24 rounded-b-[2rem] bg-gradient-to-r from-sky-100 via-white to-emerald-100"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Cold Start
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              몇 가지 취향만 고르면 여행 추천이 바로 시작됩니다.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              초기 취향을 먼저 받아 결과의 톤, 동선, 장소 밀도를 빠르게 맞춥니다.
            </p>
          </div>

          <div className="rounded-3xl border border-base-300 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-slate-500">선택 진행률</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {completedCount}
              <span className="ml-1 text-lg font-medium text-slate-400">/ {totalQuestions}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OnboardingHero;
