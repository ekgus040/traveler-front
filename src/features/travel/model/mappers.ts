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
    time: "",
    tags: [
      place.indoor === true ? "실내" : place.indoor === false ? "야외" : "장소 후보",
    ],
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
