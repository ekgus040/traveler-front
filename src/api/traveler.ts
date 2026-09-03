import type {
  SessionVisitedResponse,
  SessionWriteResponse,
  SessionPrefsResponse,
  HealthResponse,
  RecommendedPlacePayload,
  ReviseCoursePayload,
} from "../types/api";
import type { TravelChatRequest, TravelCoordinates } from "../types/domain";
const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * TourAPI 장소 보강(`/tour-place`)과 네이버 Directions(`/naver-directions/*`) 프록시의 기준 주소.
 *
 * 두 경로는 개발 서버에서는 vite.config.ts 의 미들웨어가, 배포 환경에서는 백엔드가 제공한다.
 * 개발 중에는 상대경로(빈 문자열)로 두어 vite 미들웨어를 그대로 쓰고,
 * 빌드 산출물에서는 API_BASE_URL 을 붙여 백엔드로 보낸다.
 * 프록시를 백엔드가 아닌 다른 곳에 두는 경우 VITE_PROXY_BASE_URL 로 덮어쓴다. (front#3)
 */
const PROXY_BASE_URL =
  import.meta.env.VITE_PROXY_BASE_URL ?? (import.meta.env.DEV ? "" : API_BASE_URL);

export function buildProxyUrl(path: string) {
  return `${PROXY_BASE_URL}${path}`;
}

export function buildChatUrl(params: TravelChatRequest) {
  const url = new URL("/api/chat", API_BASE_URL);
  url.searchParams.set("user_message", params.userMessage);
  url.searchParams.set("session_id", params.sessionId);
  url.searchParams.set("lat", String(params.lat));
  url.searchParams.set("lon", String(params.lon));
  url.searchParams.set("mode", params.mode);
  return url.toString();
}

export function openChatRecommendationStream(params: TravelChatRequest) {
  return new EventSource(buildChatUrl(params));
}

export async function getVisitedPlaces(sessionId: string) {
  return request<SessionVisitedResponse>(`/api/session/${sessionId}/visited`);
}

export async function addVisitedPlaces(sessionId: string, placeIds: string[]) {
  return request<SessionWriteResponse>(`/api/session/${sessionId}/visited`, {
    method: "POST",
    body: JSON.stringify(placeIds),
  });
}

export async function clearSessionData(sessionId: string) {
  return request<SessionWriteResponse>(`/api/session/${sessionId}/clear`, {
    method: "POST",
  });
}

export async function getSessionPrefs(sessionId: string) {
  return request<SessionPrefsResponse>(`/api/session/${sessionId}/prefs`);
}

export async function getHealth() {
  return request<HealthResponse>("/health");
}

/**
 * 이미 만들어진 코스를 후속 발화로 수정한다 (mobility_rag Sprint 7).
 *
 * `/api/chat` 은 SSE 지만 이쪽은 단발 JSON 이다.
 * 서버가 세션별 "지금 코스"를 메모리에 들고 있어서, 해당 session_id 로
 * `/api/chat` 을 먼저 호출한 적이 없거나 서버가 재시작되면 404 를 준다.
 */
export async function reviseCourse(sessionId: string, userMessage: string) {
  return request<ReviseCoursePayload>("/api/chat/revise", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, user_message: userMessage }),
  });
}

export async function enrichRecommendedPlaces(
  places: RecommendedPlacePayload[],
): Promise<RecommendedPlacePayload[]> {
  return Promise.all(places.map(async (place) => {
    if (place.place_name && place.lat != null && place.lng != null) {
      return place;
    }

    try {
      const response = await fetch(buildProxyUrl(`/tour-place?contentId=${encodeURIComponent(place.place_id)}`));
      if (!response.ok) return place;

      const detail = await response.json() as Partial<RecommendedPlacePayload>;
      return {
        ...detail,
        ...place,
        place_name: place.place_name ?? detail.place_name,
        category: place.category ?? detail.category,
        lat: place.lat ?? detail.lat,
        lng: place.lng ?? detail.lng,
        description: place.description ?? detail.description,
      };
    } catch {
      return place;
    }
  }));
}

export async function getRoute(coordinates: TravelCoordinates[]): Promise<[number, number][]> {
  if (coordinates.length < 2) return [];

  // 1차: 네이버 Directions API (lon,lat 순서)
  const naverResult = await getRouteNaver(coordinates);
  if (naverResult.length >= 2) return naverResult;

  // 2차 fallback: OSRM (OpenStreetMap 기반 실제 도로 경로)
  return getRouteOSRM(coordinates);
}

export async function getRouteNaver(coordinates: TravelCoordinates[]): Promise<[number, number][]> {
  const start = `${coordinates[0].lon},${coordinates[0].lat}`;
  const goal = `${coordinates[coordinates.length - 1].lon},${coordinates[coordinates.length - 1].lat}`;
  const midpoints = coordinates.slice(1, -1);

  const params = new URLSearchParams({ start, goal, option: "traoptimal" });
  if (midpoints.length > 0) {
    params.set("waypoints", midpoints.map((c) => `${c.lon},${c.lat}`).join(":"));
  }

  try {
    const resp = await fetch(buildProxyUrl(`/naver-directions/driving?${params.toString()}`));
    if (!resp.ok) return [];

    const data = await resp.json() as { route?: Record<string, Array<{ path: [number, number][] }>> };

    for (const opt of ["traoptimal", "trafast", "tracomfort"]) {
      const list = data.route?.[opt];
      if (list?.length) {
        return list[0].path.map(([lon, lat]: [number, number]) => [lat, lon]);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function getRouteOSRM(coordinates: TravelCoordinates[]): Promise<[number, number][]> {
  const coordStr = coordinates.map((c) => `${c.lon},${c.lat}`).join(";");
  try {
    const resp = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`,
    );
    if (!resp.ok) return [];

    const data = await resp.json() as {
      code: string;
      routes?: Array<{ geometry: { coordinates: [number, number][] } }>;
    };

    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates) return [];
    return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  } catch {
    return [];
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(new URL(path, API_BASE_URL), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
