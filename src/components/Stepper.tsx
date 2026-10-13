type Step = { label: string; done?: boolean };

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
      {steps.map((s, i) => {
        const done = s.done || i < current;
        const active = i === current;
        return (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border font-serif text-[11px] ${
                active
                  ? "border-ruby bg-ruby text-rose-mist"
                  : done
                    ? "border-ruby/50 bg-paper text-ruby"
                    : "border-cocoa/25 bg-paper text-cocoa/45"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span
              className={`sr-only sm:not-sr-only sm:inline ${
                active ? "text-cocoa" : done ? "text-cocoa/70" : "text-cocoa/45"
              }`}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
