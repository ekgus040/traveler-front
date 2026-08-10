export type PlaceCardItem = {
  id: string;
  title: string;
  category: string;
  time: string;
  tags: string[];
  badge?: string;
  summary: string;
  recommendReason?: string;
  sourcePlaceId?: string;
};

type PlaceCardProps = {
  place: PlaceCardItem;
  index: number;
  selected?: boolean;
  onSelect?: (placeId: string) => void;
};

const badgeStyles: Record<string, { bg: string; color: string }> = {
  명소: { bg: "#EBF6F4", color: "#2D9C8C" },
  히든: { bg: "#FFF0E9", color: "#F07A3B" },
};

export function PlaceCard({ place, index, selected = false, onSelect }: PlaceCardProps) {
  const badge = place.badge ? (badgeStyles[place.badge] ?? { bg: "#F0EDE8", color: "#6B7280" }) : null;
  const visual = getCategoryVisual(place.category, index);

  return (
    <article
      id={`place-card-${place.id}`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={`course-card-enter overflow-hidden rounded-[22px] bg-white shadow-[0_8px_26px_rgba(45,52,54,.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(45,52,54,.1)] ${
        selected
          ? "border-2 border-[#2D9C8C] ring-4 ring-[#2D9C8C]/10"
          : "border border-white/80"
      } ${onSelect ? "cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D9C8C]/20" : ""}`}
      style={{ animationDelay: `${index * 90}ms` }}
      onClick={() => onSelect?.(place.id)}
      onKeyDown={(event) => {
        if (!onSelect || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onSelect(place.id);
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className={`flex min-h-[86px] shrink-0 items-center justify-between bg-gradient-to-br px-5 py-4 sm:w-[104px] sm:flex-col sm:justify-center sm:px-0 ${visual.gradient}`}>
          <span className="text-[32px] drop-shadow-sm sm:text-[34px]">{visual.emoji}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#2D3436] sm:hidden">
            {index + 1}번째 코스
          </span>
          {place.time ? (
            <span className="mt-2 hidden rounded-full bg-white/75 px-2 py-1 text-[10px] font-extrabold text-[#2D3436] sm:inline-flex">{place.time}</span>
          ) : null}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
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
              <h3 className="text-[17px] font-extrabold leading-tight text-[#2D3436] sm:pr-8 sm:text-[16px]">{place.title}</h3>
              <span className="text-[11px] text-[#9CA3AF]">{place.category}</span>
            </div>
          </div>

          {place.summary ? <p className="mb-3 text-[13px] leading-relaxed text-[#4A5568]">{place.summary}</p> : null}

          <div className="flex flex-wrap gap-1.5">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#FFF1E7] px-2.5 py-1 text-[10px] font-bold text-[#FF7B59]">
                {tag}
              </span>
            ))}
            {place.sourcePlaceId && (
              <span className="rounded-full bg-[#FFF1E7] px-2.5 py-0.5 text-[11px] font-semibold text-[#FF7B59]">
                저장 가능
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function getCategoryVisual(category: string, index: number) {
  if (/음식|카페|맛집/.test(category)) return { emoji: "☕", gradient: "from-[#FFB088] to-[#FF7B59]" };
  if (/문화|체험|박물/.test(category)) return { emoji: "🎨", gradient: "from-[#FFD7A8] to-[#F07A3B]" };
  if (/관광|명소/.test(category)) return { emoji: "📍", gradient: "from-[#FFCFB8] to-[#FF6B6B]" };
  const defaults = [
    { emoji: "🚗", gradient: "from-[#FFB088] to-[#FF7B59]" },
    { emoji: "🌿", gradient: "from-[#FFD7A8] to-[#F07A3B]" },
    { emoji: "✨", gradient: "from-[#FFCFB8] to-[#FF6B6B]" },
  ];
  return defaults[index % defaults.length];
}

export default PlaceCard;
