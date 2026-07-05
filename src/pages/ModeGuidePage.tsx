import { modeGuideContent, modeLabels } from "../data/content";
import { LongDistanceFlow, ModeCoreGuide, SpotMixGuide } from "../components/results";
import type { TravelMode } from "../types/domain";

type ModeGuidePageProps = {
  selectedMode: TravelMode;
};

export function ModeGuidePage({ selectedMode }: ModeGuidePageProps) {
  const currentGuide = modeGuideContent[selectedMode];

  return (
    <section className="space-y-6">
      <section className="shell-card overflow-hidden">
        <div className="shell-card-body gap-5 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(255,255,255,0.96)_42%,rgba(251,191,36,0.14))]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Result Differentiation
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                {modeLabels[selectedMode]} 모드 결과는 이렇게 읽습니다.
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">{currentGuide.summary}</p>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Current Focus
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{currentGuide.title}</p>
            </div>
          </div>
        </div>
      </section>

      <ModeCoreGuide selectedMode={selectedMode} />
      <LongDistanceFlow />
      <SpotMixGuide selectedMode={selectedMode} />
    </section>
  );
}

export default ModeGuidePage;
