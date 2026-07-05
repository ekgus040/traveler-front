import { modeLabels } from "../../../data/content";
import { resolvePlaceCoordinates } from "../../../data/placeCoordinates";
import type { Place, TravelMode } from "../../../types/domain";
import type { RecommendedPlacePayload } from "../../../types/api";

export function mapBackendPlaces(
  places: RecommendedPlacePayload[],
  mode: TravelMode,
): Place[] {
  return places.map((place) => ({
    id: `backend-${place.place_id}-${place.visit_sequence}`,
    sourcePlaceId: String(place.place_id),
    title: place.place_name ?? `Place ${place.place_id}`,
    category: place.category ?? `${modeLabels[mode]} 추천`,
    time: `${9 + place.visit_sequence}:00`,
    tags: [
      place.indoor === true ? "실내" : place.indoor === false ? "야외" : "장소 후보",
      place.distance_min != null ? `차량 약 ${place.distance_min}분` : `순서 ${place.visit_sequence}`,
      place.duration_min != null ? `체류 ${place.duration_min}분` : "체류시간 확인 필요",
    ],
    summary: `${place.place_name ?? `장소 ${place.place_id}`}을(를) ${place.visit_sequence}번째 코스로 추천합니다. 이동 동선과 현재 여행 조건을 반영한 후보입니다.`,
    coordinates: resolvePlaceCoordinates(
      place.place_name ?? `Place ${place.place_id}`,
      String(place.place_id),
    ),
  }));
}

export function extractSourcePlaceIds(places: Place[]) {
  return places
    .map((place) => place.sourcePlaceId)
    .filter((value): value is string => Boolean(value));
}
