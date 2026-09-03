import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_RECOMMENDATION_COORDINATES } from "../../../data/content";
import { initialChats, mockBotMessages, mockPlaces } from "../../../data/mock";
import { enrichRecommendedPlaces, openChatRecommendationStream, reviseCourse } from "../../../api/traveler";

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";
import type {
  ChatMessage,
  Place,
  TravelComposerState,
  TravelMode,
  TravelStreamStatus,
} from "../../../types/domain";
import type { ChatStreamPayload, RecommendedPlacePayload } from "../../../types/api";
import { mapBackendPlaces } from "../model/mappers";
import { extractStreamingText } from "../model/streamText";
import { buildTravelPrompt, buildTravelUserPreview } from "../model/prompt";

type UseRecommendationStreamParams = {
  mode: TravelMode;
  sessionId: string;
  onPlacesResolved?: () => void | Promise<void>;
};

export function useRecommendationStream({
  mode,
  sessionId,
  onPlacesResolved,
}: UseRecommendationStreamParams) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => IS_MOCK ? initialChats[mode] : []);
  const [places, setPlaces] = useState<Place[]>(() => IS_MOCK ? mockPlaces[mode] : []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  // 코스 수정(/api/chat/revise) 응답에는 좌표가 없어서, 직전 코스의 좌표·설명을
  // place_id 로 이어받아야 지도가 비지 않는다.
  const lastPayloadRef = useRef<RecommendedPlacePayload[]>([]);

  const resetToModeSeed = useCallback(() => {
    eventSourceRef.current?.close();
    setIsStreaming(false);
    setStreamError(null);
    setMessages(IS_MOCK ? initialChats[mode] : []);
    setPlaces(IS_MOCK ? mockPlaces[mode] : []);
    lastPayloadRef.current = [];
  }, [mode]);

  useEffect(() => {
    resetToModeSeed();
  }, [resetToModeSeed]);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const startRecommendation = useCallback(
    async (composer: TravelComposerState) => {
      eventSourceRef.current?.close();
      setStreamError(null);
      setIsStreaming(true);

      const userPreview = buildTravelUserPreview(mode, composer);

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "user", text: userPreview },
        { id: crypto.randomUUID(), role: "assistant", text: "" },
      ]);

      if (IS_MOCK) {
        const fullText = mockBotMessages[mode];
        let i = 0;
        const tick = () => {
          if (i >= fullText.length) {
            setPlaces(mockPlaces[mode]);
            setIsStreaming(false);
            void onPlacesResolved?.();
            return;
          }
          const chunk = fullText.slice(i, i + 4);
          i += 4;
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { ...last, text: last.text + chunk };
            }
            return next;
          });
          setTimeout(tick, 25);
        };
        setTimeout(tick, 200);
        return;
      }

      let coordinates = DEFAULT_RECOMMENDATION_COORDINATES;
      try {
        coordinates = await getCurrentCoordinates();
      } catch (error) {
        setStreamError(`${getLocationErrorMessage(error)} 기본 위치로 추천을 계속합니다.`);
      }

      const userMessage = buildTravelPrompt({ mode, composer });

      const source = openChatRecommendationStream({
        sessionId,
        userMessage,
        lat: coordinates.lat,
        lon: coordinates.lon,
        mode,
      });

      eventSourceRef.current = source;
      let streamedJson = "";

      source.onmessage = (event) => {
        const payload = JSON.parse(event.data) as ChatStreamPayload;

        if (payload.bot_message) {
          streamedJson += payload.bot_message;
          // 원시 JSON이 채팅창에 노출되지 않도록 bot_message 값만 증분 추출해서 렌더한다.
          const visibleText = extractStreamingText(streamedJson);
          setMessages((current) => replaceLastAssistantText(current, visibleText));
        }

        if (payload.recommended_places.length > 0) {
          source.close();
          const structured = parseStructuredCourse(streamedJson);
          const mergedPlaces = mergePlaceMetadata(
            payload.recommended_places,
            structured?.recommended_places ?? [],
          );

          void enrichRecommendedPlaces(mergedPlaces).then((resolvedPlaces) => {
            lastPayloadRef.current = resolvedPlaces;
            setPlaces(mapBackendPlaces(resolvedPlaces, mode));
            const botMessage = structured?.bot_message ?? extractStreamingText(streamedJson);
            if (botMessage) {
              setMessages((current) => replaceLastAssistantText(current, botMessage));
            }
            setIsStreaming(false);
            void onPlacesResolved?.();
          });
        }
      };

      source.onerror = () => {
        source.close();
        setIsStreaming(false);
        setStreamError(
          "mobility_rag 연결에 실패했습니다. 서버가 꺼져 있거나 CORS/SSE 구성이 맞지 않습니다.",
        );
      };
    },
    [mode, onPlacesResolved, sessionId],
  );

  /**
   * 이미 만들어진 코스를 후속 발화로 수정한다 (mobility_rag Sprint 7).
   *
   * startRecommendation() 은 코스를 통째로 다시 만들지만, 이쪽은 사용자가
   * 유지하길 원한 장소를 그대로 두고 바뀐 부분만 반영한다.
   */
  const reviseRecommendation = useCallback(
    async (userMessage: string) => {
      const trimmed = userMessage.trim();
      if (!trimmed) return;

      setStreamError(null);
      setIsStreaming(true);
      setMessages((current) => [
        ...current,
        { id: `user-revise-${Date.now()}`, role: "user", text: trimmed },
        { id: `assistant-revise-${Date.now()}`, role: "assistant", text: "" },
      ]);

      try {
        const revised = await reviseCourse(sessionId, trimmed);

        // 응답에 좌표가 없으므로 직전 코스에서 place_id 로 이어받는다.
        const previousById = new Map(
          lastPayloadRef.current.map((place) => [String(place.place_id), place]),
        );
        const merged: RecommendedPlacePayload[] = revised.recommended_places.map((place) => {
          const previous = previousById.get(String(place.place_id));
          return {
            ...previous,
            place_id: String(place.place_id),
            visit_sequence: place.visit_sequence,
            place_name: place.place_name ?? previous?.place_name ?? null,
          };
        });

        // 새로 추가된 장소는 좌표가 없으므로 기존 보강 경로를 그대로 태운다.
        const resolved = await enrichRecommendedPlaces(merged);
        lastPayloadRef.current = resolved;
        setPlaces(mapBackendPlaces(resolved, mode));
        setMessages((current) =>
          replaceLastAssistantText(current, revised.bot_message || "코스를 수정했어요."),
        );
        void onPlacesResolved?.();
      } catch (error) {
        // 404 = 이 세션으로 /api/chat 을 먼저 호출한 적이 없거나 서버가 재시작된 경우.
        const notFound = error instanceof Error && error.message.includes("404");
        setMessages((current) => replaceLastAssistantText(current, ""));
        setStreamError(
          notFound
            ? "수정할 코스를 찾지 못했어요. 새 대화로 코스를 다시 만들어 주세요."
            : "코스 수정에 실패했어요. 잠시 후 다시 시도해 주세요.",
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [mode, onPlacesResolved, sessionId],
  );

  const streamStatus = useMemo<TravelStreamStatus>(() => {
    if (streamError) {
      return "error";
    }
    if (isStreaming) {
      return "live";
    }
    if (places.some((place) => place.sourcePlaceId)) {
      return "ready";
    }
    return "idle";
  }, [isStreaming, places, streamError]);

  return {
    messages,
    places,
    isStreaming,
    streamError,
    streamStatus,
    setMessages,
    setPlaces,
    startRecommendation,
    reviseRecommendation,
    canRevise: places.length > 0,
    resetToModeSeed,
  };
}

type StructuredCourse = {
  bot_message?: string;
  recommended_places?: RecommendedPlacePayload[];
};

function parseStructuredCourse(value: string): StructuredCourse | null {
  try {
    const parsed = JSON.parse(value) as StructuredCourse;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function mergePlaceMetadata(
  finalPlaces: RecommendedPlacePayload[],
  streamedPlaces: RecommendedPlacePayload[],
) {
  const streamedById = new Map(streamedPlaces.map((place) => [String(place.place_id), place]));

  return finalPlaces.map((place) => {
    const streamed = streamedById.get(String(place.place_id));
    if (!streamed) return place;

    return {
      ...streamed,
      ...place,
      place_name: place.place_name ?? streamed.place_name,
      duration_min: place.duration_min ?? streamed.duration_min,
    };
  });
}

function replaceLastAssistantText(messages: ChatMessage[], text: string) {
  const next = [...messages];
  for (let index = next.length - 1; index >= 0; index -= 1) {
    if (next[index].role === "assistant") {
      next[index] = { ...next[index], text };
      break;
    }
  }
  return next;
}

function getCurrentCoordinates(): Promise<{ lat: number; lon: number }> {
  if (!("geolocation" in navigator)) {
    return Promise.reject(new Error("Geolocation is not supported."));
  }

  return requestPosition({ enableHighAccuracy: true, timeout: 8_000, maximumAge: 60_000 })
    .catch((error: GeolocationPositionError) => {
      if (error.code === 1) throw error;
      return requestPosition({ enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 });
    });
}

function requestPosition(options: PositionOptions): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
      reject,
      options,
    );
  });
}

function getLocationErrorMessage(error: unknown) {
  if (!window.isSecureContext) {
    return "보안 연결에서만 위치를 사용할 수 있습니다. https:// 주소로 접속해 주세요.";
  }
  if (isGeolocationError(error)) {
    if (error.code === 1) {
      return "위치 권한이 차단돼 있습니다. 주소창의 사이트 설정에서 위치를 '허용'으로 변경한 뒤 새로고침해 주세요.";
    }
    if (error.code === 3) {
      return "GPS 응답 시간이 초과됐습니다. 기기의 위치 서비스가 켜져 있는지 확인한 뒤 다시 시도해 주세요.";
    }
  }
  return "현재 위치를 가져오지 못했습니다. 브라우저와 기기의 위치 서비스 설정을 확인해 주세요.";
}

function isGeolocationError(error: unknown): error is GeolocationPositionError {
  return typeof error === "object" && error !== null && "code" in error;
}
