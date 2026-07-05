import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addVisitedPlaces,
  clearSessionData,
  getHealth,
  getSessionPrefs,
  getVisitedPlaces,
} from "../../../api/traveler";
import { getOrCreateSessionId } from "../../../lib/session";
import type { Place } from "../../../types/domain";
import { extractSourcePlaceIds } from "../model/mappers";

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";

export function useTravelSession() {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const [isSavingVisited, setIsSavingVisited] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking");
  const [redisStatus, setRedisStatus] = useState<"connected" | "disconnected">("disconnected");

  const syncSessionContext = useCallback(async () => {
    if (IS_MOCK) return;
    try {
      const [visitedResponse, prefsResponse] = await Promise.all([
        getVisitedPlaces(sessionId),
        getSessionPrefs(sessionId),
      ]);
      setVisitedIds(visitedResponse.visited);
      setPrefs(prefsResponse.prefs);
    } catch {
      setVisitedIds([]);
    }
  }, [sessionId]);

  const syncVisited = syncSessionContext;

  useEffect(() => {
    void syncSessionContext();
    if (IS_MOCK) {
      setServiceStatus("online");
      return;
    }
    void getHealth()
      .then((health) => {
        setServiceStatus(health.status === "ok" ? "online" : "offline");
        setRedisStatus(health.redis === "connected" ? "connected" : "disconnected");
      })
      .catch(() => setServiceStatus("offline"));
  }, [syncSessionContext]);

  const saveVisitedPlaces = useCallback(
    async (places: Place[]) => {
      const placeIds = extractSourcePlaceIds(places);
      if (placeIds.length === 0) return;

      setIsSavingVisited(true);
      setSessionError(null);

      if (IS_MOCK) {
        setVisitedIds((prev) => [...new Set([...prev, ...placeIds])]);
        setIsSavingVisited(false);
        return;
      }

      try {
        await addVisitedPlaces(sessionId, placeIds);
        await syncVisited();
      } catch {
        setSessionError("visited 저장에 실패했습니다.");
      } finally {
        setIsSavingVisited(false);
      }
    },
    [sessionId, syncVisited],
  );

  const resetSession = useCallback(async () => {
    setSessionError(null);

    if (IS_MOCK) {
      setVisitedIds([]);
      setPrefs({});
      return;
    }

    try {
      await clearSessionData(sessionId);
      setVisitedIds([]);
      setPrefs({});
    } catch {
      setSessionError("세션 초기화에 실패했습니다.");
      throw new Error("Failed to reset session.");
    }
  }, [sessionId]);

  const hasVisitedPlaces = useMemo(() => visitedIds.length > 0, [visitedIds]);

  return {
    sessionId,
    visitedIds,
    isSavingVisited,
    sessionError,
    prefs,
    serviceStatus,
    redisStatus,
    hasVisitedPlaces,
    syncVisited,
    syncSessionContext,
    saveVisitedPlaces,
    resetSession,
  };
}
