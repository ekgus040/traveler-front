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

export function buildTravelPrompt(input: TravelPromptInput) {
  const { mode, composer } = input;
  const companionFromQuery = detectCompanionFromQuery(composer.query);
  const companionLabel = companionFromQuery ?? getOptionLabel(COMPANION_OPTIONS, composer.companion);
  const lines = [
    `여행 유형: ${modeLabels[mode]}`,
    `동행자: ${companionLabel}`,
    `이동 성향: ${getOptionLabel(PACE_OPTIONS, composer.pace)}`,
    `관심 테마: ${getInterestLabel(composer.interest)}`,
    `요청: ${composer.query}`,
  ];

  if (mode === "longdist") {
    lines.push(`출발지: ${composer.startPoint}`);
    lines.push(`목적지: ${composer.endPoint}`);
  }

  return lines.join("\n");
}

function getInterestLabel(value: string) {
  return ({ nature: "자연", city: "도시", food: "맛집", culture: "문화" } as Record<string, string>)[value] ?? value;
}

export function buildTravelUserPreview(mode: TravelMode, composer: TravelComposerState) {
  if (mode !== "longdist") {
    return composer.query;
  }

  return `${composer.query} (${composer.startPoint} → ${composer.endPoint})`;
}

export function getOptionLabel(options: TravelOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
