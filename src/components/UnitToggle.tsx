"use client";

export default function UnitToggle<T extends string>({
  value,
  options,
  onChange,
  dark,
}: {
  value: T;
  options: [T, T];
  onChange: (v: T) => void;
  dark?: boolean;
}) {
  return (
    <div className={`unit-toggle${dark ? " unit-toggle-dark" : ""}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`unit-toggle-btn${value === opt ? " active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
