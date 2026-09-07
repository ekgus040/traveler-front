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
  selectedPlaceId?: string | null;
  onPlaceSelect?: (placeId: string) => void;
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
  selectedPlaceId,
  onPlaceSelect,
}: ItineraryPanelProps) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
          코스 상세 일정
          {places.length > 0 && (
            <span className="ml-2 text-[13px] font-medium text-muted">총 {places.length}곳</span>
          )}
        </h2>
        {onSaveVisited && (
          <button
            type="button"
            disabled={!canSaveVisited || isSavingVisited}
            onClick={onSaveVisited}
            className="btn btn-outline w-full sm:w-auto"
          >
            {isSavingVisited ? "저장 중..." : saveLabel}
          </button>
        )}
      </div>

      {visitedItems.length > 0 && (
        <div className="mb-4 rounded-[12px] border border-line bg-surface p-4">
          <p className="mb-2 text-[13px] font-semibold text-muted">저장된 기록</p>
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
            <PlaceCard
              key={place.id}
              place={place}
              index={index}
              selected={selectedPlaceId === place.id}
              onSelect={onPlaceSelect}
            />
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-line-strong bg-surface p-10 text-center">
            <p className="text-[14px] text-muted">{emptyPlacesText}</p>
          </div>
        )}
      </div>

      {places.length > 0 && (
        <p className="mt-4 text-center text-[13px] text-muted">이번 추천 코스의 전체 일정입니다.</p>
      )}
    </section>
  );
}

export default ItineraryPanel;
