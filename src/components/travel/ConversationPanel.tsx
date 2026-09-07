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
  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-4">
        <div>
          <h2 className="section-title">일정 다듬기</h2>
          <p className="mt-1 text-[13px] text-muted">{helperText}</p>
        </div>

        {messages.length > 0 ? (
          <div className="chat-scroll space-y-2.5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-[12px] px-4 py-2.5 text-[14px] leading-[1.65] ${
                    message.role === "user"
                      ? "bg-brand text-white"
                      : "border border-line bg-surface text-sub"
                  }`}
                >
                  {message.text || (message.role === "assistant" && isStreaming ? "..." : "")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-dashed border-line-strong bg-surface p-5 text-center text-[14px] text-muted">
            아직 주고받은 요청이 없습니다.
          </div>
        )}

        <div className="flex items-center gap-2 rounded-[10px] border border-line px-3.5 transition-colors focus-within:border-brand">
          <input
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[14px] text-ink outline-none placeholder:text-muted"
            value={draft}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing && !isStreaming) onSubmit();
            }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm shrink-0"
            disabled={disabled || isStreaming}
            onClick={onSubmit}
          >
            {isStreaming ? "반영 중" : submitLabel}
          </button>
        </div>

        {error ? (
          <p className="rounded-[10px] border border-[#F5C2C4] bg-[#FEF1F1] px-4 py-3 text-[13px] text-[#C63B40]">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default ConversationPanel;
