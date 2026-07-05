import ConversationPanel from "../components/travel/ConversationPanel";
import type { ChatMessage } from "../types/domain";

type RefinePageProps = {
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
  error: string | null;
};

export function RefinePage({
  messages,
  draft,
  onDraftChange,
  onSubmit,
  isStreaming,
  error,
}: RefinePageProps) {
  return (
    <section className="space-y-6">
      <section className="shell-card">
        <div className="shell-card-body">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Refine Guide
          </p>
          <h2 className="section-title mt-1">대화로 일정 수정</h2>
          <p className="section-copy mt-3">
            추천 결과가 나온 뒤에만 쓰는 페이지입니다. 프론트는 기존 세션과 메시지 흐름을
            유지하고, 백엔드는 후속 프롬프트를 다시 처리합니다.
          </p>
        </div>
      </section>

      <ConversationPanel
        messages={messages}
        draft={draft}
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
        disabled={false}
        error={error}
        helperText="결과를 본 뒤 조건을 더 붙이거나 순서를 바꾸는 요청을 이어갈 수 있습니다."
        submitLabel="이 코스 수정하기"
        placeholder="예: 점심은 더 조용한 곳으로 바꿔줘"
      />
    </section>
  );
}

export default RefinePage;
