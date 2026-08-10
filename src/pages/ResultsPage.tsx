import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
import Expand from "lucide-react/dist/esm/icons/expand.mjs";
import MapPin from "lucide-react/dist/esm/icons/map-pin.mjs";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle.mjs";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useEffect, useState } from "react";
import ItineraryPanel from "../components/travel/ItineraryPanel";
import MapPanel from "../components/travel/MapPanel";
import ConversationPanel from "../components/travel/ConversationPanel";
import RecommendationReasonPanel from "../components/travel/RecommendationReasonPanel";
import type { ChatMessage, Place, TravelMode } from "../types/domain";

type ResultsPageProps = {
  title: string;
  subtitle: string;
  description: string;
  notes: string[];
  selectedMode: TravelMode;
  places: Place[];
  onSaveVisited: () => Promise<void>;
  canSaveVisited: boolean;
  isSavingVisited: boolean;
  onNavigatePlanner: () => void;
  sessionId?: string;
  messages: ChatMessage[];
  preferences: Record<string, string>;
  chatDraft: string;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: () => void;
  isStreaming: boolean;
  chatError: string | null;
  onRegenerate: () => void;
};

const modeTagLabel: Record<TravelMode, string> = {
  nearby: "근교 당일형",
  longdist: "장거리 경유형",
  remote: "타지 큐레이션형",
};

export function ResultsPage({
  title,
  subtitle,
  description,
  notes,
  selectedMode,
  places,
  onSaveVisited,
  canSaveVisited,
  isSavingVisited,
  onNavigatePlanner,
  messages,
  preferences,
  chatDraft,
  onChatDraftChange,
  onChatSubmit,
  isStreaming,
  chatError,
  onRegenerate,
}: ResultsPageProps) {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(places[0]?.id ?? null);
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant" && message.text.trim());

  async function handleSaveCourse() {
    await onSaveVisited();
    setSaveNotice(true);
    window.setTimeout(() => setSaveNotice(false), 2400);
  }

  useEffect(() => {
    if (!mapExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mapExpanded]);

  useEffect(() => {
    setSelectedPlaceId((current) => (
      current && places.some((place) => place.id === current)
        ? current
        : places[0]?.id ?? null
    ));
  }, [places]);

  function handleMapPlaceSelect(placeId: string) {
    setSelectedPlaceId(placeId);
    window.requestAnimationFrame(() => {
      document.getElementById(`place-card-${placeId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  return (
    <section>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link">홈</span>
        <ChevronRight size={12} />
        <span className="breadcrumb-link" onClick={onNavigatePlanner}>여행 계획</span>
        <ChevronRight size={12} />
        <span className="breadcrumb-current">추천 코스</span>
      </div>

      {/* ── Course Header ── */}
      <div className="mb-5 overflow-hidden rounded-[18px] border border-[#F0EDE8] bg-white shadow-sm sm:mb-6">
        <div className="relative h-[158px] bg-gradient-to-br from-[#FFB088] via-[#FF8A65] to-[#FF6B6B] sm:h-[195px]">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop&auto=format"
            alt="여행 코스"
            className="h-full w-full object-cover opacity-20 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D3436]/45 via-[#2D3436]/10 to-transparent" />
          <div className="absolute inset-0 flex items-end p-5 sm:p-7">
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {modeTagLabel[selectedMode]}
                </span>
              </div>
              <h1 className="text-[22px] font-bold tracking-tight text-white sm:text-[28px]">{title}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[#F0EDE8] px-5 py-4 sm:px-7 sm:py-5">
          <div className="ml-auto hidden items-center gap-5 text-[13px] text-[#6B7280] md:flex">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#FF7B59]" />
              총 {places.length}곳
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {latestAssistantMessage ? (
        <div className="mb-5 rounded-[22px] border border-white/80 bg-white/90 p-4 shadow-[0_10px_32px_rgba(85,61,45,.07)] sm:mb-6 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB088] to-[#FF7B59] text-white"><Bot size={17} /></div>
            <div>
              <h2 className="text-[14px] font-bold text-[#1C2B4A]">Traveler의 코스 설명</h2>
              <p className="text-[11px] text-[#9CA3AF]">GPT-4o 실시간 응답</p>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-[13px] leading-7 text-[#4A5568]">{latestAssistantMessage.text}</p>
          {Object.keys(preferences).length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#F0EDE8] pt-4">
              <span className="inline-flex h-6 items-center text-[11px] font-bold leading-none text-[#9CA3AF]">이번 세션에 반영된 취향</span>
              {Object.entries(preferences).map(([key, value]) => (
                <span key={key} className="inline-flex h-6 items-center rounded-full bg-[#FFF1E7] px-2.5 text-[11px] font-bold leading-none text-[#FF7B59]">{value}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {places.some((place) => place.recommendReason) ? (
        <div className="mb-5 sm:mb-6">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[22px] border border-white/80 bg-white px-5 py-4 text-left shadow-[0_10px_32px_rgba(85,61,45,.07)] transition hover:-translate-y-0.5"
            onClick={() => setReasonOpen(true)}
          >
            <span>
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FF7B59]">Recommendation basis</span>
              <span className="mt-1 block text-[17px] font-extrabold text-[#2D3436]">추천 근거 보기</span>
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1E7] text-[#FF7B59]">
              <Bot size={18} />
            </span>
          </button>
        </div>
      ) : null}
      <RecommendationReasonPanel places={places} open={reasonOpen} onClose={() => setReasonOpen(false)} />

      {/* ── Map + Itinerary ── */}
      <div className="grid items-start gap-5 xl:grid-cols-[400px_1fr] xl:gap-6">
        {/* Map */}
        <div className="relative z-0 xl:sticky xl:top-[76px] xl:z-10">
          <div className="overflow-hidden rounded-[20px] border border-[#F0EDE8] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0EDE8] px-4 py-3.5 sm:px-5">
              <h2 className="text-[14px] font-bold text-[#1C2B4A]">코스 경로</h2>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#9CA3AF]">{modeTagLabel[selectedMode]}</span>
                <button
                  type="button"
                  aria-label="지도 최대화"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1E7] text-[#FF7B59] transition hover:bg-[#FFE0D0]"
                  onClick={() => setMapExpanded(true)}
                >
                  <Expand size={15} />
                </button>
              </div>
            </div>
            <MapPanel
              title={title}
              subtitle={subtitle}
              description={description}
              notes={[]}
              places={places}
              modeKey={selectedMode}
              badgeLabel={selectedMode === "longdist" ? "경로 안내" : "코스 미리보기"}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={handleMapPlaceSelect}
            />
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              disabled={isStreaming || places.length === 0}
              onClick={onRegenerate}
              className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7B59] to-[#FF6B6B] py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(255,123,89,.2)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={isStreaming ? "animate-spin" : ""} size={13} />
              {isStreaming ? "새 코스 생성 중" : "다른 코스 추천"}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("course-chat")?.scrollIntoView({ behavior: "smooth" })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#2D3436] py-3 text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle size={13} />
              일정 다듬기
            </button>
          </div>
        </div>

        {/* Itinerary */}
        <ItineraryPanel
          places={places}
          onSaveVisited={() => void handleSaveCourse()}
          canSaveVisited={canSaveVisited}
          isSavingVisited={isSavingVisited}
          saveLabel="이번 추천 저장"
          emptyVisitedText="저장된 방문 장소가 아직 없습니다."
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={setSelectedPlaceId}
        />
      </div>

      <div id="course-chat" className="mt-8 scroll-mt-24">
        <ConversationPanel
          messages={messages}
          draft={chatDraft}
          onDraftChange={onChatDraftChange}
          onSubmit={onChatSubmit}
          isStreaming={isStreaming}
          error={chatError}
          helperText="같은 세션에서 장소 교체, 순서 변경, 이동량 조정 요청을 이어갈 수 있습니다."
          submitLabel="코스에 반영"
          placeholder="예: 불국사 대신 실내 장소로 바꿔줘"
        />
      </div>

      {mapExpanded ? (
        <div className="fixed inset-0 z-[100] bg-[#2D3436]/55 p-0 backdrop-blur-sm md:p-8" role="dialog" aria-modal="true" aria-label="코스 경로 전체 화면">
          <div className="mx-auto flex h-[100dvh] max-w-[1400px] flex-col overflow-hidden rounded-none border-0 bg-[#FFF6EC] shadow-2xl md:h-full md:rounded-[26px] md:border md:border-white/80">
            <div className="flex min-h-[73px] items-center justify-between border-b border-[#2D3436]/10 px-4 py-3 md:px-7 md:py-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FF7B59]">Full route</p>
                <h2 className="mt-0.5 line-clamp-1 text-[17px] font-extrabold text-[#2D3436] md:text-[19px]">{title}</h2>
              </div>
              <button
                type="button"
                aria-label="전체 지도 닫기"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2D3436] shadow-sm transition hover:bg-[#FFE8D6]"
                onClick={() => setMapExpanded(false)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden p-0 md:p-4">
              <MapPanel
                title={title}
                subtitle={subtitle}
                description={description}
                notes={[]}
                places={places}
                modeKey={selectedMode}
                badgeLabel="전체 코스"
                expanded
                selectedPlaceId={selectedPlaceId}
                onPlaceSelect={handleMapPlaceSelect}
              />
            </div>
          </div>
        </div>
      ) : null}

      {saveNotice ? (
        <div className="fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#2D3436] px-5 py-3 text-[13px] font-bold text-white shadow-xl">
          추천 코스를 저장했습니다.
        </div>
      ) : null}
    </section>
  );
}

export default ResultsPage;
