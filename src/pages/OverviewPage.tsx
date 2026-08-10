import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
import Navigation from "lucide-react/dist/esm/icons/navigation.mjs";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import Star from "lucide-react/dist/esm/icons/star.mjs";
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
    icon: <Star size={20} />,
    iconClass: "bg-gradient-to-br from-[#FFE8D6] to-[#FFC09F] text-[#FF6B6B]",
    title: "Explore",
    desc: "대표 명소와 로컬 스팟을 함께 묶어 나만의 장소 큐레이션을 만듭니다.",
  },
  {
    icon: <Navigation size={20} />,
    iconClass: "bg-gradient-to-br from-[#FFE8D6] to-[#FFC09F] text-[#FF6B6B]",
    title: "Drive",
    desc: "출발부터 귀가까지 이동 흐름을 기준으로 실제 움직일 수 있는 코스를 구성합니다.",
  },
  {
    icon: <RefreshCw size={20} />,
    iconClass: "bg-gradient-to-br from-[#FFE8D6] to-[#FFC09F] text-[#FF6B6B]",
    title: "Plan",
    desc: "한 번의 대화 안에서 조건을 반영하고, 추천 이유까지 확인하며 일정을 완성합니다.",
  },
];

const steps = [
  { num: "01", title: "평소 말투로 요청", desc: "예: 오늘 춘천 드라이브 코스 추천해줘. 목적지만 말해도 됩니다." },
  { num: "02", title: "AI가 코스 생성", desc: "날씨, 방문 이력, 동행자, 여행 모드를 함께 보고 장소를 고릅니다." },
  { num: "03", title: "지도와 근거 확인", desc: "추천 장소, 경로, 왜 골랐는지를 한 화면에서 확인합니다." },
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
      <section className="relative flex min-h-[580px] items-center overflow-hidden bg-gradient-to-br from-[#FFF6EC] via-[#FFE8D6] to-[#DDF5F1]">
        <div className="absolute -left-24 -top-32 h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(255,217,61,.55),rgba(255,123,89,.12)_48%,transparent_70%)]" />
        <div className="absolute right-[8%] top-[14%] h-44 w-64 rounded-full bg-white/55 blur-[2px]" />
        <div className="absolute bottom-12 right-[10%] text-[150px] opacity-80 drop-shadow-[0_20px_30px_rgba(45,52,54,.15)]">🚗</div>
        <svg className="absolute bottom-0 left-0 h-32 w-full opacity-50" viewBox="0 0 1200 130" preserveAspectRatio="none">
          <path d="M0 95 Q260 55 530 100 T1200 72" fill="none" stroke="#FF7B59" strokeWidth="3" strokeDasharray="14 12" />
        </svg>
        <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24">
          <div className="max-w-[580px]">
            <span className="mb-5 inline-flex rounded-full bg-white/75 px-4 py-2 text-[12px] font-bold text-[#FF7B59] shadow-sm">Drive · Plan · Explore</span>
            <h1 className="mb-5 text-[48px] font-extrabold leading-[1.15] tracking-[-0.04em] text-[#2D3436] md:text-[62px]">
              이동과 여행을 하나로.<br /><span className="text-[#FF7B59]">검색하지 않아도 완성되는 코스.</span>
            </h1>
            <p className="mb-8 text-[16px] leading-[1.8] text-[#4A5658]">
              세 가지 드라이브 모드와 AI 큐레이션으로 출발부터 귀가까지,<br />
              날씨·방문 이력·취향을 반영한 나만의 여행 코스를 만듭니다.
            </p>

            <button
              onClick={onNavigatePlanner}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7B59] to-[#FF6B6B] px-7 py-4 text-[15px] font-bold text-white shadow-[0_14px_32px_rgba(255,123,89,.3)] transition-transform hover:-translate-y-0.5"
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
              <h2 className="mb-1.5 text-[26px] font-bold text-[#1C2B4A]">어떤 드라이브인가요?</h2>
              <p className="text-[14px] text-[#6B7280]">근교, 장거리, 렌터카에 따라 추천 기준과 코스 흐름이 달라집니다.</p>
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
      <section className="border-y border-[#2D3436]/[0.05] bg-gradient-to-br from-white/80 via-[#FFF6EC] to-[#FFE8D6]/75 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex rounded-full bg-[#FFE8D6] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#FF7B59]">Why Traveler</span>
            <h2 className="mb-2 text-[28px] font-extrabold text-[#2D3436]">Traveler만의 추천 방식</h2>
            <p className="text-[14px] text-[#828F92]">이동과 여행을 하나로 묶는 AI 트래블 큐레이션</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[24px] border border-white/80 bg-white/85 p-7 shadow-[0_12px_36px_rgba(85,61,45,.07)] transition-transform hover:-translate-y-1"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${f.iconClass}`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-[16px] font-extrabold text-[#2D3436]">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#6F7B7D]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-6">
        {/* ── How it works ── */}
        <section className="py-16">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-[26px] font-bold text-[#1C2B4A]">한 번의 대화로 끝내요</h2>
            <p className="text-[14px] text-[#6B7280]">검색, 비교, 동선 조정을 Traveler가 대신 정리합니다.</p>
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
          <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFB088] via-[#FF8A65] to-[#FF6B6B] p-10 shadow-[0_20px_50px_rgba(255,123,89,.22)] md:flex-row">
            <div
              className="absolute -right-16 -top-24 h-[260px] w-[260px] rounded-full bg-[#FFD93D]/30"
            />
            <div className="absolute bottom-[-34px] right-[28%] text-[110px] opacity-20">🚗</div>
            <div className="relative z-10">
              <p className="mb-2 text-[13px] font-medium text-white/80">지금 바로 시작해보세요</p>
              <h2 className="text-[24px] font-bold leading-tight text-white">
              막막한 여행 계획,<br />Traveler가 바로 코스로 바꿔드려요
              </h2>
            </div>
            <button
              onClick={onNavigatePlanner}
              className="relative z-10 shrink-0 rounded-full bg-white px-7 py-3.5 text-[15px] font-extrabold text-[#FF6B6B] shadow-[0_10px_28px_rgba(87,45,34,.16)] transition-transform hover:-translate-y-0.5"
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
