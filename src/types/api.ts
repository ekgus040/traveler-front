export type RecommendedPlacePayload = {
  place_id: string;
  visit_sequence: number;
  place_name?: string | null;
  duration_min?: number | null;
  category?: string | null;
  distance_min?: number | null;
  indoor?: boolean | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  recommend_reason?: string | null;
  iconic_score?: number | null;
};

export type ChatStreamPayload = {
  bot_message: string;
  recommended_places: RecommendedPlacePayload[];
};

/**
 * POST /api/chat/revise 응답 (mobility_rag Sprint 7).
 *
 * `/api/chat` 과 달리 스트리밍이 아니라 단발 JSON 이고,
 * 좌표(lat/lng)가 없다 — 이미 화면에 있는 코스에서 이어받아야 한다.
 */
export type ReviseCoursePayload = {
  bot_message: string;
  recommended_places: Array<{
    place_id: string;
    visit_sequence: number;
    place_name?: string | null;
  }>;
};

export type SessionVisitedResponse = {
  session_id: string;
  visited: string[];
};

export type SessionWriteResponse = {
  ok: boolean;
  session_id: string;
  added?: string[];
  cleared?: string[];
};

export type SessionPrefsResponse = {
  session_id: string;
  prefs: Record<string, string>;
};

export type HealthResponse = {
  status: "ok" | string;
  redis: "connected" | "disconnected" | string;
  note?: string;
};
