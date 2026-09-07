import { modeLabels } from "../../../data/content";
import { resolvePlaceCoordinates } from "../../../data/placeCoordinates";
import type { Place, TravelMode } from "../../../types/domain";
import type { RecommendedPlacePayload } from "../../../types/api";

/**
 * TourAPI `lclsSystm1`(대분류) 코드 → 화면 표기.
 * 백엔드가 이 코드를 그대로 내려주기 때문에 매핑하지 않으면
 * 카드에 "FD", "VE" 같은 코드가 그대로 노출된다(2026-09-07 확인).
 * 확인된 코드만 넣고, 모르는 코드는 모드 라벨로 폴백한다.
 */
const CATEGORY_LABEL: Record<string, string> = {
  NA: "자연",
  HS: "문화·역사",
  FD: "맛집·카페",
  VE: "관광·체험",
  LS: "레포츠",
  SH: "쇼핑",
  EX: "체험",
  AC: "숙박",
};

function toCategoryLabel(code: string | null | undefined, mode: TravelMode) {
  if (!code) return `${modeLabels[mode]} 추천`;
  return CATEGORY_LABEL[code] ?? `${modeLabels[mode]} 추천`;
}

export function mapBackendPlaces(
  places: RecommendedPlacePayload[],
  mode: TravelMode,
): Place[] {
  return places.map((place) => ({
    id: `backend-${place.place_id}-${place.visit_sequence}`,
    sourcePlaceId: String(place.place_id),
    title: place.place_name ?? `Place ${place.place_id}`,
    category: toCategoryLabel(place.category, mode),
    time: "",
    tags: [
      place.indoor === true ? "실내" : place.indoor === false ? "야외" : "",
    ].filter(Boolean),
    summary: place.description?.trim() ?? "",
    recommendReason: place.recommend_reason?.trim() || undefined,
    badge: place.iconic_score == null
      ? undefined
      : place.iconic_score >= 0.7
        ? "명소"
        : place.iconic_score < 0.3
          ? "히든"
          : undefined,
    coordinates: place.lat != null && place.lng != null
      ? { lat: place.lat, lon: place.lng }
      : resolvePlaceCoordinates(place.place_name ?? `Place ${place.place_id}`),
  }));
}

export function extractSourcePlaceIds(places: Place[]) {
  return places
    .map((place) => place.sourcePlaceId)
    .filter((value): value is string => Boolean(value));
}
