import Check from "lucide-react/dist/esm/icons/check.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#2D3436]/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="추천 근거">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="추천 근거 닫기" onClick={onClose} />
      <section className="relative max-h-[88dvh] w-full overflow-hidden rounded-t-[30px] bg-[#FFF6EC] shadow-[0_-24px_60px_rgba(45,52,54,.22)] sm:max-w-[520px] sm:rounded-[30px]">
        <div className="max-h-[88dvh] overflow-y-auto px-5 pb-6 pt-5 sm:px-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-black tracking-[-0.05em] text-[#2D3436]">추천 근거</h2>
              <p className="mt-1 text-[14px] font-semibold text-[#828F92]">Traveler가 이 코스를 고른 기준</p>
            </div>
            <button type="button" aria-label="추천 근거 닫기" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#828F92] shadow-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="mb-5 rounded-[26px] bg-gradient-to-br from-[#FFB088] via-[#FF8A65] to-[#FF6B6B] p-5 text-white shadow-[0_18px_40px_rgba(255,123,89,.22)]">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/75">Recommendation basis</p>
            <p className="mt-2 text-[22px] font-black leading-tight tracking-[-0.04em]">
              실제 추천 응답에서 추출한<br />장소별 선택 이유입니다.
            </p>
          </div>

          <div className="grid gap-3">
            {reasonPlaces.map((place, index) => (
              <article key={place.id} className="flex items-center gap-4 rounded-[22px] border border-white/80 bg-white p-4 shadow-sm">
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-[#FFF1E7] text-[#FF7B59]">
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-black tracking-[-0.03em] text-[#2D3436]">{place.title}</p>
                  <p className="mt-0.5 text-[13px] font-semibold leading-5 text-[#828F92]">{place.recommendReason}</p>
                </div>
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#FF7B59] text-white">
                  <Check size={20} strokeWidth={3} />
                </div>
                <span className="sr-only">{index + 1}번째 추천 이유</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RecommendationReasonPanel;
