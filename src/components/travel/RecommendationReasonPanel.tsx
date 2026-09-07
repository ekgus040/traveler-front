import X from "lucide-react/dist/esm/icons/x.mjs";
import type { Place } from "../../types/domain";

type RecommendationReasonPanelProps = {
  places: Place[];
  open: boolean;
  onClose: () => void;
};

export function RecommendationReasonPanel({ places, open, onClose }: RecommendationReasonPanelProps) {
  const reasonPlaces = places.filter((place) => place.recommendReason);
  if (!open || reasonPlaces.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="추천 근거"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="추천 근거 닫기" onClick={onClose} />
      <section className="relative max-h-[88dvh] w-full overflow-hidden rounded-t-[16px] border border-line bg-white shadow-pop sm:max-w-[520px] sm:rounded-[16px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">추천 근거</h2>
            <p className="mt-0.5 text-[13px] text-muted">각 장소를 고른 이유입니다.</p>
          </div>
          <button
            type="button"
            aria-label="추천 근거 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-surface hover:text-ink"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(88dvh-72px)] overflow-y-auto px-5 py-4">
          <ol className="space-y-4">
            {reasonPlaces.map((place, index) => (
              <li key={place.id} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[12px] font-bold text-sub">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">{place.title}</p>
                  <p className="mt-1 text-[13px] leading-[1.65] text-sub">{place.recommendReason}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default RecommendationReasonPanel;
