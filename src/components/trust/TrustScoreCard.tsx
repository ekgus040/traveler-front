import type { TrustReport } from "../../types/domain";

type TrustScoreCardProps = {
  trustScore: TrustReport["trustScore"];
  executionReady: TrustReport["executionReady"];
  executionSummary: TrustReport["executionSummary"];
  updatedAt: TrustReport["updatedAt"];
};

function getScoreTone(trustScore: number) {
  if (trustScore >= 85) {
    return "text-success";
  }

  if (trustScore >= 70) {
    return "text-warning";
  }

  return "text-error";
}

export function TrustScoreCard({
  trustScore,
  executionReady,
  executionSummary,
  updatedAt,
}: TrustScoreCardProps) {
  const scoreTone = getScoreTone(trustScore);

  return (
    <section className="shell-card">
      <div className="shell-card-body gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Trust Score
            </p>
            <h2 className="section-title mt-1">신뢰도 요약</h2>
            <p className="section-copy mt-2">
              응답 구조, 근거 일관성, 실행 가능성까지 합쳐 현재 결과의 신뢰도를 표시합니다.
            </p>
          </div>
          <span
            className={`badge h-9 px-4 ${executionReady ? "badge-success" : "badge-warning"}`}
          >
            {executionReady ? "Execution Ready" : "Needs Review"}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),280px]">
          <div className="rounded-3xl border border-base-300 bg-base-200 p-5">
            <p className="text-sm font-medium text-slate-500">현재 점수</p>
            <div className={`mt-2 text-6xl font-black tracking-tight ${scoreTone}`}>
              {trustScore}
            </div>
            <progress
              className="progress progress-primary mt-5 h-3 w-full"
              value={trustScore}
              max={100}
            />
          </div>

          <div className="rounded-3xl border border-base-300 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">실행 판단</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {executionReady ? "바로 제안 가능" : "추가 확인 필요"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{executionSummary}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Updated {updatedAt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustScoreCard;
