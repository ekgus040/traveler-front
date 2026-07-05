import { ArrowRight, CloudSun, RefreshCw } from "lucide-react";
import type { ModeSelectorOption } from "./ModeSelector";
import type { SelectFieldOption } from "../fields/SelectField";
import TextField from "../fields/TextField";

type RecommendationFormProps = {
  modes: ModeSelectorOption[];
  selectedMode: string;
  onModeChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  weather: string;
  onWeatherChange: (value: string) => void;
  weatherOptions: SelectFieldOption[];
  companion: string;
  onCompanionChange: (value: string) => void;
  companionOptions: SelectFieldOption[];
  pace: string;
  onPaceChange: (value: string) => void;
  paceOptions: SelectFieldOption[];
  mood: string;
  onMoodChange: (value: string) => void;
  moodOptions: SelectFieldOption[];
  startPoint?: string;
  onStartPointChange?: (value: string) => void;
  endPoint?: string;
  onEndPointChange?: (value: string) => void;
  showRouteFields?: boolean;
  submitLabel?: string;
  onSubmit: () => void;
  onReset?: () => void;
  isSubmitting?: boolean;
  visitedCount?: number;
};

export function RecommendationForm({
  modes,
  selectedMode,
  onModeChange,
  query,
  onQueryChange,
  weather,
  onWeatherChange,
  weatherOptions,
  companion,
  onCompanionChange,
  companionOptions,
  pace,
  onPaceChange,
  paceOptions,
  mood,
  onMoodChange,
  moodOptions,
  startPoint = "",
  onStartPointChange,
  endPoint = "",
  onEndPointChange,
  showRouteFields = false,
  submitLabel = "추천 코스 받기",
  onSubmit,
  onReset,
  isSubmitting = false,
  visitedCount,
}: RecommendationFormProps) {
  const tripBriefs = [
    "비 오는 날에도 이동 부담이 적은 실내 중심 코스",
    "아이와 함께 쉬엄쉬엄, 식사와 휴식이 섞인 하루",
    "카페, 산책, 전망 포인트를 한 흐름으로 묶는 당일형",
  ];

  return (
    <div className="space-y-7">
      {/* Travel Mode */}
      <div>
        <label className="field-label">여행 방식</label>
        <div className="grid grid-cols-3 gap-2.5">
          {modes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onModeChange(mode.value)}
              className={`rounded-[10px] border px-3 py-3 text-left transition-colors ${
                selectedMode === mode.value
                  ? "border-[#1C2B4A] bg-[#1C2B4A] text-white"
                  : "border-[#E8E4DC] bg-[#F9F7F2] hover:border-[#1C2B4A]"
              }`}
            >
              <span className={`block text-[13px] font-semibold ${selectedMode === mode.value ? "text-white" : "text-[#1C2B4A]"}`}>
                {mode.title}
              </span>
              <span className={`mt-0.5 block text-[11px] ${selectedMode === mode.value ? "text-white/65" : "text-[#9CA3AF]"}`}>
                {mode.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query */}
      <div>
        <label className="field-label">어떤 여행을 원하세요?</label>
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="예: 조용한 바다 근처에서 커피 마시며 쉬고 싶어요. 이동이 너무 많지 않으면 좋겠어요."
          className="form-textarea h-[108px]"
        />
        <p className="mt-1.5 text-[11px] text-[#B8B5B0]">자유롭게 적어주세요. 키워드만 입력해도 괜찮아요.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tripBriefs.map((brief) => (
            <button
              key={brief}
              type="button"
              onClick={() => onQueryChange(brief)}
              className="rounded-full border border-[#E8E4DC] bg-white px-3 py-1.5 text-left text-[12px] text-[#4A5568] transition-colors hover:border-[#2D9C8C] hover:text-[#2D9C8C]"
            >
              {brief}
            </button>
          ))}
        </div>
      </div>

      {/* Live context & Companion */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="field-label">실시간 여행 컨텍스트</label>
          <div className="rounded-[10px] border border-[#B9E0DA] bg-[#EBF6F4] p-4">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#2D9C8C]">
              <CloudSun size={16} /> 날씨·계절 자동 반영
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#4A716C]">
              출발 위치와 날짜를 기준으로 실내외 비중과 축제 정보를 자동 조정합니다.
            </p>
          </div>
        </div>
        <div>
          <label className="field-label">동행자</label>
          <div className="flex flex-col gap-2">
            {companionOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onCompanionChange(value)}
                className={`rounded-[8px] border px-3 py-2.5 text-left text-[13px] transition-colors ${
                  companion === value
                    ? "border-[#2D9C8C] bg-[#EBF6F4] font-semibold text-[#2D9C8C]"
                    : "border-[#E8E4DC] bg-[#F9F7F2] text-[#4A5568] hover:border-[#2D9C8C]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pace */}
      <div>
        <label className="field-label">이동 템포</label>
        <div className="grid grid-cols-3 gap-2.5">
          {paceOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onPaceChange(value)}
              className={`rounded-[8px] border py-2.5 text-[13px] font-medium transition-colors ${
                pace === value
                  ? "border-[#1C2B4A] bg-[#1C2B4A] text-white"
                  : "border-[#E8E4DC] bg-[#F9F7F2] text-[#4A5568] hover:border-[#1C2B4A]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="field-label">
          분위기 <span className="font-normal text-[#9CA3AF]">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onMoodChange(value)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                mood === value
                  ? "border-[#F07A3B] bg-[#F07A3B] text-white"
                  : "border-[#E8E4DC] bg-[#F9F7F2] text-[#4A5568] hover:border-[#F07A3B]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Route fields (longdist) */}
      {showRouteFields && (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="출발지"
            value={startPoint}
            onChange={onStartPointChange ?? (() => undefined)}
            placeholder="예: 서울 잠실"
          />
          <TextField
            label="도착지"
            value={endPoint}
            onChange={onEndPointChange ?? (() => undefined)}
            placeholder="예: 강릉 안목해변"
          />
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#F07A3B] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#E06928] disabled:opacity-60"
        >
          {isSubmitting ? "추천 생성 중..." : submitLabel}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-[10px] bg-[#F0EDE8] px-4 py-3.5 text-[14px] font-medium text-[#6B7280] transition-colors hover:bg-[#E8E4DC]"
          >
            <RefreshCw size={14} />
            새로 시작
          </button>
        )}
      </div>

      {/* Session info */}
      {typeof visitedCount === "number" && (
        <div className="rounded-[10px] border border-[#E8E4DC] bg-[#F9F7F2] p-3 text-[12px] text-[#9CA3AF]">
          저장된 방문 기록: <strong className="text-[#1C2B4A]">{visitedCount}개</strong> · 추천 생성 후 결과와 대화에 같은 세션이 이어집니다
        </div>
      )}
    </div>
  );
}

export default RecommendationForm;
