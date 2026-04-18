"use client";

type Mode = "single" | "batch";

type Props = {
  mode: Mode;
  onChange: (m: Mode) => void;
};

const TABS: { id: Mode; label: string }[] = [
  { id: "single", label: "Propuesta individual" },
  { id: "batch", label: "Generación en bloque" },
];

export function ModeTabs({ mode, onChange }: Props) {
  return (
    <div className="mb-6 flex">
      {TABS.map((t, i) => {
        const active = t.id === mode;
        const rounded = i === 0 ? "rounded-l-[10px]" : "rounded-r-[10px]";
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex-1 border-[1.5px] px-4 py-3.5 text-center text-[14px] font-semibold transition-colors ${rounded} ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-bg text-text-sec hover:bg-card"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
