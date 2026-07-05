export type PlaceCardItem = {
  id: string;
  title: string;
  category: string;
  time: string;
  tags: string[];
  badge?: string;
  summary: string;
  sourcePlaceId?: string;
};

type PlaceCardProps = {
  place: PlaceCardItem;
  index: number;
};

const badgeStyles: Record<string, { bg: string; color: string }> = {
  명소: { bg: "#EBF6F4", color: "#2D9C8C" },
  히든: { bg: "#FFF0E9", color: "#F07A3B" },
};

export function PlaceCard({ place, index }: PlaceCardProps) {
  const badge = place.badge ? (badgeStyles[place.badge] ?? { bg: "#F0EDE8", color: "#6B7280" }) : null;

  return (
    <article className="overflow-hidden rounded-[14px] border border-[#F0EDE8] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex">
        {/* Time column */}
        <div className="flex w-[68px] shrink-0 flex-col items-center border-r border-[#F0EDE8] pb-4 pt-5">
          <span className="text-[11px] font-bold text-[#2D9C8C]">{place.time}</span>
          <div className="my-2 w-px flex-1 bg-[#E8E4DC]" />
          <span className="text-[11px] font-medium text-[#C8C5BF]">{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              {badge && (
                <span
                  className="mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {place.badge}
                </span>
              )}
              <h3 className="text-[15px] font-bold leading-tight text-[#1C2B4A]">{place.title}</h3>
              <span className="text-[11px] text-[#9CA3AF]">{place.category}</span>
            </div>
          </div>

          <p className="mb-3 text-[13px] leading-relaxed text-[#4A5568]">{place.summary}</p>

          <div className="flex flex-wrap gap-1.5">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#F0EDE8] px-2.5 py-0.5 text-[11px] text-[#6B7280]">
                {tag}
              </span>
            ))}
            {place.sourcePlaceId && (
              <span className="rounded-full bg-[#EBF6F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#2D9C8C]">
                저장 가능
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default PlaceCard;
