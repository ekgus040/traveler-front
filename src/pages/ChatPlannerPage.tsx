import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle.mjs";
import MapPinned from "lucide-react/dist/esm/icons/map-pinned.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Send from "lucide-react/dist/esm/icons/send.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import { useEffect, useRef, useState } from "react";
import PlaceCard from "../components/travel/PlaceCard";
import RecommendationReasonPanel from "../components/travel/RecommendationReasonPanel";
import type { ChatMessage, Place, TravelComposerState, TravelMode, TravelOption } from "../types/domain";

type ChatStep = "interest" | "companion" | "pace" | "route" | "request" | "result";

type ChatPlannerPageProps = {
  selectedMode: TravelMode;
  composer: TravelComposerState;
  onComposerChange: <K extends keyof TravelComposerState>(key: K, value: TravelComposerState[K]) => void;
  companionOptions: TravelOption[];
  paceOptions: TravelOption[];
  onSubmit: () => void;
  onReset: () => void;
  isStreaming: boolean;
  error: string | null;
  messages: ChatMessage[];
  places: Place[];
  followUpDraft: string;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onConfirm: () => void;
};

const modeAnswer: Record<TravelMode, string> = {
  nearby: "근교 드라이브",
  longdist: "자차 장거리",
  remote: "타지 렌터카",
};

const interestOptions = [
  { value: "nature", label: "🌿 자연" },
  { value: "city", label: "🏙️ 도시" },
  { value: "food", label: "🍽️ 맛집" },
  { value: "culture", label: "🏛️ 문화" },
];

const PROFILE_STORAGE_KEY = "traveler-chat-profile";

export function ChatPlannerPage({
  selectedMode,
  composer,
  onComposerChange,
  companionOptions,
  paceOptions,
  onSubmit,
  onReset,
  isStreaming,
  error,
  messages,
  places,
  followUpDraft,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onConfirm,
}: ChatPlannerPageProps) {
  const [step, setStep] = useState<ChatStep>("interest");
  const [answers, setAnswers] = useState<Array<{ label: string; value: string }>>([]);
  const [restoredProfile, setRestoredProfile] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) return;
    try {
      const profile = JSON.parse(saved) as { interest: string; companion: string; pace: string };
      onComposerChange("interest", profile.interest);
      onComposerChange("companion", profile.companion);
      onComposerChange("pace", profile.pace);
      setRestoredProfile(true);
      setStep(selectedMode === "longdist" ? "route" : "request");
    } catch {
      sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (step !== "result") return;
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isStreaming, messages, places, step]);

  function answer(label: string, value: string, nextStep: ChatStep) {
    setAnswers((current) => [...current.filter((item) => item.label !== label), { label, value }]);
    setStep(nextStep);
  }

  function selectInterest(option: { value: string; label: string }) {
    onComposerChange("interest", option.value);
    answer("선호 여행", option.label, "companion");
  }

  function selectCompanion(option: TravelOption) {
    onComposerChange("companion", option.value);
    answer("동행", option.label, "pace");
  }

  function selectPace(option: TravelOption) {
    onComposerChange("pace", option.value);
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
      interest: composer.interest,
      companion: composer.companion,
      pace: option.value,
    }));
    answer("에너지 레벨", option.label, selectedMode === "longdist" ? "route" : "request");
  }

  function submitRoute() {
    if (!composer.startPoint.trim() || !composer.endPoint.trim()) return;
    answer("이동 경로", `${composer.startPoint} → ${composer.endPoint}`, "request");
  }

  function submitRequest() {
    if (!composer.query.trim()) return;
    answer("추가 요청", composer.query.trim(), "result");
    onSubmit();
  }

  function restart() {
    onReset();
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    setAnswers([]);
    setRestoredProfile(false);
    setStep("interest");
  }

  const showStep = (target: ChatStep) => step === target;
  // The first user message is already rendered as the structured request bubble above.
  const conversationMessages = messages.slice(1);

  return (
    <section className="mx-auto w-full max-w-[900px] pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FF7B59]">Traveler assistant · {modeAnswer[selectedMode]}</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[#2D3436]">대화로 여행 코스를 완성해요</h1>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#828F92] shadow-sm" onClick={restart}>
          <RotateCcw size={13} /> 새 대화
        </button>
      </div>

      <div className="rounded-[28px] border border-white/80 bg-[#FFF6EC]/80 p-4 shadow-[0_18px_55px_rgba(85,61,45,.08)] md:p-7">
        <div className="space-y-5">
          {restoredProfile ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#95E1D3] text-white"><Sparkles size={17} /></div>
              <div className="rounded-[20px] rounded-bl-md bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-bold text-[#2D3436]">지난 취향을 기억하고 있어요.</p>
                <p className="mt-1 text-xs text-[#828F92]">새 대화를 누르기 전까지 같은 취향으로 추천할게요.</p>
              </div>
            </div>
          ) : null}

          <AssistantBubble title="어떤 여행을 좋아하세요?" visible={!restoredProfile}>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((option) => (
                <Choice key={option.value} active={composer.interest === option.value && step !== "interest"} onClick={() => selectInterest(option)}>
                  {option.label}
                </Choice>
              ))}
            </div>
          </AssistantBubble>
          {!restoredProfile ? <AnswerBubble answer={answers.find((item) => item.label === "선호 여행")} /> : null}

          <AssistantBubble title="누구와 함께 가시나요?" visible={!restoredProfile && (showStep("companion") || answers.some((item) => item.label === "동행"))}>
            <div className="flex flex-wrap gap-2">
              {companionOptions.map((option) => <Choice key={option.value} onClick={() => selectCompanion(option)}>{option.label}</Choice>)}
            </div>
          </AssistantBubble>
          {!restoredProfile ? <AnswerBubble answer={answers.find((item) => item.label === "동행")} /> : null}

          <AssistantBubble title="오늘 에너지 레벨은 어떤가요?" visible={!restoredProfile && (showStep("pace") || answers.some((item) => item.label === "에너지 레벨"))}>
            <div className="flex flex-wrap gap-2">
              {paceOptions.map((option) => <Choice key={option.value} onClick={() => selectPace(option)}>{option.label}</Choice>)}
            </div>
          </AssistantBubble>
          {!restoredProfile ? <AnswerBubble answer={answers.find((item) => item.label === "에너지 레벨")} /> : null}

          <AssistantBubble title="출발지와 목적지를 알려주세요." visible={showStep("route") || answers.some((item) => item.label === "이동 경로")}>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
              <input className="rounded-xl border border-[#2D3436]/10 bg-[#FFF6EC] px-3 py-2.5 text-sm outline-none focus:border-[#FF7B59]" value={composer.startPoint} onChange={(event) => onComposerChange("startPoint", event.target.value)} placeholder="출발지" />
              <ArrowRight className="hidden text-[#FF7B59] sm:block" size={16} />
              <input className="rounded-xl border border-[#2D3436]/10 bg-[#FFF6EC] px-3 py-2.5 text-sm outline-none focus:border-[#FF7B59]" value={composer.endPoint} onChange={(event) => onComposerChange("endPoint", event.target.value)} placeholder="목적지" />
              <button className="rounded-xl bg-[#2D3436] px-4 py-2.5 text-xs font-bold text-white" onClick={submitRoute}>확인</button>
            </div>
          </AssistantBubble>
          <AnswerBubble answer={answers.find((item) => item.label === "이동 경로")} />

          <AssistantBubble title="원하는 여행을 평소 말투로 알려주세요." visible={showStep("request") || answers.some((item) => item.label === "추가 요청")}>
            <p className="text-xs leading-5 text-[#828F92]">장소, 분위기, 동행 조건을 한 문장에 편하게 적어도 알아들을 수 있어요.</p>
          </AssistantBubble>
          {showStep("request") ? (
            <div className="ml-auto flex w-full max-w-[82%] items-center gap-2 rounded-full border border-[#2D3436]/10 bg-white p-1.5 pl-5 shadow-[0_8px_24px_rgba(45,52,54,.07)]">
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#2D3436] outline-none placeholder:text-[#B0B8BA]"
                value={composer.query}
                onChange={(event) => onComposerChange("query", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) submitRequest();
                }}
                placeholder="메시지를 입력하세요"
              />
              <button
                type="button"
                aria-label="여행 요청 보내기"
                className="rounded-full bg-gradient-to-br from-[#FF7B59] to-[#FF6B6B] p-3 text-white shadow-lg disabled:opacity-40"
                disabled={!composer.query.trim()}
                onClick={submitRequest}
              >
                <Send size={18} />
              </button>
            </div>
          ) : null}
          <AnswerBubble answer={answers.find((item) => item.label === "추가 요청")} />

          {step === "result" ? (
            <div className="space-y-4">
              {isStreaming ? (
                <div className="flex items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm">
                  <LoaderCircle className="animate-spin text-[#FF7B59]" size={22} />
                  <div><strong className="text-sm text-[#2D3436]">조건에 맞는 장소를 찾고 있어요</strong><p className="mt-1 text-xs text-[#828F92]">날씨·방문 이력·취향을 함께 확인합니다.</p></div>
                </div>
              ) : null}
              {conversationMessages.filter((message) => message.text).map((message) => (
                message.role === "assistant" ? (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#95E1D3] text-white"><Bot size={17} /></div>
                    <div className="max-w-[82%] whitespace-pre-wrap rounded-[20px] rounded-bl-md bg-white p-4 text-[13px] leading-6 text-[#4A5658] shadow-sm">{message.text}</div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[78%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-gradient-to-br from-[#FF7B59] to-[#FF6B6B] px-4 py-3 text-[13px] leading-6 text-white shadow-[0_8px_20px_rgba(255,123,89,.18)]">{message.text}</div>
                  </div>
                )
              ))}
              {places.length > 0 && !isStreaming ? (
                <div className="ml-0 space-y-3 md:ml-12">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#828F92]"><Sparkles size={14} className="text-[#FF7B59]" /> 추천 코스</div>
                  {places.map((place, index) => <PlaceCard key={place.id} place={place} index={index} />)}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#FF7B59] shadow-sm" onClick={() => setReasonOpen(true)}><Sparkles size={16} /> 추천 근거 보기</button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#2D3436] px-5 py-3 text-sm font-bold text-white" onClick={onConfirm}><MapPinned size={16} /> 지도에서 전체 코스 보기</button>
                  </div>
                </div>
              ) : null}
              {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
              {!isStreaming && places.length > 0 ? (
                <div className="flex gap-2 rounded-full border border-[#2D3436]/10 bg-white p-1.5 shadow-sm">
                  <input className="min-w-0 flex-1 rounded-full px-4 text-sm outline-none" value={followUpDraft} onChange={(event) => onFollowUpDraftChange(event.target.value)} placeholder="예: 두 번째 장소는 빼줘 / 카페를 먼저 가고 싶어" />
                  <button className="rounded-full bg-gradient-to-br from-[#FF7B59] to-[#FF6B6B] p-3 text-white" onClick={onFollowUpSubmit}><Send size={16} /></button>
                </div>
              ) : null}
              <div ref={logEndRef} />
              <RecommendationReasonPanel places={places} open={reasonOpen} onClose={() => setReasonOpen(false)} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AssistantBubble({ title, visible, children }: { title: string; visible: boolean; children: React.ReactNode }) {
  if (!visible) return null;
  return <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#95E1D3] text-white"><Bot size={17} /></div><div className="w-full max-w-[82%] rounded-[20px] rounded-bl-md bg-white p-4 shadow-sm"><p className="mb-3 text-sm font-bold text-[#2D3436]">{title}</p>{children}</div></div>;
}

function AnswerBubble({ answer }: { answer?: { label: string; value: string } }) {
  if (!answer) return null;
  return <div className="flex justify-end"><div className="max-w-[75%] rounded-[20px] rounded-br-md bg-gradient-to-br from-[#FF7B59] to-[#FF6B6B] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,123,89,.18)]"><span className="mr-2 text-white/65">{answer.label}</span>{answer.value}</div></div>;
}

function Choice({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex flex-col rounded-2xl border px-4 py-3 text-left text-sm transition ${active ? "border-[#FF7B59] bg-[#FFE8D6] text-[#FF7B59]" : "border-[#2D3436]/10 bg-[#FFF6EC] text-[#2D3436] hover:border-[#FF7B59]/60"}`}>{children}</button>;
}

export default ChatPlannerPage;
