"use client";

export const INJECTION_SITES = [
  { key: "LEFT_ABDOMEN", label: "Left Abdomen", view: "front", cx: 44, cy: 108 },
  { key: "RIGHT_ABDOMEN", label: "Right Abdomen", view: "front", cx: 76, cy: 108 },
  { key: "LEFT_ARM", label: "Left Arm", view: "front", cx: 18, cy: 70 },
  { key: "RIGHT_ARM", label: "Right Arm", view: "front", cx: 102, cy: 70 },
  { key: "LEFT_GLUTE", label: "Left Glute", view: "back", cx: 44, cy: 108 },
  { key: "RIGHT_GLUTE", label: "Right Glute", view: "back", cx: 76, cy: 108 },
];

function BodyOutline() {
  return (
    <>
      <circle cx="60" cy="18" r="12" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M42 32c0 20-8 30-8 50s6 34 6 50h40c0-16 6-30 6-50s-8-30-8-50z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M42 36c-14 4-22 14-24 34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M78 36c14 4 22 14 24 34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M48 132c-2 20-4 32-4 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M72 132c2 20 4 32 4 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

export default function InjectionSiteDiagram({
  selectedSite,
  suggestedSite,
  onSelect,
}: {
  selectedSite: string | null;
  suggestedSite: string | null;
  onSelect: (site: string) => void;
}) {
  return (
    <div className="isd-wrap">
      <div className="isd-view">
        <p className="isd-view-label">Front</p>
        <svg viewBox="0 0 120 190" className="isd-svg">
          <BodyOutline />
          {INJECTION_SITES.filter((s) => s.view === "front").map((s) => (
            <circle
              key={s.key}
              cx={s.cx}
              cy={s.cy}
              r="9"
              className={`isd-site ${selectedSite === s.key ? "isd-site-selected" : ""} ${suggestedSite === s.key ? "isd-site-suggested" : ""}`}
              onClick={() => onSelect(s.key)}
            />
          ))}
        </svg>
      </div>
      <div className="isd-view">
        <p className="isd-view-label">Back</p>
        <svg viewBox="0 0 120 190" className="isd-svg">
          <BodyOutline />
          {INJECTION_SITES.filter((s) => s.view === "back").map((s) => (
            <circle
              key={s.key}
              cx={s.cx}
              cy={s.cy}
              r="9"
              className={`isd-site ${selectedSite === s.key ? "isd-site-selected" : ""} ${suggestedSite === s.key ? "isd-site-suggested" : ""}`}
              onClick={() => onSelect(s.key)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
