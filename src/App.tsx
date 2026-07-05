import { useCallback, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Navigation } from "lucide-react";
import {
  COMPANION_OPTIONS,
  DEFAULT_TRAVEL_COMPOSER,
  MOOD_OPTIONS,
  PACE_OPTIONS,
  WEATHER_OPTIONS,
  mapHighlights,
  modeCards,
  modeLabels,
} from "./data/content";
import { useRecommendationStream } from "./features/travel/hooks/useRecommendationStream";
import { useTravelSession } from "./features/travel/hooks/useTravelSession";
import GeneratingPage from "./pages/GeneratingPage";
import OnboardingPage from "./pages/OnboardingPage";
import OverviewPage from "./pages/OverviewPage";
import PlannerPage from "./pages/PlannerPage";
import ResultsPage from "./pages/ResultsPage";
import type { TravelComposerState, TravelMode } from "./types/domain";

const LONGDIST_NOTICE =
  "장거리 모드는 현재 실제 경로 계산 대신, 목적지 중심의 이동 가이드를 먼저 보여줍니다.";

const navItems = [
  { to: "/", label: "홈" },
  { to: "/planner", label: "여행 계획" },
  { to: "/course/demo", label: "추천 코스" },
];

type OnboardingSelections = Record<string, string>;

function App() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<TravelMode>("nearby");
  const [composer, setComposer] = useState<TravelComposerState>(DEFAULT_TRAVEL_COMPOSER);
  const [refineDraft, setRefineDraft] = useState("");
  const [onboardingSelections, setOnboardingSelections] = useState<OnboardingSelections>({
    companion: DEFAULT_TRAVEL_COMPOSER.companion,
    pace: DEFAULT_TRAVEL_COMPOSER.pace,
    mood: DEFAULT_TRAVEL_COMPOSER.mood,
    weather: DEFAULT_TRAVEL_COMPOSER.weather,
  });

  const {
    sessionId,
    visitedIds,
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
  const mapNotes = useMemo(() => mapHighlights[selectedMode], [selectedMode]);
  const canSaveVisited = useMemo(
    () => places.some((place) => place.sourcePlaceId),
    [places],
  );
  const combinedError = streamError ?? sessionError;

  const streamStatusLabel = combinedError
    ? "연결 이슈"
    : isStreaming
      ? "생성 중"
      : canSaveVisited
        ? "추천 준비 완료"
        : "추천 대기 중";

  const summaryTags = [
    `모드 ${modeLabels[selectedMode]}`,
    `날씨 ${WEATHER_OPTIONS.find((o) => o.value === composer.weather)?.label ?? composer.weather}`,
    `동행 ${COMPANION_OPTIONS.find((o) => o.value === composer.companion)?.label ?? composer.companion}`,
    `분위기 ${MOOD_OPTIONS.find((o) => o.value === composer.mood)?.label ?? composer.mood}`,
  ];

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

  function handleGenerate() {
    startRecommendation(composer);
    void navigate("/generating");
  }

  const handleGenerationComplete = useCallback(() => {
    void navigate("/course/demo");
  }, [navigate]);

  function handleModeStart(mode: TravelMode) {
    setSelectedMode(mode);
    void navigate("/planner");
  }

  async function handleReset() {
    await resetSession();
    resetToModeSeed();
    setRefineDraft("");
    setComposer(DEFAULT_TRAVEL_COMPOSER);
  }

  function handleRefineSubmit() {
    if (!refineDraft.trim()) return;
    const nextComposer = { ...composer, query: refineDraft.trim() };
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
              <Navigation size={15} className="text-white" />
            </div>
            <span className="brand-name">Traveler</span>
          </div>

          {/* Nav */}
          <nav className="header-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `header-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <div className="hidden items-center gap-2 text-[11px] text-[#6B7280] lg:flex">
              <span className={`h-2 w-2 rounded-full ${serviceStatus === "online" ? "bg-emerald-500" : serviceStatus === "offline" ? "bg-red-500" : "bg-amber-400"}`} />
              {serviceStatus === "online" ? `API 연결 · Redis ${redisStatus === "connected" ? "정상" : "미연결"}` : serviceStatus === "offline" ? "API 연결 안 됨" : "API 확인 중"}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm hidden md:flex"
              onClick={() => void navigate("/results")}
            >
              최근 추천
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void navigate("/planner")}
            >
              추천 시작
            </button>
          </div>
        </div>
      </header>

      {/* ── Error banner ── */}
      {combinedError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
          <strong>백엔드 연결 불안정:</strong> 추천 요청이 실패할 수 있습니다.
        </div>
      ) : null}

      {/* ── Pages ── */}
      <main className="page-wrap">
        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                selectedMode={selectedMode}
                streamStatusLabel={streamStatusLabel}
                visitedCount={visitedIds.length}
                summaryTags={summaryTags}
                onNavigatePlanner={() => void navigate("/planner")}
                onSelectMode={handleModeStart}
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
              <PlannerPage
                modes={modeCards.map((mode) => ({
                  value: mode.id,
                  emoji: mode.emoji,
                  title: mode.title,
                  subtitle: mode.subtitle,
                  description: mode.description,
                }))}
                selectedMode={selectedMode}
                onModeChange={handleModeChange}
                composer={composer}
                onComposerChange={updateComposer}
                weatherOptions={WEATHER_OPTIONS}
                companionOptions={COMPANION_OPTIONS}
                paceOptions={PACE_OPTIONS}
                moodOptions={MOOD_OPTIONS}
                showRouteFields={selectedMode === "longdist"}
                onSubmit={handleGenerate}
                onReset={() => void handleReset()}
                isSubmitting={isStreaming}
                visitedCount={visitedIds.length}
                preferences={prefs}
              />
            }
          />
          <Route
            path="/generating"
            element={
              <GeneratingPage
                mode={selectedMode}
                isStreaming={isStreaming}
                error={streamError}
                onComplete={handleGenerationComplete}
                onBack={() => void navigate("/planner")}
              />
            }
          />
          <Route path="/results" element={<Navigate to="/course/demo" replace />} />
          <Route
            path="/course/:courseId"
            element={
              <ResultsPage
                title={`${currentModeMeta.title} 추천 코스`}
                subtitle={currentModeMeta.subtitle}
                description={
                  selectedMode === "longdist" ? LONGDIST_NOTICE : currentModeMeta.description
                }
                notes={mapNotes}
                selectedMode={selectedMode}
                places={places}
                visitedIds={visitedIds}
                onSaveVisited={() => void saveVisitedPlaces(places)}
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
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-20 bg-[#1C2B4A] py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-8 flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-white/12">
                  <Navigation size={13} className="text-white" />
                </div>
                <span className="text-[16px] font-bold text-white">Traveler</span>
              </div>
              <p className="max-w-[220px] text-[13px] leading-relaxed text-white/50">
                취향과 분위기로 찾는 국내 여행 추천 플랫폼
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 text-[13px]">
              {[
                { title: "서비스", items: ["여행 계획", "추천 코스", "일정 다듬기", "여행 타입"] },
                { title: "안내", items: ["서비스 소개", "이용 방법", "자주 묻는 질문"] },
                { title: "고객지원", items: ["문의하기", "피드백", "공지사항"] },
              ].map(({ title, items }) => (
                <div key={title}>
                  <p className="mb-3 font-bold text-white">{title}</p>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <p key={item} className="cursor-pointer text-white/50 transition-colors hover:text-white/80">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-[12px] text-white/30 md:flex-row">
            <p>© 2026 Traveler. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white/60">개인정보처리방침</span>
              <span className="cursor-pointer hover:text-white/60">이용약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
