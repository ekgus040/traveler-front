import { longDistanceFlowSteps } from "../../data/content";

export function LongDistanceFlow() {
  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Long Distance
          </p>
          <h2 className="section-title mt-1">장거리 이동 안내 플로우</h2>
          <p className="section-copy mt-2">
            장거리 결과는 목적지 추천만이 아니라 이동 중 회복과 경유 설계까지 함께 읽어야 합니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {longDistanceFlowSteps.map((step) => (
            <article
              key={step.step}
              className="rounded-3xl border border-base-300 bg-gradient-to-b from-white to-slate-50 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Step {step.step}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LongDistanceFlow;
