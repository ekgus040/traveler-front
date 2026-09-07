import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import { useState } from "react";

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

/** 이 길이를 넘으면 접어두고 "더보기"를 붙인다 (3줄 남짓). */
const CLAMP_THRESHOLD = 110;

export function PlaceCard({ place, index, selected = false, onSelect }: PlaceCardProps) {
  const [expanded, setExpanded] = useState(false);
  // 관광공사 설명은 수백 자짜리도 있어서 그대로 두면 카드 하나가 화면을 다 먹는다.
  // 원문은 자르지 않고, 접힌 상태에서만 3줄로 보여준다.
  const isLong = place.summary.length > CLAMP_THRESHOLD;

  function toggle() {
    onSelect?.(place.id);
    if (isLong) setExpanded((current) => !current);
  }

  const interactive = isLong || Boolean(onSelect);

  return (
    <article
      id={`place-card-${place.id}`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-expanded={isLong ? expanded : undefined}
      className={`course-card-enter overflow-hidden rounded-[14px] border bg-white transition-colors ${
        selected ? "border-brand ring-1 ring-brand" : "border-line"
      } ${interactive ? "cursor-pointer hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={interactive ? toggle : undefined}
      onKeyDown={(event) => {
        if (!interactive || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        toggle();
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
            <>
              <p
                className={`mt-1.5 whitespace-pre-line text-[14px] leading-[1.65] text-sub ${
                  isLong && !expanded ? "line-clamp-3" : ""
                }`}
              >
                {place.summary}
              </p>
              {isLong ? (
                <span className="mt-1.5 inline-flex items-center gap-0.5 text-[13px] font-semibold text-brand">
                  {expanded ? "접기" : "더보기"}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </span>
              ) : null}
            </>
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
