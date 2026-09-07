import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navigation from "lucide-react/dist/esm/icons/navigation.mjs";
import {
  COMPANION_OPTIONS,
  DEFAULT_TRAVEL_COMPOSER,
  PACE_OPTIONS,
  modeCards,
} from "./data/content";
import { useRecommendationStream } from "./features/travel/hooks/useRecommendationStream";
import { useTravelSession } from "./features/travel/hooks/useTravelSession";
import ChatPlannerPage from "./pages/ChatPlannerPage";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import type { TravelComposerState, TravelMode } from "./types/domain";


type OnboardingSelections = Record<string, string>;

function App() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<TravelMode>("nearby");
  const [composer, setComposer] = useState<TravelComposerState>(DEFAULT_TRAVEL_COMPOSER);
  const [refineDraft, setRefineDraft] = useState("");
  // 홈에서 바로 추천을 시작할 때, 모드 변경이 반영된 뒤 실행되도록 한 틱 미룬다.
  const [pendingStart, setPendingStart] = useState<TravelComposerState | null>(null);
  const [autoStartToken, setAutoStartToken] = useState(0);
  const [onboardingSelections, setOnboardingSelections] = useState<OnboardingSelections>({
    companion: DEFAULT_TRAVEL_COMPOSER.companion,
    pace: DEFAULT_TRAVEL_COMPOSER.pace,
    mood: DEFAULT_TRAVEL_COMPOSER.mood,
    weather: DEFAULT_TRAVEL_COMPOSER.weather,
  });

  const {
    sessionId,
    isSavingVisited,
    sessionError,
    prefs,
    serviceStatus,
    redisStatus,
    saveVisitedPlaces,
    resetSession,
    syncVisited,
  } = useTravelSession();

  const {
    messages,
    places,
    isStreaming,
    streamError,
    startRecommendation,
    reviseRecommendation,
    canRevise,
    resetToModeSeed,
  } = useRecommendationStream({
    mode: selectedMode,
    sessionId,
    onPlacesResolved: syncVisited,
  });

  const currentModeMeta = useMemo(
    () => modeCards.find((mode) => mode.id === selectedMode) ?? modeCards[0],
    [selectedMode],
  );
  const canSaveVisited = useMemo(
    () => places.some((place) => place.sourcePlaceId),
    [places],
  );
  const combinedError = streamError ?? sessionError;


  function updateComposer<K extends keyof TravelComposerState>(
    key: K,
    value: TravelComposerState[K],
  ) {
    setComposer((current) => ({ ...current, [key]: value }));
  }

  function handleModeChange(value: string) {
    const nextMode = value as TravelMode;
    setSelectedMode(nextMode);
    setRefineDraft("");
    setComposer((current) => ({
      ...current,
      startPoint: DEFAULT_TRAVEL_COMPOSER.startPoint,
      endPoint: DEFAULT_TRAVEL_COMPOSER.endPoint,
    }));
  }

  useEffect(() => {
    if (!pendingStart) return;
    setPendingStart(null);
    void startRecommendation(pendingStart);
  }, [pendingStart, startRecommendation]);

  function handleGenerate() {
    startRecommendation(composer);
  }

  function handleOpenPlanner(mode: TravelMode) {
    setSelectedMode(mode);
    void navigate("/planner");
  }

  /**
   * 홈 검색바·프리셋: 곧바로 추천을 실행한다.
   * 고르지 않은 취향은 넘기지 않는다 — 기본값을 실어보내면
   * 요청과 무관한 조건(가족/자연 등)으로 추천이 나온다.
   */
  function handleQuickStart(
    mode: TravelMode,
    query: string,
    route?: { startPoint: string; endPoint: string },
  ) {
    const nextComposer: TravelComposerState = {
      ...DEFAULT_TRAVEL_COMPOSER,
      query,
      startPoint: route?.startPoint ?? "",
      endPoint: route?.endPoint ?? "",
    };
    setSelectedMode(mode);
    setComposer(nextComposer);
    setRefineDraft("");
    setAutoStartToken((current) => current + 1);
    setPendingStart(nextComposer);
    void navigate("/planner");
  }

  async function handleReset() {
    await resetSession();
    resetToModeSeed();
    setRefineDraft("");
    setComposer(DEFAULT_TRAVEL_COMPOSER);
  }

  function handleRefineSubmit() {
    const message = refineDraft.trim();
    if (!message) return;
    setRefineDraft("");

    // 이미 코스가 있으면 통째로 다시 만들지 않고 바뀐 부분만 반영한다
    // (mobility_rag Sprint 7, POST /api/chat/revise).
    if (canRevise) {
      void reviseRecommendation(message);
      return;
    }

    const nextComposer = { ...composer, query: message };
    setComposer(nextComposer);
    startRecommendation(nextComposer);
  }

  function handleRegenerate() {
    const nextComposer = { ...composer, query: "방문했던 장소를 제외하고 다른 코스를 추천해줘" };
    setComposer(nextComposer);
    setRefineDraft("");
    startRecommendation(nextComposer);
  }

  function handleOnboardingComplete(selections: OnboardingSelections) {
    setOnboardingSelections(selections);
    setComposer((current) => ({
      ...current,
      companion: selections.companion ?? current.companion,
      pace: selections.pace ?? current.pace,
      mood: selections.mood ?? current.mood,
      weather: selections.weather ?? current.weather,
    }));
    void navigate("/planner");
  }

  return (
    <div className="app-frame" data-theme="traveler">
      {/* ── Header ── */}
      <header className="site-header">
        <div className="topbar">
          {/* Logo */}
          <div className="brand-block" onClick={() => void navigate("/")}>
            <div className="brand-mark">
              <Navigation size={14} className="text-white" />
            </div>
            <span className="brand-name">Traveler</span>
          </div>

          {/* Actions */}
          <div className="header-actions">
            <div className="hidden items-center gap-1.5 text-[12px] text-muted lg:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  serviceStatus === "online"
                    ? "bg-[#0F9960]"
                    : serviceStatus === "offline"
                      ? "bg-[#E5484D]"
                      : "bg-[#E8A33D]"
                }`}
              />
              {serviceStatus === "online"
                ? `연결됨 · DB ${redisStatus === "connected" ? "정상" : "미연결"}`
                : serviceStatus === "offline"
                  ? "서버 연결 안 됨"
                  : "연결 확인 중"}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm hidden md:inline-flex"
              onClick={() => void navigate("/results")}
            >
              내 코스
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void navigate("/planner")}
            >
              코스 만들기
            </button>
          </div>
        </div>
      </header>

      {/* ── Pages ── */}
      <main className="page-wrap">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                onStart={handleQuickStart}
                onOpenPlanner={handleOpenPlanner}
              />
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingPage
                initialSelections={onboardingSelections}
                onComplete={handleOnboardingComplete}
              />
            }
          />
          <Route
            path="/planner"
            element={
              <ChatPlannerPage
                selectedMode={selectedMode}
                composer={composer}
                onComposerChange={updateComposer}
                companionOptions={COMPANION_OPTIONS}
                paceOptions={PACE_OPTIONS}
                onSubmit={handleGenerate}
                onReset={() => void handleReset()}
                isStreaming={isStreaming}
                error={combinedError}
                messages={messages}
                places={places}
                followUpDraft={refineDraft}
                onFollowUpDraftChange={setRefineDraft}
                onFollowUpSubmit={handleRefineSubmit}
                onConfirm={() => void navigate("/course/demo")}
                autoStartToken={autoStartToken}
              />
            }
          />
          <Route path="/results" element={<Navigate to="/course/demo" replace />} />
          <Route
            path="/course/:courseId"
            element={
              <ResultsPage
                title={`${currentModeMeta.title} 추천 코스`}
                subtitle=""
                description=""
                notes={[]}
                selectedMode={selectedMode}
                places={places}
                onSaveVisited={() => saveVisitedPlaces(places)}
                canSaveVisited={canSaveVisited}
                isSavingVisited={isSavingVisited}
                onNavigatePlanner={() => void navigate("/planner")}
                sessionId={sessionId}
                messages={messages}
                preferences={prefs}
                chatDraft={refineDraft}
                onChatDraftChange={setRefineDraft}
                onChatSubmit={handleRefineSubmit}
                isStreaming={isStreaming}
                chatError={combinedError}
                onRegenerate={handleRegenerate}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between md:px-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="brand-mark">
                <Navigation size={14} className="text-white" />
              </div>
              <span className="brand-name">Traveler</span>
            </div>
            <p className="max-w-[260px] text-[13px] leading-[1.6] text-muted">
              조건을 고르면 이동 순서까지 갖춘 국내 여행 코스를 만들어 드립니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-[13px] sm:grid-cols-3">
            {[
              { title: "서비스", items: ["코스 만들기", "내 코스", "일정 다듬기"] },
              { title: "안내", items: ["서비스 소개", "이용 방법", "자주 묻는 질문"] },
              { title: "고객지원", items: ["문의하기", "피드백"] },
            ].map(({ title, items }) => (
              <div key={title}>
                <p className="mb-2.5 font-semibold text-ink">{title}</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <p key={item} className="cursor-pointer text-muted transition-colors hover:text-ink">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-2 px-5 py-5 text-[12px] text-muted md:flex-row md:justify-between md:px-6">
            <p>© 2026 Traveler</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-ink">개인정보처리방침</span>
              <span className="cursor-pointer hover:text-ink">이용약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
