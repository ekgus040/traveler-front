import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_RECOMMENDATION_COORDINATES } from "../../../data/content";
import { initialChats, mockBotMessages, mockPlaces } from "../../../data/mock";
import { enrichRecommendedPlaces, openChatRecommendationStream } from "../../../api/traveler";

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

  const resetToModeSeed = useCallback(() => {
    eventSourceRef.current?.close();
    setIsStreaming(false);
    setStreamError(null);
    setMessages(IS_MOCK ? initialChats[mode] : []);
    setPlaces(IS_MOCK ? mockPlaces[mode] : []);
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
