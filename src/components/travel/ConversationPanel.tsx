export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ConversationPanelProps = {
  messages: ConversationMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  error?: string | null;
  helperText?: string;
  submitLabel?: string;
  placeholder?: string;
};

export function ConversationPanel({
  messages,
  draft,
  onDraftChange,
  onSubmit,
  isStreaming = false,
  disabled = false,
  error = null,
  helperText = "추천 결과를 본 뒤 조건을 덧붙이거나 순서를 조정해 보세요.",
  submitLabel = "다듬기",
  placeholder = "예: 점심은 조금 더 조용한 곳으로 바꿔줘",
}: ConversationPanelProps) {
  const tone = error ? "alert-error" : isStreaming ? "alert-info" : "alert";

  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Refine
            </p>
            <h2 className="section-title mt-1">일정을 더 다듬기</h2>
          </div>
          <span className="inline-flex h-6 items-center rounded-full border border-[#E8E4DC] bg-white px-2.5 text-[11px] font-bold leading-none text-[#6B7280]">
            Follow-up
          </span>
        </div>

        <div className="chat-scroll">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-header mb-1 text-xs text-slate-400">
                  {message.role === "user" ? "요청" : "추천"}
                </div>
                <div
                  className={`chat-bubble whitespace-pre-wrap ${
                    message.role === "user"
                      ? "chat-bubble-primary text-white"
                      : "border border-base-300 bg-white text-slate-700"
                  }`}
                >
                  {message.text || (message.role === "assistant" && isStreaming ? "..." : "")}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-200 p-4 text-sm text-slate-500">
              {helperText}
            </div>
          )}
        </div>

        <div className="join w-full">
          <input
            className="input input-bordered join-item w-full bg-white"
            value={draft}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => onDraftChange(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary join-item"
            disabled={disabled || isStreaming}
            onClick={onSubmit}
          >
            {isStreaming ? "반영 중..." : submitLabel}
          </button>
        </div>

        <div className={`alert ${tone}`}>
          <div>
            <strong>{error ? "다시 시도해 주세요." : "결과를 보고 수정 요청을 이어갈 수 있습니다."}</strong>
            <p className="text-sm">{error ?? helperText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConversationPanel;
