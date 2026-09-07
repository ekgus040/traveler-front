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
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && message.text.trim());

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
    setSelectedPlaceId((current) =>
      current && places.some((place) => place.id === current) ? current : places[0]?.id ?? null,
    );
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
      <div className="breadcrumb">
        <span className="breadcrumb-link">홈</span>
        <ChevronRight size={12} />
        <span className="breadcrumb-link" onClick={onNavigatePlanner}>
          코스 만들기
        </span>
        <ChevronRight size={12} />
        <span className="breadcrumb-current">추천 코스</span>
      </div>

      {/* ── 코스 헤더 ── */}
      <div className="mb-6 border-b border-line pb-6">
        <span className="badge badge-primary">{modeTagLabel[selectedMode]}</span>
        <h1 className="mt-2 text-[26px] font-bold leading-[1.3] tracking-[-0.03em] text-ink md:text-[30px]">
          {title}
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={13} />총 {places.length}곳
          </span>
          {Object.entries(preferences).map(([key, value]) => (
            <span key={key}>· {value}</span>
          ))}
        </div>
      </div>

      {/* ── 코스 설명 ── */}
      {latestAssistantMessage ? (
        <div className="mb-5 rounded-[14px] border border-line bg-surface p-5">
          <p className="mb-2 text-[13px] font-semibold text-muted">코스 설명</p>
          <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-sub">
            {latestAssistantMessage.text}
          </p>
        </div>
      ) : null}

      {places.some((place) => place.recommendReason) ? (
        <button
          type="button"
          className="mb-6 flex w-full items-center justify-between rounded-[12px] border border-line bg-white px-5 py-4 text-left transition-colors hover:bg-surface"
          onClick={() => setReasonOpen(true)}
        >
          <span>
            <span className="block text-[15px] font-semibold text-ink">추천 근거 보기</span>
            <span className="mt-0.5 block text-[13px] text-muted">각 장소를 고른 이유를 확인합니다.</span>
          </span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      ) : null}
      <RecommendationReasonPanel places={places} open={reasonOpen} onClose={() => setReasonOpen(false)} />

      {/* ── 지도 + 일정 ── */}
      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <div className="relative z-0 xl:sticky xl:top-[74px] xl:z-10">
          <div className="overflow-hidden rounded-[14px] border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[14px] font-semibold text-ink">코스 경로</h2>
              <button
                type="button"
                aria-label="지도 최대화"
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-surface hover:text-ink"
                onClick={() => setMapExpanded(true)}
              >
                <Expand size={15} />
              </button>
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

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              disabled={isStreaming || places.length === 0}
              onClick={onRegenerate}
              className="btn btn-outline py-3"
            >
              <RefreshCw className={isStreaming ? "animate-spin" : ""} size={14} />
              {isStreaming ? "새 코스 생성 중" : "다른 코스 추천"}
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("course-chat")?.scrollIntoView({ behavior: "smooth" })}
              className="btn btn-navy py-3"
            >
              <MessageCircle size={14} />
              일정 다듬기
            </button>
          </div>
        </div>

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

      <div id="course-chat" className="mt-10 scroll-mt-24">
        <ConversationPanel
          messages={messages}
          draft={chatDraft}
          onDraftChange={onChatDraftChange}
          onSubmit={onChatSubmit}
          isStreaming={isStreaming}
          error={chatError}
          helperText="장소 교체, 순서 변경, 이동량 조정을 이어서 요청할 수 있습니다."
          submitLabel="코스에 반영"
          placeholder="예: 불국사 대신 실내 장소로 바꿔줘"
        />
      </div>

      {mapExpanded ? (
        <div
          className="fixed inset-0 z-[100] bg-ink/40 p-0 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="코스 경로 전체 화면"
        >
          <div className="mx-auto flex h-[100dvh] max-w-[1400px] flex-col overflow-hidden bg-white md:h-full md:rounded-[16px] md:border md:border-line">
            <div className="flex min-h-[62px] items-center justify-between border-b border-line px-5">
              <h2 className="line-clamp-1 text-[16px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
              <button
                type="button"
                aria-label="전체 지도 닫기"
                className="flex h-9 w-9 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-surface hover:text-ink"
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
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-[10px] bg-ink px-5 py-3 text-[14px] font-medium text-white shadow-pop">
          추천 코스를 저장했습니다.
        </div>
      ) : null}
    </section>
  );
}

export default ResultsPage;
