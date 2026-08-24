"use client";

export const INJECTION_SITES = [
  { key: "LEFT_ARM", label: "Left Arm" },
  { key: "LEFT_ABDOMEN", label: "Left Abdomen" },
  { key: "RIGHT_ABDOMEN", label: "Right Abdomen" },
  { key: "LEFT_GLUTE", label: "Left Glute" },
  { key: "RIGHT_GLUTE", label: "Right Glute" },
  { key: "RIGHT_ARM", label: "Right Arm" },
];

function ArmOutline({ shaded, onSelect }: { shaded: boolean; onSelect: () => void }) {
  return (
    <svg width="42" height="128" viewBox="0 0 42 128" className="isd-limb-svg">
      <path
        d="M18 4c8 0 12 6 12 14v34c0 8-3 13-3 22v40c0 8-5 12-9 12s-9-4-9-12V74c0-9-3-14-3-22V18C6 10 10 4 18 4z"
        fill="none" stroke="#8B7362" strokeWidth="1"
      />
      <ellipse cx="21" cy="46" rx="9" ry="20" className={`isd-shade ${shaded ? "isd-shade-on" : ""}`} onClick={onSelect} />
    </svg>
  );
}

function FrontTorso({ leftOn, rightOn, onSelectLeft, onSelectRight }: { leftOn: boolean; rightOn: boolean; onSelectLeft: () => void; onSelectRight: () => void }) {
  return (
    <svg width="150" height="200" viewBox="0 0 150 200" className="isd-torso-svg">
      <circle cx="75" cy="20" r="14" fill="none" stroke="#8B7362" strokeWidth="1" />
      <path
        d="M42 42c0 10-8 16-8 32v70c0 20 8 34 8 42h66c0-8 8-22 8-42V74c0-16-8-22-8-32-8-8-18-12-33-12s-25 4-33 12z"
        fill="none" stroke="#8B7362" strokeWidth="1"
      />
      <line x1="75" y1="34" x2="75" y2="186" stroke="#8B7362" strokeWidth="0.6" opacity="0.5" />
      <path d="M46 42c-8 6-14 16-14 30" fill="none" stroke="#8B7362" strokeWidth="1" strokeLinecap="round" />
      <path d="M104 42c8 6 14 16 14 30" fill="none" stroke="#8B7362" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="56" cy="110" rx="16" ry="24" transform="rotate(-8 56 110)" className={`isd-shade ${leftOn ? "isd-shade-on" : ""}`} onClick={onSelectLeft} />
      <ellipse cx="94" cy="110" rx="16" ry="24" transform="rotate(8 94 110)" className={`isd-shade ${rightOn ? "isd-shade-on" : ""}`} onClick={onSelectRight} />
    </svg>
  );
}

function BackTorso({ leftOn, rightOn, onSelectLeft, onSelectRight }: { leftOn: boolean; rightOn: boolean; onSelectLeft: () => void; onSelectRight: () => void }) {
  return (
    <svg width="150" height="200" viewBox="0 0 150 200" className="isd-torso-svg">
      <circle cx="75" cy="20" r="14" fill="none" stroke="#8B7362" strokeWidth="1" />
      <path
        d="M44 42c0 10-6 16-6 32v52c0 4 8 8 8 16v14c0 12 6 20 6 24h6c0-6-4-14-4-24v-8c0-8 3-12 3-18h16c0 6 3 10 3 18v8c0 10-4 18-4 24h6c0-4 6-12 6-24v-14c0-8 8-12 8-16V74c0-16-6-22-6-32-8-8-18-12-33-12s-25 4-33 12z"
        fill="none" stroke="#8B7362" strokeWidth="1"
      />
      <path d="M48 42c-8 6-12 16-12 30" fill="none" stroke="#8B7362" strokeWidth="1" strokeLinecap="round" />
      <path d="M102 42c8 6 12 16 12 30" fill="none" stroke="#8B7362" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="60" cy="128" rx="15" ry="20" className={`isd-shade ${leftOn ? "isd-shade-on" : ""}`} onClick={onSelectLeft} />
      <ellipse cx="90" cy="128" rx="15" ry="20" className={`isd-shade ${rightOn ? "isd-shade-on" : ""}`} onClick={onSelectRight} />
    </svg>
  );
}

function SiteRadio({ selected, suggested, label, onSelect }: { selected: boolean; suggested: boolean; label: string; onSelect: () => void }) {
  return (
    <button type="button" className="isd-site-col" onClick={onSelect}>
      <span className={`isd-radio ${selected ? "isd-radio-on" : ""} ${suggested && !selected ? "isd-radio-suggested" : ""}`}>
        {selected && "✓"}
      </span>
      <span className="isd-site-label">{label.toUpperCase()}</span>
    </button>
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
  const is = (k: string) => selectedSite === k;
  return (
    <div className="isd-wrap-v2">
      <div className="isd-row-v2">
        <div className="isd-limb-col">
          <ArmOutline shaded={is("LEFT_ARM")} onSelect={() => onSelect("LEFT_ARM")} />
        </div>
        <div className="isd-torso-col">
          <FrontTorso leftOn={is("LEFT_ABDOMEN")} rightOn={is("RIGHT_ABDOMEN")} onSelectLeft={() => onSelect("LEFT_ABDOMEN")} onSelectRight={() => onSelect("RIGHT_ABDOMEN")} />
        </div>
        <div className="isd-torso-col">
          <BackTorso leftOn={is("LEFT_GLUTE")} rightOn={is("RIGHT_GLUTE")} onSelectLeft={() => onSelect("LEFT_GLUTE")} onSelectRight={() => onSelect("RIGHT_GLUTE")} />
        </div>
        <div className="isd-limb-col">
          <ArmOutline shaded={is("RIGHT_ARM")} onSelect={() => onSelect("RIGHT_ARM")} />
        </div>
      </div>
      <div className="isd-radio-row">
        {INJECTION_SITES.map((s) => (
          <SiteRadio key={s.key} selected={is(s.key)} suggested={suggestedSite === s.key} label={s.label} onSelect={() => onSelect(s.key)} />
        ))}
      </div>
    </div>
  );
}
