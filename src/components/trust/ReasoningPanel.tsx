type ReasoningPanelProps = {
  reasoning: string[];
};

export function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Reasoning
          </p>
          <h2 className="section-title mt-1">판단 근거</h2>
          <p className="section-copy mt-2">
            점수와 실행 가능성 판단에 반영된 핵심 이유를 순서대로 보여줍니다.
          </p>
        </div>

        <div className="space-y-3">
          {reasoning.map((item, index) => (
            <article
              key={`${index}-${item}`}
              className="rounded-3xl border border-base-300 bg-base-200 p-4"
            >
              <div className="flex gap-3">
                <span className="badge badge-outline mt-0.5 min-w-14">{`R${index + 1}`}</span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReasoningPanel;
