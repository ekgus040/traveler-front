import PlaceCard, { type PlaceCardItem } from "./PlaceCard";
import VisitedBadgeList from "./VisitedBadgeList";

type ItineraryPanelProps = {
  places: PlaceCardItem[];
  visitedItems?: string[];
  visitedItemPrefix?: string;
  onSaveVisited?: () => void;
  canSaveVisited?: boolean;
  isSavingVisited?: boolean;
  saveLabel?: string;
  emptyPlacesText?: string;
  emptyVisitedText?: string;
};

export function ItineraryPanel({
  places,
  visitedItems = [],
  visitedItemPrefix,
  onSaveVisited,
  canSaveVisited = false,
  isSavingVisited = false,
  saveLabel = "저장해 두기",
  emptyPlacesText = "추천이 도착하면 이곳에 순서대로 보여드릴게요.",
  emptyVisitedText = "아직 저장된 장소가 없습니다.",
}: ItineraryPanelProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#1C2B4A]">
          코스 상세 일정
          {places.length > 0 && (
            <span className="ml-2 text-[13px] font-normal text-[#9CA3AF]">
              총 {places.length}곳
            </span>
          )}
        </h2>
        {onSaveVisited && (
          <button
            type="button"
            disabled={!canSaveVisited || isSavingVisited}
            onClick={onSaveVisited}
            className="rounded-[8px] bg-[#F07A3B] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#E06928] disabled:opacity-50"
          >
            {isSavingVisited ? "저장 중..." : saveLabel}
          </button>
        )}
      </div>

      {visitedItems.length > 0 && (
        <div className="mb-4 rounded-[12px] bg-[#EBF6F4] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#2D9C8C]">저장된 기록</p>
          <VisitedBadgeList
            items={visitedItems}
            itemPrefix={visitedItemPrefix}
            emptyText={emptyVisitedText}
          />
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {places.length > 0 ? (
          places.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#E8E4DC] bg-[#F9F7F2] p-8 text-center">
            <p className="text-[14px] text-[#9CA3AF]">{emptyPlacesText}</p>
          </div>
        )}
      </div>

      {places.length > 0 && (
        <div className="mt-4 rounded-[14px] border border-[#E8E4DC] bg-[#F0EDE8] p-6 text-center">
          <p className="text-[13px] text-[#6B7280]">이번 추천 코스의 전체 일정이에요</p>
        </div>
      )}
    </section>
  );
}

export default ItineraryPanel;
