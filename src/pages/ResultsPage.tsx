import { Bot, Car, ChevronRight, Clock, Heart, MapPin, RefreshCw } from "lucide-react";
import { useState } from "react";
import ItineraryPanel from "../components/travel/ItineraryPanel";
import MapPanel from "../components/travel/MapPanel";
import ConversationPanel from "../components/travel/ConversationPanel";
import type { ChatMessage, Place, TravelMode } from "../types/domain";

type ResultsPageProps = {
  title: string;
  subtitle: string;
  description: string;
  notes: string[];
  selectedMode: TravelMode;
  places: Place[];
  visitedIds: string[];
  onSaveVisited: () => void;
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
  visitedIds,
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
}: ResultsPageProps) {
  const [saved, setSaved] = useState(false);
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant" && message.text.trim());

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
      <div className="mb-6 overflow-hidden rounded-[18px] border border-[#F0EDE8] bg-white shadow-sm">
        <div className="relative h-[195px] bg-[#0F1E38]">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop&auto=format"
            alt="여행 코스"
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/80 via-[#0A1628]/55 to-transparent" />
          <div className="absolute inset-0 flex items-end p-7">
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {modeTagLabel[selectedMode]}
                </span>
                {notes.slice(0, 1).map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-[#F07A3B]"
                  >
                    {note}
                  </span>
                ))}
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-white">{title}</h1>
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 rounded-[8px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                saved
                  ? "border-[#F07A3B] bg-[#FFF0E9] text-[#F07A3B]"
                  : "border-white/30 bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <Heart size={13} fill={saved ? "#F07A3B" : "none"} />
              {saved ? "저장됨" : "저장하기"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[#F0EDE8] px-7 py-5">
          <div className="flex flex-wrap gap-2">
            {notes.map((note) => (
              <span key={note} className="rounded-full bg-[#EBF6F4] px-3 py-1 text-[12px] font-semibold text-[#2D9C8C]">
                {note}
              </span>
            ))}
          </div>
          <div className="ml-auto hidden items-center gap-5 text-[13px] text-[#6B7280] md:flex">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#2D9C8C]" />
              총 {places.length}곳
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#2D9C8C]" />
              약 {Math.max(2, places.length * 1.5).toFixed(0)}시간
            </span>
            <span className="flex items-center gap-1.5">
              <Car size={13} className="text-[#2D9C8C]" />
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {description && (
        <div className="mb-6 rounded-[14px] border border-[#F0EDE8] bg-white px-6 py-4">
          <p className="text-[14px] leading-relaxed text-[#4A5568]">{description}</p>
        </div>
      )}

      {latestAssistantMessage ? (
        <div className="mb-6 rounded-[16px] border border-[#F0EDE8] bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1C2B4A] text-white"><Bot size={16} /></div>
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
                <span key={key} className="inline-flex h-6 items-center rounded-full bg-[#EBF6F4] px-2.5 text-[11px] font-bold leading-none text-[#2D9C8C]">{value}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Map + Itinerary ── */}
      <div className="grid items-start gap-6 xl:grid-cols-[400px_1fr]">
        {/* Map */}
        <div className="sticky top-[76px]">
          <div className="overflow-hidden rounded-[16px] border border-[#F0EDE8] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F0EDE8] px-5 py-3.5">
              <h2 className="text-[14px] font-bold text-[#1C2B4A]">코스 경로</h2>
              <span className="text-[12px] text-[#9CA3AF]">{modeTagLabel[selectedMode]}</span>
            </div>
            <MapPanel
              title={title}
              subtitle={subtitle}
              description={description}
              notes={notes}
              places={places}
              modeKey={selectedMode}
              badgeLabel={selectedMode === "longdist" ? "경로 안내" : "코스 미리보기"}
            />
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => document.getElementById("course-chat")?.scrollIntoView({ behavior: "smooth" })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#1C2B4A] py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#253860]"
            >
              <RefreshCw size={13} />
              일정 다듬기
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border py-3 text-[13px] font-bold transition-colors ${
                saved
                  ? "border-[#F07A3B] bg-[#FFF0E9] text-[#F07A3B]"
                  : "border-[#E8E4DC] bg-white text-[#1C2B4A] hover:bg-[#F9F7F2]"
              }`}
            >
              <Heart size={13} fill={saved ? "#F07A3B" : "none"} />
              {saved ? "저장됨" : "저장"}
            </button>
          </div>
        </div>

        {/* Itinerary */}
        <ItineraryPanel
          places={places}
          visitedItems={visitedIds}
          visitedItemPrefix="place_id:"
          onSaveVisited={onSaveVisited}
          canSaveVisited={canSaveVisited}
          isSavingVisited={isSavingVisited}
          saveLabel="이번 추천 저장"
          emptyVisitedText="저장된 방문 장소가 아직 없습니다."
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
    </section>
  );
}

export default ResultsPage;
