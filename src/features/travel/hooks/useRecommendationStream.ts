import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_RECOMMENDATION_COORDINATES,
} from "../../../data/content";
import { initialChats, mockBotMessages, mockPlaces } from "../../../data/mock";
import { openChatRecommendationStream } from "../../../api/traveler";

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === "true";
import type {
  ChatMessage,
  Place,
  TravelComposerState,
  TravelCoordinates,
  TravelMode,
  TravelStreamStatus,
} from "../../../types/domain";
import type { ChatStreamPayload } from "../../../types/api";
import { mapBackendPlaces } from "../model/mappers";
import { buildTravelPrompt, buildTravelUserPreview } from "../model/prompt";

type UseRecommendationStreamParams = {
  mode: TravelMode;
  sessionId: string;
  coordinates?: TravelCoordinates;
  onPlacesResolved?: () => void | Promise<void>;
};

export function useRecommendationStream({
  mode,
  sessionId,
  coordinates = DEFAULT_RECOMMENDATION_COORDINATES,
  onPlacesResolved,
}: UseRecommendationStreamParams) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialChats[mode]);
  const [places, setPlaces] = useState<Place[]>(() => mockPlaces[mode]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const resetToModeSeed = useCallback(() => {
    eventSourceRef.current?.close();
    setIsStreaming(false);
    setStreamError(null);
    setMessages(initialChats[mode]);
    setPlaces(mockPlaces[mode]);
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
    (composer: TravelComposerState) => {
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

      const userMessage = buildTravelPrompt({ mode, composer });

      const source = openChatRecommendationStream({
        sessionId,
        userMessage,
        lat: coordinates.lat,
        lon: coordinates.lon,
      });

      eventSourceRef.current = source;

      source.onmessage = (event) => {
        const payload = JSON.parse(event.data) as ChatStreamPayload;

        if (payload.bot_message) {
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                text: `${last.text}${payload.bot_message}`,
              };
            }
            return next;
          });
        }

        if (payload.recommended_places.length > 0) {
          setPlaces(mapBackendPlaces(payload.recommended_places, mode));
          setIsStreaming(false);
          source.close();
          void onPlacesResolved?.();
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
    [coordinates.lat, coordinates.lon, mode, onPlacesResolved, sessionId],
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
