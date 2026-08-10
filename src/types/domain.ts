export type TravelMode = "nearby" | "longdist" | "remote";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export type PlaceBadge = "명소" | "히든";

export type Place = {
  id: string;
  sourcePlaceId?: string;
  title: string;
  category: string;
  time: string;
  tags: string[];
  badge?: PlaceBadge;
  summary: string;
  recommendReason?: string;
  coordinates?: TravelCoordinates;
};

export type ModeCard = {
  id: TravelMode;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
};

export type TravelOption = {
  value: string;
  label: string;
};

export type TravelComposerState = {
  query: string;
  weather: string;
  companion: string;
  pace: string;
  mood: string;
  interest: string;
  startPoint: string;
  endPoint: string;
};

export type TravelCoordinates = {
  lat: number;
  lon: number;
};

export type TravelPromptInput = {
  mode: TravelMode;
  composer: TravelComposerState;
};

export type TravelChatRequest = TravelCoordinates & {
  sessionId: string;
  userMessage: string;
  mode: TravelMode;
};

export type TravelStreamStatus = "idle" | "live" | "ready" | "error";

export type OnboardingQuestionOption = {
  value: string;
  label: string;
  description: string;
};

export type OnboardingQuestion = {
  id: string;
  title: string;
  description: string;
  options: OnboardingQuestionOption[];
};

export type TrustTierStatus = "verified" | "watch" | "pending";

export type TrustTier = {
  id: string;
  title: string;
  description: string;
  status: TrustTierStatus;
};

export type TrustOverview = {
  trustScore: number;
  reasoning: string;
  executionReady: boolean;
  highlights: string[];
  tiers: TrustTier[];
};

export type ModeGuide = {
  headline: string;
  summary: string;
  ratioLabel: string;
  checklist: string[];
  steps: string[];
};

export type TrustValidationStatus = "passed" | "warning" | "pending";

export type TrustValidationTierLevel = 1 | 2 | 3;

export type TrustValidationTier = {
  id: string;
  level: TrustValidationTierLevel;
  label: string;
  title: string;
  summary: string;
  status: TrustValidationStatus;
  confidence: number;
  checks: string[];
};

export type TrustReport = {
  trustScore: number;
  reasoning: string[];
  executionReady: boolean;
  executionSummary: string;
  updatedAt: string;
  validations: TrustValidationTier[];
};
