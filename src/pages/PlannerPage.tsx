import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
import RecommendationForm from "../components/travel/RecommendationForm";
import type { TravelComposerState } from "../types/domain";
import type { ModeSelectorOption } from "../components/travel/ModeSelector";
import type { SelectFieldOption } from "../components/fields/SelectField";

type PlannerPageProps = {
  modes: ModeSelectorOption[];
  selectedMode: string;
  onModeChange: (value: string) => void;
  composer: TravelComposerState;
  onComposerChange: <K extends keyof TravelComposerState>(key: K, value: TravelComposerState[K]) => void;
  weatherOptions: SelectFieldOption[];
  companionOptions: SelectFieldOption[];
  paceOptions: SelectFieldOption[];
  moodOptions: SelectFieldOption[];
  showRouteFields: boolean;
  onSubmit: () => void;
  onReset: () => void;
  isSubmitting: boolean;
  visitedCount: number;
  preferences: Record<string, string>;
};

export function PlannerPage({
  modes,
  selectedMode,
  onModeChange,
  composer,
  onComposerChange,
  weatherOptions,
  companionOptions,
  paceOptions,
  moodOptions,
  showRouteFields,
  onSubmit,
  onReset,
  isSubmitting,
  visitedCount,
  preferences,
}: PlannerPageProps) {
  return (
    <section>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link">홈</span>
        <ChevronRight size={12} />
        <span className="breadcrumb-current">여행 계획</span>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[1fr_400px]">
        {/* ── Left: Form ── */}
        <div className="rounded-[24px] border border-white/80 bg-white/90 p-8 shadow-[0_12px_40px_rgba(85,61,45,.07)]">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF7B59]">Talk to Traveler</p>
          <h1 className="mb-1.5 text-[28px] font-extrabold leading-tight text-[#2D3436]">
            평소 말투 그대로, 그냥 던지세요.
          </h1>
          <p className="mb-8 text-[14px] text-[#6B7280]">
            취향과 조건을 알려주시면 맞춤 코스를 추천해 드려요
          </p>

          <RecommendationForm
            modes={modes}
            selectedMode={selectedMode}
            onModeChange={onModeChange}
            query={composer.query}
            onQueryChange={(value) => onComposerChange("query", value)}
            weather={composer.weather}
            onWeatherChange={(value) => onComposerChange("weather", value)}
            weatherOptions={weatherOptions}
            companion={composer.companion}
            onCompanionChange={(value) => onComposerChange("companion", value)}
            companionOptions={companionOptions}
            pace={composer.pace}
            onPaceChange={(value) => onComposerChange("pace", value)}
            paceOptions={paceOptions}
            mood={composer.mood}
            onMoodChange={(value) => onComposerChange("mood", value)}
            moodOptions={moodOptions}
            startPoint={composer.startPoint}
            onStartPointChange={(value) => onComposerChange("startPoint", value)}
            endPoint={composer.endPoint}
            onEndPointChange={(value) => onComposerChange("endPoint", value)}
            showRouteFields={showRouteFields}
            onSubmit={onSubmit}
            onReset={onReset}
            isSubmitting={isSubmitting}
            visitedCount={visitedCount}
          />
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex flex-col gap-4">
          {/* Sample preview card */}
          <div className="overflow-hidden rounded-[18px] border border-[#F0EDE8] bg-white shadow-sm">
            <div className="relative h-[175px] bg-[#E8E4DC]">
              <img
                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop&auto=format"
                alt="추천 코스 예시"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/65 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-[#2D9C8C] px-2.5 py-1 text-[10px] font-semibold text-white">
                  예시 코스
                </span>
                <p className="mt-1 text-[16px] font-bold text-white">강릉 바다 당일 코스</p>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4 flex flex-wrap gap-1.5">
                {["근교 당일형", "바다 전망", "커플 추천"].map((tag) => (
                  <span key={tag} className="rounded-full bg-[#EBF6F4] px-2.5 py-0.5 text-[11px] font-semibold text-[#2D9C8C]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  { time: "10:00", place: "안목해변 커피거리" },
                  { time: "12:00", place: "주문진 수산시장" },
                  { time: "14:30", place: "경포호수 산책로" },
                  { time: "16:30", place: "테라로사 커피공장" },
                ].map((item) => (
                  <div key={item.time} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-[11px] font-bold text-[#9CA3AF]">{item.time}</span>
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9C8C]" />
                    <span className="text-[13px] text-[#4A5568]">{item.place}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-[#F0EDE8] pt-4 text-[12px] text-[#9CA3AF]">
                조건을 입력하면 이런 형태의 코스가 추천돼요
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-[16px] border border-[#F0EDE8] bg-[#F9F7F2] p-5">
            <h3 className="mb-4 text-[14px] font-bold text-[#1C2B4A]">어떻게 추천하나요?</h3>
            <div className="space-y-3.5">
              {[
                { color: "#F07A3B", text: "대표 명소 + 현지인 숨은 장소를 섞어서 구성해요" },
                { color: "#2D9C8C", text: "이동 동선과 시간을 계산해 무리 없는 코스를 만들어요" },
                { color: "#E85D8A", text: "취향과 분위기에 꼭 맞는 장소만 선별해서 담아요" },
              ].map(({ color, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-white shadow-sm"
                    style={{ color }}
                  >
                    <span className="text-[11px] font-bold">{i + 1}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#4A5568]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-[16px] bg-[#1C2B4A] p-5 text-white">
            <p className="mb-1 text-[12px] text-white/60">저장된 방문 기록</p>
            <p className="text-[30px] font-bold tracking-tight">{visitedCount}개</p>
            <p className="mt-1 text-[12px] text-white/45">
              추천 결과를 저장하면 이후에 이어서 활용할 수 있어요
            </p>
            {Object.keys(preferences).length > 0 ? (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-2 text-[11px] text-white/45">AI가 기억한 취향</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(preferences).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80">{value}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlannerPage;
