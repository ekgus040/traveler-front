import { ArrowRight, ChevronRight, Navigation, RefreshCw, Sparkles, Star } from "lucide-react";
import type { TravelMode } from "../types/domain";

type OverviewPageProps = {
  selectedMode: TravelMode;
  streamStatusLabel: string;
  visitedCount: number;
  summaryTags: string[];
  onNavigatePlanner: () => void;
  onSelectMode: (mode: TravelMode) => void;
};

const destinations: Array<{ mode: TravelMode; title: string; desc: string; img: string; tag: string }> = [
  { mode: "nearby", title: "근교 드라이브", desc: "집에서 1~2시간, 숨은 카페와 계절 명소", img: "photo-1476514525535-07fb3b4ae5f1", tag: "당일 귀가" },
  { mode: "longdist", title: "자차 장거리", desc: "경로 위 휴식부터 목적지 현지 코스까지", img: "photo-1464822759023-fed622ff2c3b", tag: "경유 최적화" },
  { mode: "remote", title: "타지 렌터카", desc: "대표 명소와 로컬 스팟을 날짜별로", img: "photo-1501339847302-ac426a4a7cbb", tag: "초행 맞춤" },
];

const features = [
  {
    icon: <Star size={20} className="text-[#2D9C8C]" />,
    title: "대표 명소 + 숨은 장소를 함께",
    desc: "누구나 아는 대표 명소는 물론, 현지인만 아는 숨은 스팟까지 함께 담아요.",
  },
  {
    icon: <Navigation size={20} className="text-[#2D9C8C]" />,
    title: "이동 흐름까지 고려한 코스",
    desc: "거리와 이동 시간을 계산해, 무리 없이 돌아볼 수 있는 코스로 구성해요.",
  },
  {
    icon: <RefreshCw size={20} className="text-[#2D9C8C]" />,
    title: "결과를 내 마음대로 다듬어요",
    desc: "마음에 안 드는 장소는 빼고, 원하는 곳을 추가해서 나만의 코스를 완성해요.",
  },
];

const steps = [
  { num: "01", title: "여행 조건 정하기", desc: "날씨, 동행자, 원하는 분위기를 알려주세요. 자유롭게 글로 적어도 괜찮아요." },
  { num: "02", title: "추천 코스 비교하기", desc: "조건에 맞는 코스들을 확인하고, 지도와 함께 한눈에 살펴봐요." },
  { num: "03", title: "일정 다듬기", desc: "추천받은 코스에서 내 취향대로 장소를 바꾸거나 순서를 조정해요." },
];

export function OverviewPage({
  streamStatusLabel,
  visitedCount,
  onNavigatePlanner,
  onSelectMode,
}: OverviewPageProps) {
  return (
    <div className="-mt-10 -mx-6">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[580px] items-center overflow-hidden bg-[#0F1E38]">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop&auto=format"
          alt="국내 여행"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/85 via-[#0A1628]/60 to-[#0A1628]/20" />
        <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24">
          <div className="max-w-[580px]">
            <h1 className="mb-5 text-[46px] font-bold leading-[1.22] tracking-tight text-white">
              출발부터 귀가까지,<br />대화 한 번으로 완성하세요.
            </h1>
            <p className="mb-8 text-[16px] leading-[1.8] text-white/75">
              세 가지 드라이브 모드와 AI 큐레이션으로 날씨·계절·방문 이력까지 반영한<br />
              나만의 실행 가능한 여행 코스를 만듭니다.
            </p>

            <button
              onClick={onNavigatePlanner}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#F07A3B] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-[#E06928]"
            >
              AI에게 코스 요청하기
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {/* <div className="absolute bottom-0 left-0 right-0 border-t border-white/12 bg-white/8 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1200px] items-center gap-8 overflow-x-auto px-6 py-4">
            {[
              { num: streamStatusLabel, label: "현재 추천 상태" },
              { num: "3,200+", label: "국내 여행지" },
              { num: `${visitedCount}개`, label: "저장된 방문 기록" },
              { num: "매일 업데이트", label: "새 코스 추가" },
            ].map(({ num, label }) => (
              <div key={label} className="flex shrink-0 items-center gap-2.5">
                <span className="text-[15px] font-bold text-white">{num}</span>
                <span className="text-[12px] text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </div> */}
      </section>

      <div className="mx-auto max-w-[1200px] px-6">
        {/* ── Destination Cards ── */}
        <section className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="mb-1.5 text-[26px] font-bold text-[#1C2B4A]">오늘의 드라이브 모드를 선택하세요</h2>
              <p className="text-[14px] text-[#6B7280]">여행 방식에 따라 검색 전략과 코스 구성이 달라집니다.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {destinations.map((d) => (
              <button
                key={d.title}
                onClick={() => onSelectMode(d.mode)}
                className="group relative overflow-hidden rounded-[14px] border border-[#F0EDE8] bg-white text-left shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative h-[160px] overflow-hidden bg-[#E8E4DC]">
                  <img
                    src={`https://images.unsplash.com/${d.img}?w=600&h=400&fit=crop&auto=format`}
                    alt={d.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1C2B4A]">
                    {d.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-[15px] font-bold text-[#1C2B4A]">{d.title}</h3>
                  <p className="text-[12px] text-[#6B7280]">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Features ── */}
      <section className="bg-[#1C2B4A] py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-[26px] font-bold text-white">Traveler만의 추천 방식</h2>
            <p className="text-[14px] text-white/55">단순 검색이 아닌, 진짜 여행 경험을 위한 추천</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[14px] border border-white/10 p-6"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: "rgba(45,156,140,0.18)" }}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-white">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6">
        {/* ── How it works ── */}
        <section className="py-16">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-[26px] font-bold text-[#1C2B4A]">여행 추천, 이렇게 사용해요</h2>
            <p className="text-[14px] text-[#6B7280]">세 단계만 따라가면 나만의 여행 코스 완성</p>
          </div>
          <div className="relative grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="relative rounded-[14px] border border-[#F0EDE8] bg-white p-6 shadow-sm"
              >
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-[52px] z-10 hidden translate-x-1/2 md:block">
                    <ChevronRight size={18} className="text-[#C8C5BF]" />
                  </div>
                )}
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(240,122,59,0.1)" }}
                >
                  <span className="text-[13px] font-bold text-[#F07A3B]">{s.num}</span>
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-[#1C2B4A]">{s.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#6B7280]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={onNavigatePlanner}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#1C2B4A] px-8 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#253860]"
            >
              지금 바로 시작하기
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="pb-16">
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[20px] bg-[#2D9C8C] p-10 md:flex-row">
            <div
              className="absolute right-0 top-0 h-[200px] w-[300px] rounded-bl-full opacity-20"
              style={{ backgroundColor: "#1C2B4A" }}
            />
            <div className="relative z-10">
              <p className="mb-2 text-[13px] font-medium text-white/80">지금 바로 시작해보세요</p>
              <h2 className="text-[24px] font-bold leading-tight text-white">
                막막한 여행 계획,<br />Traveler와 함께라면 쉬워요
              </h2>
            </div>
            <button
              onClick={onNavigatePlanner}
              className="relative z-10 shrink-0 rounded-[10px] bg-white px-7 py-3.5 text-[15px] font-bold text-[#2D9C8C] shadow-md transition-colors hover:bg-[#F9F7F2]"
            >
              무료로 추천받기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OverviewPage;
