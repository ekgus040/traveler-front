export type ModeSelectorOption = {
  value: string;
  emoji?: string;
  title: string;
  subtitle: string;
  description?: string;
};

type ModeSelectorProps = {
  label?: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: ModeSelectorOption[];
};

export function ModeSelector({
  label = "여행 스타일",
  selectedValue,
  onChange,
  options,
}: ModeSelectorProps) {
  const activeOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  return (
    <section className="shell-card">
      <div className="shell-card-body space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Mode
            </p>
            <h2 className="section-title mt-1">{label}</h2>
          </div>
          {activeOption?.emoji ? (
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-base-200 text-xl"
              aria-hidden="true"
            >
              {activeOption.emoji}
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          {options.map((option) => {
            const isActive = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-base-300 bg-white hover:border-slate-300"
                }`}
                onClick={() => onChange(option.value)}
              >
                <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
                  {option.emoji ? <span aria-hidden="true">{option.emoji}</span> : null}
                  <strong>{option.title}</strong>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700">{option.subtitle}</p>
                {option.description ? (
                  <small className="mt-1 block text-sm leading-5 text-slate-500">
                    {option.description}
                  </small>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ModeSelector;
