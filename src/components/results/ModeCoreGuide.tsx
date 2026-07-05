import { modeCards, modeGuideContent } from "../../data/content";
import type { TravelMode } from "../../types/domain";

type ModeCoreGuideProps = {
  selectedMode: TravelMode;
};

export function ModeCoreGuide({ selectedMode }: ModeCoreGuideProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Mode Guide
        </p>
        <h2 className="section-title mt-1">모드별 핵심 안내</h2>
        <p className="section-copy mt-2">
          같은 추천 결과라도 모드에 따라 우선순위와 해석 기준이 달라집니다.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {modeCards.map((mode) => {
          const guide = modeGuideContent[mode.id];
          const isSelected = mode.id === selectedMode;

          return (
            <article
              key={mode.id}
              className={[
                "rounded-3xl border bg-white p-5 shadow-sm transition",
                isSelected
                  ? "border-primary bg-sky-50/70 shadow-[0_20px_60px_-32px_rgba(14,165,233,0.65)]"
                  : "border-base-300",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {guide.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {mode.emoji} {mode.title}
                  </h3>
                </div>
                {isSelected ? <span className="badge badge-primary">현재 모드</span> : null}
              </div>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-800">{guide.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{guide.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {guide.emphasis.map((item) => (
                  <span key={item} className="badge badge-outline h-8 px-3">
                    {item}
                  </span>
                ))}
              </div>

              <ul className="mt-5 space-y-3">
                {guide.checklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ModeCoreGuide;
