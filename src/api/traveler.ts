import type {
  SessionVisitedResponse,
  SessionWriteResponse,
  SessionPrefsResponse,
  HealthResponse,
} from "../types/api";
import type { TravelChatRequest, TravelCoordinates } from "../types/domain";
const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function buildChatUrl(params: TravelChatRequest) {
  const url = new URL("/api/chat", API_BASE_URL);
  url.searchParams.set("user_message", params.userMessage);
  url.searchParams.set("session_id", params.sessionId);
  url.searchParams.set("lat", String(params.lat));
  url.searchParams.set("lon", String(params.lon));
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
    const resp = await fetch(`/naver-directions/driving?${params.toString()}`);
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
