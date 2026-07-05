import {
  COMPANION_OPTIONS,
  MOOD_OPTIONS,
  PACE_OPTIONS,
  WEATHER_OPTIONS,
  modeLabels,
} from "../../../data/content";
import type { TravelComposerState, TravelMode, TravelOption, TravelPromptInput } from "../../../types/domain";

export function buildTravelPrompt(input: TravelPromptInput) {
  const { mode, composer } = input;
  const lines = [
    `여행 유형: ${modeLabels[mode]}`,
    `날씨: ${getOptionLabel(WEATHER_OPTIONS, composer.weather)}`,
    `동행자: ${getOptionLabel(COMPANION_OPTIONS, composer.companion)}`,
    `이동 성향: ${getOptionLabel(PACE_OPTIONS, composer.pace)}`,
    `분위기: ${getOptionLabel(MOOD_OPTIONS, composer.mood)}`,
    `요청: ${composer.query}`,
  ];

  if (mode === "longdist") {
    lines.push(`출발지: ${composer.startPoint}`);
    lines.push(`목적지: ${composer.endPoint}`);
  }

  return lines.join("\n");
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
