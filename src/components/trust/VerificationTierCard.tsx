import type { TrustValidationTier } from "../../types/domain";

type VerificationTierCardProps = {
  tier: TrustValidationTier;
};

function getStatusBadge(status: TrustValidationTier["status"]) {
  switch (status) {
    case "passed":
      return "badge-success";
    case "warning":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
}

function getStatusLabel(status: TrustValidationTier["status"]) {
  switch (status) {
    case "passed":
      return "Passed";
    case "warning":
      return "Watch";
    default:
      return "Pending";
  }
}

export function VerificationTierCard({ tier }: VerificationTierCardProps) {
  return (
    <article className="rounded-[28px] border border-base-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline">{tier.label}</span>
            <span className={`badge ${getStatusBadge(tier.status)}`}>
              {getStatusLabel(tier.status)}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">{tier.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{tier.summary}</p>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Confidence
          </p>
          <div className="mt-1 text-3xl font-black text-slate-900">{tier.confidence}</div>
        </div>
      </div>

      <progress
        className="progress progress-primary mt-4 h-2.5 w-full"
        value={tier.confidence}
        max={100}
      />

      <div className="mt-4 space-y-2">
        {tier.checks.map((check) => (
          <div
            key={check}
            className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm text-slate-700"
          >
            {check}
          </div>
        ))}
      </div>
    </article>
  );
}

export default VerificationTierCard;
