import { modeCards, spotMixContent } from "../../data/content";
import type { TravelMode } from "../../types/domain";

type SpotMixGuideProps = {
  selectedMode: TravelMode;
};

export function SpotMixGuide({ selectedMode }: SpotMixGuideProps) {
  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Spot Balance
          </p>
          <h2 className="section-title mt-1">명소 / 히든 비중 설명</h2>
          <p className="section-copy mt-2">
            추천은 항상 같은 비율이 아니라 모드 목적에 맞게 명소와 히든 스팟의 비중이 달라집니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {modeCards.map((mode) => {
            const mix = spotMixContent[mode.id];
            const isSelected = mode.id === selectedMode;

            return (
              <article
                key={mode.id}
                className={[
                  "rounded-3xl border p-5",
                  isSelected ? "border-primary bg-sky-50/70" : "border-base-300 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {mode.emoji} {mode.title}
                  </h3>
                  {isSelected ? <span className="badge badge-primary">선택됨</span> : null}
                </div>

                <div className="mt-4 overflow-hidden rounded-full bg-slate-200">
                  <div className="flex h-3">
                    <div
                      className="bg-amber-400"
                      style={{ width: `${mix.landmarkRatio}%` }}
                    />
                    <div
                      className="bg-cyan-500"
                      style={{ width: `${mix.hiddenRatio}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                  <span className="badge border-0 bg-amber-100 text-amber-700">
                    명소 {mix.landmarkRatio}%
                  </span>
                  <span className="badge border-0 bg-cyan-100 text-cyan-700">
                    히든 {mix.hiddenRatio}%
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">
                  {mix.summary}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{mix.rationale}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default SpotMixGuide;
