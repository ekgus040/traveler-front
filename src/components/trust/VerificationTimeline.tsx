import type { TrustValidationTier } from "../../types/domain";
import VerificationTierCard from "./VerificationTierCard";

type VerificationTimelineProps = {
  validations: TrustValidationTier[];
};

export function VerificationTimeline({ validations }: VerificationTimelineProps) {
  const passedCount = validations.filter((item) => item.status === "passed").length;

  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Validation Tiers
            </p>
            <h2 className="section-title mt-1">검증 단계</h2>
            <p className="section-copy mt-2">
              Tier 1부터 Tier 3까지 어떤 수준까지 확인됐는지 단계별로 보여줍니다.
            </p>
          </div>

          <div className="stats stats-horizontal border border-base-300 bg-base-200">
            <div className="stat px-5 py-4">
              <div className="stat-title">완료</div>
              <div className="stat-value text-2xl">{passedCount}</div>
            </div>
            <div className="stat px-5 py-4">
              <div className="stat-title">전체 Tier</div>
              <div className="stat-value text-2xl">{validations.length}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {validations.map((tier) => (
            <VerificationTierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default VerificationTimeline;
