import Check from "lucide-react/dist/esm/icons/check.mjs";
import CloudSun from "lucide-react/dist/esm/icons/cloud-sun.mjs";
import Database from "lucide-react/dist/esm/icons/database.mjs";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle.mjs";
import Map from "lucide-react/dist/esm/icons/map.mjs";
import Route from "lucide-react/dist/esm/icons/route.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import { useEffect, useState } from "react";
import type { TravelMode } from "../types/domain";

type GeneratingPageProps = {
  mode: TravelMode;
  isStreaming: boolean;
  error: string | null;
  onComplete: () => void;
  onBack: () => void;
};

const modeLabels: Record<TravelMode, string> = {
  nearby: "근교 드라이브",
  longdist: "자차 장거리",
  remote: "타지 렌터카",
};

const steps = [
  { icon: Sparkles, title: "요청 분석", copy: "여행 의도와 동행·분위기를 이해하고 있어요." },
  { icon: CloudSun, title: "상황 조회", copy: "현재 날씨와 방문 이력을 확인하고 있어요." },
  { icon: Database, title: "코스 생성", copy: "GPT가 조건에 맞는 드라이브 코스를 만들고 있어요." },
  { icon: Route, title: "일정 정리", copy: "장소 순서와 체류 흐름을 정리하고 있어요." },
];

export function GeneratingPage({ mode, isStreaming, error, onComplete, onBack }: GeneratingPageProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isStreaming || error) return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, 900);
    return () => window.clearInterval(timer);
  }, [error, isStreaming]);

  useEffect(() => {
    if (isStreaming || error) return;
    const timer = window.setTimeout(onComplete, 500);
    return () => window.clearTimeout(timer);
  }, [error, isStreaming, onComplete]);

  return (
    <section className="mx-auto w-full max-w-[760px] py-12">
      <div className="mb-8 text-center">
        <span className="badge badge-secondary">{modeLabels[mode]}</span>
        <h1 className="mt-4 text-[32px] font-bold tracking-tight text-[#1C2B4A]">
          오늘의 드라이브 코스를 만들고 있어요
        </h1>
        <p className="mt-3 text-[14px] text-[#6B7280]">
          검색 결과를 나열하지 않고, 출발부터 귀가까지 실행 가능한 하나의 일정으로 정리합니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_18px_50px_rgba(255,123,89,.12)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FFB088] via-[#FF8A65] to-[#FF6B6B] px-7 py-10 text-center text-white">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #FFD93D 0, transparent 55%)" }} />
          <div className="relative mx-auto mb-5 h-20 w-20">
            <div className="absolute inset-0 rounded-full border border-white/15" />
            <div className="absolute inset-0 animate-ping rounded-full border border-white/40" />
            <LoaderCircle className="absolute inset-2 h-16 w-16 animate-spin text-white" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>
          <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">Now processing</p>
          <p className="relative mt-2 text-[18px] font-bold">{steps[activeStep].title}</p>
          <p className="relative mt-1 text-[12px] text-white/60">{steps[activeStep].copy}</p>
          <div className="relative mx-auto mt-6 h-1 max-w-[360px] overflow-hidden rounded-full bg-white/10">
            <div className="traveler-loading-bar h-full w-1/3 rounded-full bg-[#F07A3B]" />
          </div>
        </div>

        <div className="grid gap-2 p-6 sm:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completed = index < activeStep || !isStreaming;
            const active = index === activeStep && isStreaming;
            return (
              <div key={step.title} className={`flex items-center gap-2 rounded-[10px] p-3 sm:flex-col sm:text-center ${active ? "bg-[#FFF0E9]" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${completed ? "bg-[#2D9C8C] text-white" : active ? "bg-[#F07A3B] text-white" : "bg-[#F0EDE8] text-[#B8B5B0]"}`}>
                  {completed ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <p className={`text-[11px] font-bold ${active ? "text-[#F07A3B]" : completed ? "text-[#2D9C8C]" : "text-[#9CA3AF]"}`}>{step.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-[13px] font-semibold text-amber-900">추천 서버에 연결하지 못했습니다.</p>
          <p className="mt-1 text-[12px] text-amber-700">{error}</p>
          <button type="button" className="btn btn-outline mt-4" onClick={onBack}>입력 화면으로 돌아가기</button>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[#6B7280]">
          <Map size={14} className="text-[#2D9C8C]" /> 방문 이력과 중복되는 장소는 자동으로 제외합니다.
        </div>
      )}
    </section>
  );
}

export default GeneratingPage;
