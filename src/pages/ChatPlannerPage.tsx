import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle.mjs";
import MapPinned from "lucide-react/dist/esm/icons/map-pinned.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Send from "lucide-react/dist/esm/icons/send.mjs";
import { useEffect, useRef, useState } from "react";
import PlaceCard from "../components/travel/PlaceCard";
import RecommendationReasonPanel from "../components/travel/RecommendationReasonPanel";
import { modeLabels } from "../data/content";
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
  /** 홈에서 바로 추천을 시작한 경우 값이 올라간다. 결과 단계로 건너뛴다. */
  autoStartToken: number;
};

const interestOptions: TravelOption[] = [
  { value: "nature", label: "자연·풍경" },
  { value: "city", label: "도시·거리" },
  { value: "food", label: "맛집·카페" },
  { value: "culture", label: "문화·역사" },
];

const PROFILE_STORAGE_KEY = "traveler-chat-profile";

const STEP_LABEL: Record<Exclude<ChatStep, "result">, string> = {
  interest: "관심사",
  companion: "동행",
  pace: "템포",
  route: "이동 경로",
  request: "추가 요청",
};

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
  autoStartToken,
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

  // 홈의 검색바/프리셋으로 들어온 경우 질문을 건너뛰고 결과부터 보여준다.
  useEffect(() => {
    if (autoStartToken > 0) setStep("result");
  }, [autoStartToken]);

  useEffect(() => {
    if (step !== "result") return;
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isStreaming, messages, places, step]);

  function answer(label: string, value: string, nextStep: ChatStep) {
    setAnswers((current) => [...current.filter((item) => item.label !== label), { label, value }]);
    setStep(nextStep);
  }

  function selectInterest(option: TravelOption) {
    onComposerChange("interest", option.value);
    answer(STEP_LABEL.interest, option.label, "companion");
  }

  function selectCompanion(option: TravelOption) {
    onComposerChange("companion", option.value);
    answer(STEP_LABEL.companion, option.label, "pace");
  }

  function selectPace(option: TravelOption) {
    onComposerChange("pace", option.value);
    sessionStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        interest: composer.interest,
        companion: composer.companion,
        pace: option.value,
      }),
    );
    answer(STEP_LABEL.pace, option.label, selectedMode === "longdist" ? "route" : "request");
  }

  function submitRoute() {
    if (!composer.startPoint.trim() || !composer.endPoint.trim()) return;
    answer(STEP_LABEL.route, `${composer.startPoint} → ${composer.endPoint}`, "request");
  }

  function submitRequest() {
    const trimmed = composer.query.trim();
    answer(STEP_LABEL.request, trimmed || "조건에 맞게 알아서 추천", "result");
    onSubmit();
  }

  function restart() {
    onReset();
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    setAnswers([]);
    setRestoredProfile(false);
    setStep("interest");
  }

  const totalSteps = selectedMode === "longdist" ? 5 : 4;
  const doneSteps = Math.min(answers.length, totalSteps);
  const progress = step === "result" ? 100 : Math.round((doneSteps / totalSteps) * 100);
  const conversationMessages = messages.slice(1);
  const isQuestionStep = step !== "result";

  return (
    <section className="mx-auto w-full max-w-[720px] pb-8">
      {/* ── 헤더 ── */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{modeLabels[selectedMode]}</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-ink">
            {step === "result" ? "추천 코스" : "코스 만들기"}
          </h1>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={restart}>
          <RotateCcw size={13} /> 처음부터
        </button>
      </div>

      {/* ── 진행 표시 ── */}
      {isQuestionStep ? (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-[13px] text-muted">
            <span>{doneSteps}/{totalSteps} 단계</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {/* ── 선택한 조건 요약 ── */}
      {answers.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {answers.map((item) => (
            <span key={item.label} className="badge badge-outline gap-1 py-1">
              <Check size={11} className="text-brand" />
              <span className="text-muted">{item.label}</span>
              <span className="font-semibold text-ink">{item.value}</span>
            </span>
          ))}
        </div>
      ) : null}

      {restoredProfile && isQuestionStep ? (
        <p className="mb-4 rounded-[10px] border border-brand-border bg-brand-weak px-4 py-3 text-[13px] text-brand">
          지난번 선택한 취향을 그대로 사용하고 있어요. 바꾸려면 처음부터를 눌러주세요.
        </p>
      ) : null}

      {/* ── 질문 ── */}
      {step === "interest" && !restoredProfile ? (
        <QuestionCard title="어떤 걸 보고 싶으세요?" hint="장소를 고르는 기준이 됩니다.">
          <div className="grid grid-cols-2 gap-2">
            {interestOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`chip justify-start py-3 ${composer.interest === option.value ? "is-active" : ""}`}
                onClick={() => selectInterest(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionCard>
      ) : null}

      {step === "companion" ? (
        <QuestionCard title="누구와 함께 가시나요?" hint="동행에 따라 장소와 체류 시간이 달라집니다.">
          <div className="grid grid-cols-2 gap-2">
            {companionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="chip justify-start py-3"
                onClick={() => selectCompanion(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionCard>
      ) : null}

      {step === "pace" ? (
        <QuestionCard title="오늘의 이동 템포는요?" hint="장소 수와 이동량을 조절합니다.">
          <div className="grid grid-cols-2 gap-2">
            {paceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="chip justify-start py-3"
                onClick={() => selectPace(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionCard>
      ) : null}

      {step === "route" ? (
        <QuestionCard title="어디에서 어디로 가시나요?" hint="경로 위 휴게소와 식사 지점을 함께 배치합니다.">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
            <input
              className="form-input"
              value={composer.startPoint}
              onChange={(event) => onComposerChange("startPoint", event.target.value)}
              placeholder="출발지"
            />
            <ArrowRight className="hidden self-center text-muted sm:block" size={16} />
            <input
              className="form-input"
              value={composer.endPoint}
              onChange={(event) => onComposerChange("endPoint", event.target.value)}
              placeholder="목적지"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary mt-3 w-full py-3"
            disabled={!composer.startPoint.trim() || !composer.endPoint.trim()}
            onClick={submitRoute}
          >
            다음
          </button>
        </QuestionCard>
      ) : null}

      {step === "request" ? (
        <QuestionCard
          title="더 원하는 조건이 있나요?"
          hint="비워두고 넘어가도 앞에서 고른 조건으로 코스를 만듭니다."
        >
          <textarea
            autoFocus
            rows={3}
            className="form-textarea"
            value={composer.query}
            onChange={(event) => onComposerChange("query", event.target.value)}
            placeholder="예: 주차 편한 곳 위주로, 점심은 국수집"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn btn-outline flex-1 py-3"
              onClick={() => {
                onComposerChange("query", "");
                submitRequest();
              }}
            >
              건너뛰기
            </button>
            <button type="button" className="btn btn-primary flex-[2] py-3" onClick={submitRequest}>
              코스 만들기
              <ArrowRight size={15} />
            </button>
          </div>
        </QuestionCard>
      ) : null}

      {/* ── 결과 ── */}
      {step === "result" ? (
        <div className="space-y-4">
          {isStreaming ? (
            <div className="shell-card flex items-center gap-3 p-5">
              <LoaderCircle className="animate-spin text-brand" size={20} />
              <div>
                <p className="text-[15px] font-semibold text-ink">조건에 맞는 장소를 찾고 있어요</p>
                <p className="mt-0.5 text-[13px] text-muted">날씨·방문 이력·취향을 함께 확인합니다.</p>
              </div>
            </div>
          ) : null}

          {conversationMessages
            .filter((message) => message.text)
            .map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="shell-card p-5">
                  <p className="mb-2 text-[13px] font-semibold text-muted">코스 설명</p>
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-sub">{message.text}</p>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-[12px] bg-brand px-4 py-2.5 text-[14px] leading-[1.6] text-white">
                    {message.text}
                  </div>
                </div>
              ),
            )}

          {places.length > 0 && !isStreaming ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-ink">
                  추천 코스 <span className="ml-1 text-[13px] font-medium text-muted">총 {places.length}곳</span>
                </p>
              </div>
              {places.map((place, index) => (
                <PlaceCard key={place.id} place={place} index={index} />
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                {places.some((place) => place.recommendReason) ? (
                  <button type="button" className="btn btn-outline py-3" onClick={() => setReasonOpen(true)}>
                    추천 근거 보기
                  </button>
                ) : null}
                <button type="button" className="btn btn-primary flex-1 py-3" onClick={onConfirm}>
                  <MapPinned size={15} /> 지도에서 전체 코스 보기
                </button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-[10px] border border-[#F5C2C4] bg-[#FEF1F1] px-4 py-3 text-[13px] text-[#C63B40]">
              {error}
            </p>
          ) : null}

          {!isStreaming && places.length > 0 ? (
            <div className="sticky bottom-4 flex items-center gap-2 rounded-[12px] border border-line bg-white p-2 pl-4 shadow-pop">
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-ink outline-none placeholder:text-muted"
                value={followUpDraft}
                onChange={(event) => onFollowUpDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) onFollowUpSubmit();
                }}
                placeholder="예: 두 번째 장소는 빼줘 / 카페를 먼저 가고 싶어"
              />
              <button
                type="button"
                aria-label="수정 요청 보내기"
                className="btn btn-primary shrink-0 px-3 py-2.5"
                onClick={onFollowUpSubmit}
              >
                <Send size={15} />
              </button>
            </div>
          ) : null}

          <div ref={logEndRef} />
          <RecommendationReasonPanel places={places} open={reasonOpen} onClose={() => setReasonOpen(false)} />
        </div>
      ) : null}
    </section>
  );
}

function QuestionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell-card p-5 md:p-6">
      <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
      <p className="mt-1 text-[13px] text-muted">{hint}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default ChatPlannerPage;
