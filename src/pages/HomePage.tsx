import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Car from "lucide-react/dist/esm/icons/car.mjs";
import MapPin from "lucide-react/dist/esm/icons/map-pin.mjs";
import Route from "lucide-react/dist/esm/icons/route.mjs";
import Search from "lucide-react/dist/esm/icons/search.mjs";
import { useState } from "react";
import { modeLabels } from "../data/content";
import type { TravelMode } from "../types/domain";

type HomePageProps = {
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
  /** 목적지/요청 문장을 그대로 넘겨 바로 추천을 시작한다. */
  onStart: (mode: TravelMode, query: string, route?: { startPoint: string; endPoint: string }) => void;
  /** 옵션을 하나씩 고르며 만들고 싶을 때 */
  onOpenPlanner: (mode: TravelMode) => void;
};

const MODES: Array<{
  id: TravelMode;
  icon: typeof Car;
  desc: string;
  meta: string;
  placeholder: string;
}> = [
  {
    id: "nearby",
    icon: Car,
    desc: "집에서 1~2시간 거리, 당일 귀가",
    meta: "이동 40분 내외 · 주차·날씨 우선",
    placeholder: "예: 춘천 쪽으로 조용한 카페 코스",
  },
  {
    id: "longdist",
    icon: Route,
    desc: "출발지·목적지를 잇는 경유 설계",
    meta: "휴게소·식사 지점 포함",
    placeholder: "예: 서울에서 강릉 가는 길에 들를 곳",
  },
  {
    id: "remote",
    icon: MapPin,
    desc: "초행 지역의 대표 명소 + 로컬 스팟",
    meta: "날짜별 렌터카 동선",
    placeholder: "예: 경주 1박 2일 렌터카 코스",
  },
];

/**
 * 실제 배포 백엔드로 지역별 결과를 돌려보고, 장소가 3곳 이상 나오고
 * 좌표·카테고리가 그 지역과 맞는 조합만 남긴 목록이다 (2026-09-07 실측).
 * - 제외: 경주(반경 안에 음식점만 색인돼 있어 유적지를 요청해도 전부 FD)
 * - 제외: 속초(지역명 좌표 사전에 없어 기본 좌표로 폴백), 춘천(후보 1곳)
 * 문구를 바꾸면 결과가 달라지므로, 수정 시 반드시 다시 실측할 것.
 */
const QUICK_STARTS: Array<{ label: string; mode: TravelMode; query: string }> = [
  { label: "강릉 해변", mode: "remote", query: "강릉 해변과 경포호 명소 코스" },
  { label: "부산 야경", mode: "remote", query: "부산 바다와 도시 야경을 함께 보는 코스" },
  { label: "제주 해안", mode: "remote", query: "제주 자연 명소와 바다 코스" },
  // 전주는 remote(타지 렌터카)로 보내면 지역 인식이 안 돼 경기도 결과가 나온다.
  // nearby 로는 경기전·부채문화관 등 전주 시내가 정확히 잡혀서 모드를 낮춰 둔다.
  { label: "전주 한옥", mode: "nearby", query: "전주 한옥마을과 주변 걷기 좋은 코스" },
  { label: "가평 근교", mode: "nearby", query: "가평 자연 명소와 강가 코스" },
];

const PRESETS: Array<{
  title: string;
  region: string;
  desc: string;
  tags: string[];
  mode: TravelMode;
  query: string;
  route?: { startPoint: string; endPoint: string };
}> = [
  {
    title: "비 오는 날 실내 코스",
    region: "수도권 근교",
    desc: "우천에도 동선이 끊기지 않는 실내 위주 장소로 구성",
    tags: ["실내", "우천", "당일"],
    mode: "nearby",
    query: "비 오는 날 갈 만한 수도권 근교 실내 위주 코스",
  },
  {
    title: "아이와 함께 하루",
    region: "근교 전역",
    desc: "체류 시간이 짧고 주차가 편한 곳 위주",
    tags: ["가족", "주차", "체험"],
    mode: "nearby",
    query: "아이와 함께 가기 좋은 근교 코스, 주차 편한 곳 위주",
  },
  {
    title: "휴게소까지 챙긴 장거리",
    region: "서울 → 강릉",
    desc: "쉬는 타이밍과 도착 후 첫 장소까지 한 번에",
    tags: ["경유", "휴게소", "식사"],
    mode: "longdist",
    query: "가는 길 휴게소와 도착 후 코스 추천",
    route: { startPoint: "서울", endPoint: "강릉" },
  },
  {
    title: "연인과 야경 코스",
    region: "타지 여행",
    desc: "해질녘부터 밤까지 이어지는 동선",
    tags: ["연인", "야경", "저녁"],
    mode: "remote",
    query: "연인과 가기 좋은 야경 중심 저녁 코스",
  },
  {
    title: "혼자 조용한 드라이브",
    region: "근교 전역",
    desc: "붐비지 않는 시간대의 한적한 장소 중심",
    tags: ["혼자", "한적", "카페"],
    mode: "nearby",
    query: "혼자 조용히 다녀오기 좋은 근교 드라이브 코스",
  },
  {
    title: "처음 가는 지역 하루",
    region: "타지 여행",
    desc: "대표 명소 1~2곳에 로컬 스팟을 섞어 실패 확률을 낮춤",
    tags: ["초행", "명소", "로컬"],
    mode: "remote",
    query: "처음 가보는 지역에서 하루 동안 돌아볼 코스",
  },
];

const CRITERIA = [
  { title: "방문 이력", desc: "이미 다녀온 장소는 다음 추천에서 제외합니다." },
  { title: "이동 흐름", desc: "장소를 나열하지 않고 실제로 움직일 수 있는 순서로 배치합니다." },
  { title: "추천 근거", desc: "각 장소를 왜 골랐는지 코스와 함께 보여줍니다." },
];

export function HomePage({ selectedMode, onSelectMode, onStart, onOpenPlanner }: HomePageProps) {
  const [query, setQuery] = useState("");
  const activeMode = MODES.find((mode) => mode.id === selectedMode) ?? MODES[0];

  function submit() {
    const trimmed = query.trim();
    if (!trimmed) {
      onOpenPlanner(selectedMode);
      return;
    }
    onStart(selectedMode, trimmed);
  }

  return (
    <div className="flex flex-col gap-14 pb-4">
      {/* ── 시작 영역 ── */}
      <section className="pt-2">
        <h1 className="text-[26px] font-bold leading-[1.35] tracking-[-0.03em] text-ink md:text-[32px]">
          어디로 떠나볼까요?
        </h1>
        <p className="mt-2 text-[15px] text-sub">
          여행 방식을 고르면 AI가 이동 순서까지 갖춘 코스를 만들어 드려요.
        </p>

        <div className="mt-6 rounded-[16px] border border-line bg-white p-4 shadow-card md:p-5">
          {/* 모드 세그먼트 */}
          <div className="segment">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`segment-item ${selectedMode === mode.id ? "is-active" : ""}`}
              >
                {modeLabels[mode.id]}
              </button>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-1.5 px-1 text-[13px] text-muted">
            <activeMode.icon size={14} className="text-brand" />
            {activeMode.desc} · {activeMode.meta}
          </p>

          {/* 입력 + 실행 */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-line px-3.5 transition-colors focus-within:border-brand">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-muted"
                value={query}
                placeholder={activeMode.placeholder}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) submit();
                }}
              />
            </div>
            <button type="button" className="btn btn-primary btn-lg shrink-0" onClick={submit}>
              코스 추천받기
              <ArrowRight size={16} />
            </button>
          </div>

          {/* 빠른 시작 */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[13px] text-muted">바로 시작</span>
            {QUICK_STARTS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="chip py-1.5 text-[13px]"
                onClick={() => onStart(item.mode, item.query)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[13px] text-muted">
          무엇을 적을지 모르겠다면{" "}
          <button
            type="button"
            className="font-semibold text-brand underline-offset-2 hover:underline"
            onClick={() => onOpenPlanner(selectedMode)}
          >
            질문에 답하며 만들기
          </button>
          를 눌러주세요. 4개 질문이면 충분해요.
        </p>
      </section>

      {/* ── 프리셋 코스 ── */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold tracking-[-0.02em] text-ink">이런 상황이라면</h2>
            <p className="mt-1 text-[14px] text-sub">누르면 조건이 채워진 채로 코스가 바로 만들어져요.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => onStart(preset.mode, preset.query, preset.route)}
              className="group flex flex-col rounded-[14px] border border-line bg-white p-5 text-left transition-colors hover:border-line-strong hover:bg-surface"
            >
              <span className="text-[12px] font-semibold text-brand">{preset.region}</span>
              <span className="mt-1.5 text-[16px] font-bold tracking-[-0.02em] text-ink">{preset.title}</span>
              <span className="mt-1.5 text-[13px] leading-[1.6] text-sub">{preset.desc}</span>
              <span className="mt-4 flex flex-wrap gap-1.5">
                {preset.tags.map((tag) => (
                  <span key={tag} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-muted transition-colors group-hover:text-brand">
                {modeLabels[preset.mode]}로 만들기
                <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 추천 기준 ── */}
      <section className="rounded-[16px] border border-line bg-surface px-5 py-6 md:px-7">
        <h2 className="text-[16px] font-bold tracking-[-0.02em] text-ink">Traveler는 이렇게 고릅니다</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CRITERIA.map((item, index) => (
            <div key={item.title} className="border-t border-line-strong pt-3">
              <span className="text-[12px] font-semibold text-muted">0{index + 1}</span>
              <p className="mt-1 text-[15px] font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-[13px] leading-[1.6] text-sub">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
