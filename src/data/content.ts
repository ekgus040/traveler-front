import type {
  ModeCard,
  ModeGuide,
  TravelComposerState,
  TravelMode,
  TravelOption,
} from "../types/domain";

export const WEATHER_OPTIONS: TravelOption[] = [
  { value: "rain", label: "비" },
  { value: "sunny", label: "맑음" },
  { value: "cloudy", label: "흐림" },
];

export const COMPANION_OPTIONS: TravelOption[] = [
  { value: "solo", label: "🚶 혼자" },
  { value: "couple", label: "💑 연인" },
  { value: "family", label: "👨‍👩‍👧 가족" },
  { value: "friends", label: "👯 친구" },
];

export const PACE_OPTIONS: TravelOption[] = [
  { value: "relaxed", label: "😌 차분히" },
  { value: "balanced", label: "😊 적당히" },
  { value: "fast", label: "⚡ 활기차게" },
  { value: "energetic", label: "🔥 뜨겁게" },
];

export const MOOD_OPTIONS: TravelOption[] = [
  { value: "calm", label: "차분한" },
  { value: "fun", label: "활동적인" },
  { value: "romantic", label: "분위기 있는" },
];

export const DEFAULT_TRAVEL_COMPOSER: TravelComposerState = {
  query: "비 오는 주말에 아이와 갈 실내 위주 코스",
  weather: "rain",
  companion: "family",
  pace: "balanced",
  mood: "calm",
  interest: "nature",
  startPoint: "서울 잠실",
  endPoint: "강릉 안목해변",
};

export const DEFAULT_RECOMMENDATION_COORDINATES = {
  lat: 35.8347,
  lon: 129.2189,
};

export const modeCards: ModeCard[] = [
  {
    id: "nearby",
    emoji: "01",
    title: "근교 드라이브",
    subtitle: "집에서 1~2시간, 오늘 바로",
    description: "숨은 카페·맛집과 계절 명소를 엮은 당일 귀가 코스.",
  },
  {
    id: "longdist",
    emoji: "02",
    title: "자차 장거리",
    subtitle: "경유부터 현지 일정까지",
    description: "휴게소·주유소 정차 타이밍과 목적지 코스를 한 번에 설계.",
  },
  {
    id: "remote",
    emoji: "03",
    title: "타지 렌터카",
    subtitle: "초행 지역도 막힘 없이",
    description: "대표 명소와 로컬 스팟을 결합한 날짜별 렌터카 코스.",
  },
];

export const modeLabels: Record<TravelMode, string> = {
  nearby: "근교 드라이브",
  longdist: "자차 장거리",
  remote: "타지 렌터카",
};

export const featureBullets = [
  "Triple Mode 기반 추천 흐름",
  "날씨·주차·동반자·기분 반영 입력",
  "지도 경로 + 장소 카드 동시 확인",
  "visited_spots 기반 재추천",
];

export const mapHighlights: Record<TravelMode, string[]> = {
  nearby: ["실시간 날씨 반영", "주차 가능 장소 우선", "40분 이내 이동"],
  longdist: ["출발지-목적지 경로", "휴게소/주유소 POI", "Polyline 기반 경유"],
  remote: ["대표 명소 + 로컬 스팟", "도보/체류 시간 흐름", "재추천 대비 visited_spots"],
};

export const modeGuides: Record<TravelMode, ModeGuide> = {
  nearby: {
    headline: "근교 드라이브는 숨은 장소 비중이 높아야 합니다.",
    summary: "오늘 바로 움직이는 모드라서 주차, 날씨, 체류 편의가 가장 중요합니다.",
    ratioLabel: "숨은 카페·맛집 70% · 인증샷 20% · 계절 특화 10%",
    checklist: ["40분 내 이동", "주차 가능한 장소 우선", "날씨 따라 실내외 비중 조절"],
    steps: ["출발지 근처 탐색", "중간 체류형 카페/체험", "혼잡도 낮은 식사 마감"],
  },
  longdist: {
    headline: "장거리 모드는 이동 구간과 목적지 코스를 분리해서 봐야 합니다.",
    summary: "경로 위 휴게소와 주유소, 도착 후 현지 일정이 한 화면에 이어져야 합니다.",
    ratioLabel: "이동 POI 30% · 대표 명소 35% · 로컬 스팟 35%",
    checklist: ["경로 위 POI 우선", "점심/휴식 타이밍 분리", "도착 후 산책/명소 연결"],
    steps: ["출발지-목적지 경로 계산", "searchPoiAlong 경유지 배치", "도착 후 목적지 코스 생성"],
  },
  remote: {
    headline: "타지 모드는 대표 명소와 로컬 감성을 같이 보여줘야 합니다.",
    summary: "처음 가는 지역이라 대표성은 놓치지 않되, 너무 뻔하지 않게 로컬 지점을 섞습니다.",
    ratioLabel: "대표 명소 1~2곳 · 로컬 추천 2~3곳 · 시즌 장소",
    checklist: ["대표 명소 최소 1곳 포함", "로컬 2~3곳 혼합", "도보 동선과 체류 흐름 정리"],
    steps: ["지역 대표 포인트 확보", "감성/로컬 장소 혼합", "식사와 야간 마감 장소 연결"],
  },
};

type ModeGuideContent = {
  eyebrow: string;
  title: string;
  summary: string;
  checklist: string[];
  emphasis: string[];
};

type LongDistanceFlowStep = {
  step: string;
  title: string;
  description: string;
};

type SpotMixContent = {
  landmarkRatio: number;
  hiddenRatio: number;
  summary: string;
  rationale: string;
};

export const modeGuideContent: Record<TravelMode, ModeGuideContent> = {
  nearby: {
    eyebrow: "Quick Match",
    title: "근교는 바로 움직일 수 있는 확실한 선택이 우선입니다.",
    summary:
      "날씨, 주차, 동반자 조건을 먼저 좁히고 짧은 시간 안에 만족도가 높은 장소를 배치합니다.",
    checklist: [
      "이동 부담이 낮은 40분 내외 후보 우선",
      "실내 여부와 주차 가능성 즉시 확인",
      "당일 동선 완성도가 높은 2~3곳 중심 구성",
    ],
    emphasis: ["즉시성", "주차/날씨", "짧은 체류 전환"],
  },
  longdist: {
    eyebrow: "Route Guide",
    title: "장거리는 목적지보다 이동 중 피로 관리와 경유 설계가 중요합니다.",
    summary:
      "출발지와 도착지를 기준으로 쉬는 타이밍, 식사 지점, 도착 직후 전환 장소를 함께 제안합니다.",
    checklist: [
      "출발지-목적지 경로를 먼저 고정",
      "휴게소, 주유/충전, 점심 지점을 경로 위에서 선택",
      "도착 후 바로 갈 수 있는 마무리 POI까지 연결",
    ],
    emphasis: ["경로 기반", "휴식 포인트", "도착 후 전환"],
  },
  remote: {
    eyebrow: "Local Curation",
    title: "타지는 익숙한 명소와 낯선 로컬 스팟의 균형이 핵심입니다.",
    summary:
      "처음 방문하는 지역에서도 실패 확률이 낮도록 대표 장소를 잡고, 그 사이에 현지 감도 높은 장소를 섞습니다.",
    checklist: [
      "대표 명소로 지역 인상을 먼저 확보",
      "혼잡도를 낮추는 히든 스팟 중간 배치",
      "도보/체류 시간까지 고려한 일정형 제안",
    ],
    emphasis: ["대표성", "로컬 감도", "하루 일정 흐름"],
  },
};

export const longDistanceFlowSteps: LongDistanceFlowStep[] = [
  {
    step: "01",
    title: "출발 조건 정리",
    description: "출발지, 도착지, 동행자, 출발 시간을 받아 기본 이동 축을 만듭니다.",
  },
  {
    step: "02",
    title: "중간 회복 지점 배치",
    description: "휴게소, 충전/주유, 화장실 같은 필수 정차 지점을 먼저 배치합니다.",
  },
  {
    step: "03",
    title: "경로 위 식사/경유 선택",
    description: "우회가 과하지 않은 점심 장소나 짧은 산책 지점을 추가합니다.",
  },
  {
    step: "04",
    title: "도착 후 첫 장소 연결",
    description: "도착 직후 바로 분위기를 전환할 수 있는 명소나 휴식 스팟으로 마감합니다.",
  },
];

export const spotMixContent: Record<TravelMode, SpotMixContent> = {
  nearby: {
    landmarkRatio: 30,
    hiddenRatio: 70,
    summary: "근교는 매주 새롭게 발견할 수 있도록 숨은 장소 비중을 높입니다.",
    rationale: "카페·맛집 70%를 중심으로 인증샷 명소와 계절 특화 장소를 더합니다.",
  },
  longdist: {
    landmarkRatio: 45,
    hiddenRatio: 55,
    summary: "장거리는 목적지 명소보다 경로 위 실용 경유지가 더 큰 비중을 가질 수 있습니다.",
    rationale: "휴게소, 로컬 식당, 짧은 산책 지점처럼 이동 맥락에 맞는 히든성 장소가 실제 만족도에 더 직접적입니다.",
  },
  remote: {
    landmarkRatio: 40,
    hiddenRatio: 60,
    summary: "대표 명소 1~2곳을 기준점으로 두고 로컬 스팟 2~3곳을 연결합니다.",
    rationale: "Iconic Score로 초행자의 실패 확률을 낮추고 로컬 추천으로 여행의 개성을 만듭니다.",
  },
};

export type OnboardingChoice = {
  value: string;
  label: string;
};

export type OnboardingQuestion = {
  id: string;
  step: string;
  title: string;
  description: string;
  choices: OnboardingChoice[];
};

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "companion",
    step: "01",
    title: "누구와 떠나나요?",
    description: "추천 톤과 동선을 가장 크게 바꾸는 조건입니다.",
    choices: [
      { value: "solo", label: "🚶 혼자" },
      { value: "couple", label: "💑 연인" },
      { value: "friends", label: "👯 친구" },
      { value: "family", label: "👨‍👩‍👧 가족" },
    ],
  },
  {
    id: "pace",
    step: "02",
    title: "어떤 템포가 좋나요?",
    description: "이동 속도와 장소 수를 조정합니다.",
    choices: [
      { value: "fast", label: "⚡ 짧고 빠르게" },
      { value: "balanced", label: "😊 적당히 균형 있게" },
      { value: "relaxed", label: "😌 여유롭게" },
    ],
  },
  {
    id: "mood",
    step: "03",
    title: "오늘 끌리는 분위기는?",
    description: "같은 지역이어도 전혀 다른 장소 조합이 나옵니다.",
    choices: [
      { value: "fun", label: "🔥 활동적인 무드" },
      { value: "calm", label: "🌿 차분한 무드" },
      { value: "romantic", label: "✨ 분위기 있는 무드" },
    ],
  },
];
