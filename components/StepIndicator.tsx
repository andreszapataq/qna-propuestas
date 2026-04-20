type Props = { step: 1 | 2 | 3 };

const STEPS = [
  { n: 1, label: "Datos del cliente" },
  { n: 2, label: "Productos y descuento" },
  { n: 3, label: "Vista previa y generar" },
] as const;

export function StepIndicator({ step }: Props) {
  return (
    <div className="mb-6 flex">
      {STEPS.map((s, i) => {
        const state = s.n < step ? "done" : s.n === step ? "active" : "pending";
        const base =
          "flex-1 text-center px-2 py-3 text-[12px] font-medium border transition-colors";
        const rounded =
          i === 0 ? "rounded-l-lg" : i === STEPS.length - 1 ? "rounded-r-lg" : "";
        const stateClass =
          state === "active"
            ? "bg-primary text-white border-primary"
            : state === "done"
              ? "bg-accent-light text-accent border-accent"
              : "bg-bg text-text-tert border-border";
        const chipClass =
          state === "active"
            ? "bg-white/30"
            : state === "done"
              ? "bg-accent text-white"
              : "bg-white/20";
        return (
          <div key={s.n} className={`${base} ${rounded} ${stateClass}`}>
            <span
              className={`mr-1.5 inline-flex h-5.5 w-5.5 items-center justify-center rounded-full text-[11px] font-bold ${chipClass}`}
            >
              {s.n}
            </span>
            {s.label}
          </div>
        );
      })}
    </div>
  );
}
