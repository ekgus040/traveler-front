import type { ChatMessage, Place, TravelMode, TrustReport } from "../types/domain";
import { resolvePlaceCoordinates } from "./placeCoordinates";

export const initialChats: Record<TravelMode, ChatMessage[]> = {
  nearby: [
    {
      id: "n1",
      role: "user",
      text: "비 오는 토요일에 아이랑 갈 만한 실내 위주 코스 추천해줘.",
    },
    {
      id: "n2",
      role: "assistant",
      text: "주차 가능, 실내 비중 높은 코스로 묶어볼게요. 이동 시간은 40분 이내로 잡고 카페-체험-식사 흐름으로 추천합니다.",
    },
  ],
  longdist: [
    {
      id: "l1",
      role: "user",
      text: "서울에서 강릉까지 가는데 중간에 쉬기 좋은 휴게소랑 점심 장소도 넣어줘.",
    },
    {
      id: "l2",
      role: "assistant",
      text: "경로 위 POI를 기준으로 휴게소 1곳, 식사 1곳, 도착 후 산책 1곳을 포함한 드라이브 코스를 제안합니다.",
    },
  ],
  remote: [
    {
      id: "r1",
      role: "user",
      text: "부산 처음 가는데 너무 뻔하지 않게 하루 코스로 짜줘.",
    },
    {
      id: "r2",
      role: "assistant",
      text: "대표 명소 1곳과 로컬 감성 장소 2곳을 섞어서 초행자용 하루 코스로 구성할게요.",
    },
  ],
};

export const mockPlaces: Record<TravelMode, Place[]> = {
  nearby: [
    {
      id: "p1",
      title: "아쿠아가든 실내 테마카페",
      category: "카페",
      time: "10:30",
      tags: ["실내", "주차", "아이 동반"],
      badge: "명소",
      summary: "비 오는 날에도 머물기 편하고 체류 시간이 긴 시작 지점.",
      coordinates: resolvePlaceCoordinates("아쿠아가든 실내 테마카페"),
    },
    {
      id: "p2",
      title: "키즈 아트 체험관",
      category: "체험",
      time: "12:10",
      tags: ["실내", "체험", "예약 가능"],
      summary: "아이 피로도가 낮고 날씨 영향이 적은 중간 코스.",
      coordinates: resolvePlaceCoordinates("키즈 아트 체험관"),
    },
    {
      id: "p3",
      title: "리버사이드 브런치 하우스",
      category: "식사",
      time: "14:00",
      tags: ["브런치", "주차", "유모차"],
      badge: "히든",
      summary: "혼잡도가 낮고 가족 단위 좌석이 넉넉한 마무리 장소.",
      coordinates: resolvePlaceCoordinates("리버사이드 브런치 하우스"),
    },
  ],
  longdist: [
    {
      id: "p4",
      title: "여주 휴게 포인트",
      category: "휴게소",
      time: "09:20",
      tags: ["휴게소", "충전", "화장실"],
      summary: "장거리 모드에서 첫 번째 회복 지점.",
      coordinates: resolvePlaceCoordinates("여주 휴게 포인트"),
    },
    {
      id: "p5",
      title: "원주 로컬 국수집",
      category: "식사",
      time: "11:40",
      tags: ["경로 인접", "점심", "혼잡도 낮음"],
      badge: "히든",
      summary: "고속도로에서 크게 벗어나지 않는 점심 경유지.",
      coordinates: resolvePlaceCoordinates("원주 로컬 국수집"),
    },
    {
      id: "p6",
      title: "강릉 안목 해변 산책",
      category: "도착지",
      time: "14:20",
      tags: ["바다", "산책", "포토"],
      badge: "명소",
      summary: "도착 후 바로 분위기를 전환할 수 있는 대표 목적지.",
      coordinates: resolvePlaceCoordinates("강릉 안목 해변 산책"),
    },
  ],
  remote: [
    {
      id: "p7",
      title: "감천문화마을 뷰포인트",
      category: "명소",
      time: "10:00",
      tags: ["첫 방문", "포토", "대표"],
      badge: "명소",
      summary: "초행자에게 지역 인상을 강하게 남기는 오프닝 코스.",
      coordinates: resolvePlaceCoordinates("감천문화마을 뷰포인트"),
    },
    {
      id: "p8",
      title: "전포 골목 편집서점",
      category: "로컬",
      time: "13:00",
      tags: ["실내", "감성", "도보"],
      badge: "히든",
      summary: "붐비는 관광지에서 벗어나 템포를 바꾸는 중간 지점.",
      coordinates: resolvePlaceCoordinates("전포 골목 편집서점"),
    },
    {
      id: "p9",
      title: "광안리 야경 다이닝",
      category: "식사",
      time: "18:30",
      tags: ["야경", "식사", "마감 코스"],
      summary: "하루 일정을 정리하기 좋은 엔딩 스팟.",
      coordinates: resolvePlaceCoordinates("광안리 야경 다이닝"),
    },
  ],
};

export const mockBotMessages: Record<TravelMode, string> = {
  nearby:
    "비 오는 날엔 실내 코스가 정답이죠! 아이와 함께 즐길 수 있는 근교 코스를 준비했어요.\n\n" +
    "첫 번째로 **아쿠아가든 실내 테마카페**에서 여유롭게 시작하세요. 넓은 실내 공간과 체류형 구성이 비 오는 날 최적입니다. 이어서 **키즈 아트 체험관**에서 아이와 함께 창의 활동을 즐기고, 마지막으로 **리버사이드 브런치 하우스**에서 여유로운 식사로 하루를 마무리하는 코스입니다.\n\n" +
    "이동 거리가 짧고 주차 여건이 좋아 아이 동반 가족에게 부담 없는 구성이에요.",

  longdist:
    "서울에서 강릉까지 장거리 드라이브 코스를 준비했어요. 이동 피로를 최소화하는 경유지 배치에 집중했습니다.\n\n" +
    "**여주 휴게 포인트**에서 첫 번째 회복 정차를 하고, **원주 로컬 국수집**에서 고속도로를 크게 벗어나지 않고 점심을 해결하세요. 도착 후에는 **강릉 안목 해변**에서 바로 분위기 전환이 가능합니다.\n\n" +
    "총 이동 시간 약 2시간 30분 기준으로, 무리하지 않는 장거리 흐름이에요.",

  remote:
    "부산 초행이어도 걱정 없어요. 대표 명소와 로컬 감성을 균형 있게 담은 하루 코스입니다.\n\n" +
    "**감천문화마을 뷰포인트**로 강렬하게 시작해 지역 인상을 먼저 확보하고, **전포 골목 편집서점**에서 붐비는 관광지를 벗어나 템포를 바꿔보세요. 하루의 마감은 **광안리 야경 다이닝**에서 바다 뷰와 함께 완벽하게 정리됩니다.\n\n" +
    "도보 동선이 짧고 각 장소 간 이동이 15~20분 내외로 초행자에게 딱 맞는 밀도예요.",
};

// mock 경로: 각 모드의 장소 좌표를 중간 경유점과 함께 이어서 도로처럼 보이게 함
export const mockRoutePaths: Record<TravelMode, [number, number][]> = {
  nearby: [
    [37.5172, 127.0473],
    [37.5148, 127.0612],
    [37.5131, 127.0750],
    [37.5104, 127.0982],
    [37.5155, 127.0820],
    [37.5200, 127.0680],
    [37.5240, 127.0520],
    [37.5269, 127.0364],
  ],
  longdist: [
    [37.2977, 127.6372],
    [37.3082, 127.7100],
    [37.3200, 127.8000],
    [37.3422, 127.9202],
    [37.4500, 128.1500],
    [37.5800, 128.4200],
    [37.6800, 128.7000],
    [37.7719, 128.9476],
  ],
  remote: [
    [35.0979, 129.0106],
    [35.1100, 129.0250],
    [35.1300, 129.0400],
    [35.1578, 129.0638],
    [35.1560, 129.0800],
    [35.1540, 129.1000],
    [35.1532, 129.1186],
  ],
};

export const visitedSpots = [
  "성수 서울숲 카페거리",
  "하남 스타필드 아쿠아존",
  "양평 두물머리",
];

export const mockTrustReport: TrustReport = {
  trustScore: 82,
  reasoning: [
    "실행 후보 장소 6건 중 5건이 영업 여부와 좌표가 교차 검증되었습니다.",
    "이동 순서와 체류 시간은 현재 날씨와 혼잡도 가정을 기준으로 자연스럽게 연결됩니다.",
    "장거리 구간 우회 리스크가 남아 있어 최종 예약 또는 출발 직전 재확인이 필요합니다.",
  ],
  executionReady: true,
  executionSummary:
    "즉시 제안 가능한 수준입니다. 다만 Tier 3의 실시간 운영 정보는 출발 직전에 한 번 더 갱신하는 편이 안전합니다.",
  updatedAt: "2026-06-28 14:20 KST",
  validations: [
    {
      id: "tier-1",
      level: 1,
      label: "Tier 1",
      title: "기본 구조 검증",
      summary: "응답 스키마, 필수 필드, 좌표 형식이 정상인지 확인합니다.",
      status: "passed",
      confidence: 96,
      checks: [
        "필수 장소 정보와 시간 정보 누락 없음",
        "place_id 매핑 및 좌표 형식 유효",
        "모드별 추천 정책과 충돌 없음",
      ],
    },
    {
      id: "tier-2",
      level: 2,
      label: "Tier 2",
      title: "근거 일관성 검증",
      summary: "설명 문장과 실제 추천 항목이 서로 같은 근거를 가리키는지 봅니다.",
      status: "passed",
      confidence: 84,
      checks: [
        "reasoning과 추천 순서가 동일한 이동 맥락을 설명",
        "실내/가족 동반 조건이 주요 후보군에 반영됨",
        "중복 추천과 과도한 우회 경로 없음",
      ],
    },
    {
      id: "tier-3",
      level: 3,
      label: "Tier 3",
      title: "실행 가능성 검증",
      summary: "실시간 운영 여부, 혼잡도, 이동 리스크 같은 마지막 실행 조건을 점검합니다.",
      status: "warning",
      confidence: 66,
      checks: [
        "대부분 장소는 최근 영업 정보 확인 완료",
        "1개 후보는 임시 휴무 가능성으로 재조회 권장",
        "장거리 이동 시 교통 상황 변동성 존재",
      ],
    },
  ],
};
