type VisitedBadgeListProps = {
  items: string[];
  emptyText?: string;
  itemPrefix?: string;
};

export function VisitedBadgeList({
  items,
  emptyText = "아직 저장된 장소가 없습니다.",
  itemPrefix,
}: VisitedBadgeListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.length > 0 ? (
        items.map((item) => (
          <span key={item} className="badge badge-outline badge-sm h-7 px-3">
            {itemPrefix ? `${itemPrefix}${item}` : item}
          </span>
        ))
      ) : (
        <span className="text-sm text-slate-500">{emptyText}</span>
      )}
    </div>
  );
}

export default VisitedBadgeList;
