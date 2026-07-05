import { mockTrustReport } from "../data/mock";
import ReasoningPanel from "../components/trust/ReasoningPanel";
import TrustScoreCard from "../components/trust/TrustScoreCard";
import VerificationTimeline from "../components/trust/VerificationTimeline";
import type { TrustReport } from "../types/domain";

type TrustPageProps = {
  report?: TrustReport;
};

export function TrustPage({ report = mockTrustReport }: TrustPageProps) {
  return (
    <section className="space-y-6">
      <TrustScoreCard
        trustScore={report.trustScore}
        executionReady={report.executionReady}
        executionSummary={report.executionSummary}
        updatedAt={report.updatedAt}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr),minmax(420px,1.12fr)]">
        <ReasoningPanel reasoning={report.reasoning} />
        <section className="shell-card">
          <div className="shell-card-body gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Execution Ready
              </p>
              <h2 className="section-title mt-1">실행 가능 여부</h2>
              <p className="section-copy mt-2">
                현재 추천 결과를 사용자가 바로 소비해도 되는지 한 줄 판단으로 요약합니다.
              </p>
            </div>

            <div
              className={`rounded-[28px] border p-5 ${
                report.executionReady
                  ? "border-success/30 bg-success/10"
                  : "border-warning/30 bg-warning/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-900">
                  {report.executionReady ? "Ready for execution" : "Hold before execution"}
                </p>
                <span
                  className={`badge ${
                    report.executionReady ? "badge-success" : "badge-warning"
                  }`}
                >
                  {report.executionReady ? "YES" : "NO"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{report.executionSummary}</p>
            </div>
          </div>
        </section>
      </div>

      <VerificationTimeline validations={report.validations} />
    </section>
  );
}

export default TrustPage;
