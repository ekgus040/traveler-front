import {
  COMPANION_OPTIONS,
  PACE_OPTIONS,
  modeLabels,
} from "../../../data/content";
import type { TravelComposerState, TravelMode, TravelOption, TravelPromptInput } from "../../../types/domain";

// 직접 입력(요청) 텍스트에서 동행자 키워드를 감지한다.
// UI 선택값보다 타이핑이 우선 — "가족 선택 후 친구랑이라고 쳐도 가족이 나오는" 버그 방지.
const COMPANION_QUERY_KEYWORDS: { keywords: string[]; label: string }[] = [
  { keywords: ["남자친구", "여자친구", "남친", "여친", "커플", "연인"], label: "연인" },
  { keywords: ["유아", "아기", "애기", "아이", "어린이", "초등", "가족"], label: "가족" },
  { keywords: ["친구"], label: "친구" },
  { keywords: ["혼자", "솔로", "1인"], label: "혼자" },
];

function detectCompanionFromQuery(query: string): string | null {
  for (const { keywords, label } of COMPANION_QUERY_KEYWORDS) {
    if (keywords.some((kw) => query.includes(kw))) return label;
  }
  return null;
}

const COURSE_LENGTH: Record<TravelMode, string> = {
  nearby: "3~4",
  longdist: "4~5",
  remote: "4~5",
};

/**
 * 사용자가 실제로 고른(또는 직접 적은) 조건만 프롬프트에 넣는다.
 * 빈 값을 라벨과 함께 흘려보내면 백엔드가 그것을 취향으로 저장해
 * 요청과 무관한 코스가 나온다(예: 고른 적 없는 "가족·자연").
 *
 * 동행자 우선순위: 요청 문장에서 감지된 값 > UI 선택값 > 생략.
 */
export function buildTravelPrompt(input: TravelPromptInput) {
  const { mode, composer } = input;
  const lines = [`여행 유형: ${modeLabels[mode]}`];

  const companion =
    detectCompanionFromQuery(composer.query) ??
    (composer.companion ? getOptionLabel(COMPANION_OPTIONS, composer.companion) : "");
  const pace = composer.pace ? getOptionLabel(PACE_OPTIONS, composer.pace) : "";
  const interest = composer.interest ? getInterestLabel(composer.interest) : "";

  if (companion) lines.push(`동행자: ${companion}`);
  if (pace) lines.push(`이동 성향: ${pace}`);
  if (interest) lines.push(`관심 테마: ${interest}`);

  // 백엔드는 "요청" 문장만 검색에 쓴다. 별도의 "지역:" 줄은 무시되므로
  // 목적지는 반드시 이 문장 안에 넣고, 비어 있으면 고른 조건으로 채운다
  // (빈 요청으로 보내면 전국에서 엉뚱한 장소가 섞여 나온다. 2026-09-08 실측).
  lines.push(`요청: ${buildRequestText(mode, composer, interest)}`);

  // 개수를 명시하지 않으면 LLM이 1~2곳만 돌려준다(2026-09-07 실측:
  // "강릉 바다…" 1곳 → "…3곳 이상 묶은 코스" 3곳). "코스"라는 결과물에는
  // 최소 3곳이 필요하므로 프롬프트에서 항상 요구한다.
  lines.push(`구성: 이동 순서가 있는 장소 ${COURSE_LENGTH[mode]}곳으로 코스를 만들어줘.`);

  if (mode === "longdist") {
    if (composer.startPoint.trim()) lines.push(`출발지: ${composer.startPoint}`);
    if (composer.endPoint.trim()) lines.push(`목적지: ${composer.endPoint}`);
  }

  return lines.join("\n");
}

function buildRequestText(mode: TravelMode, composer: TravelComposerState, interest: string) {
  const query = composer.query.trim();
  const destination = mode === "nearby" ? "" : composer.endPoint.trim();

  if (query) {
    return destination && !query.includes(destination) ? `${destination} ${query}` : query;
  }

  const theme = interest ? `${interest} 위주로` : "대표 명소와 맛집을";
  return destination
    ? `${destination} ${theme} 둘러보는 코스`
    : `${theme} 둘러보는 근교 코스`;
}

function getInterestLabel(value: string) {
  return ({ nature: "자연", city: "도시", food: "맛집", culture: "문화" } as Record<string, string>)[value] ?? value;
}

export function buildTravelUserPreview(mode: TravelMode, composer: TravelComposerState) {
  if (mode !== "longdist" || !composer.startPoint.trim() || !composer.endPoint.trim()) {
    return composer.query;
  }

  return `${composer.query} (${composer.startPoint} → ${composer.endPoint})`;
}

export function getOptionLabel(options: TravelOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
