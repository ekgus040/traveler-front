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

const badgeStyles: Record<string, string> = {
  명소: "bg-brand-weak text-brand",
  히든: "bg-[#F1F3F5] text-[#4E5968]",
};

export function PlaceCard({ place, index, selected = false, onSelect }: PlaceCardProps) {
  return (
    <article
      id={`place-card-${place.id}`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      className={`course-card-enter overflow-hidden rounded-[14px] border bg-white transition-colors ${
        selected ? "border-brand ring-1 ring-brand" : "border-line"
      } ${onSelect ? "cursor-pointer hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onSelect?.(place.id)}
      onKeyDown={(event) => {
        if (!onSelect || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onSelect(place.id);
      }}
    >
      <div className="flex gap-3.5 p-4 md:p-5">
        {/* 순번 */}
        <div className="flex shrink-0 flex-col items-center">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${
              selected ? "bg-brand text-white" : "bg-surface text-sub"
            }`}
          >
            {index + 1}
          </span>
          <span className="mt-1.5 w-px flex-1 bg-line" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {place.badge ? (
              <span className={`badge ${badgeStyles[place.badge] ?? "bg-surface text-sub"}`}>{place.badge}</span>
            ) : null}
            <span className="text-[12px] text-muted">{place.category}</span>
            {place.time ? <span className="text-[12px] text-muted">· {place.time}</span> : null}
          </div>

          <h3 className="mt-1 text-[17px] font-bold leading-[1.35] tracking-[-0.02em] text-ink">{place.title}</h3>

          {place.summary ? (
            <p className="mt-1.5 text-[14px] leading-[1.65] text-sub">{place.summary}</p>
          ) : null}

          {place.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {place.tags.filter(Boolean).map((tag) => (
                <span key={tag} className="badge badge-secondary">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default PlaceCard;
