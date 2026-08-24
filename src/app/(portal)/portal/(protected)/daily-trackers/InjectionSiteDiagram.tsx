"use client";

export const INJECTION_SITES = [
  { key: "LEFT_ARM", label: "Left Arm" },
  { key: "LEFT_ABDOMEN", label: "Left Abdomen" },
  { key: "RIGHT_ABDOMEN", label: "Right Abdomen" },
  { key: "LEFT_GLUTE", label: "Left Glute" },
  { key: "RIGHT_GLUTE", label: "Right Glute" },
  { key: "RIGHT_ARM", label: "Right Arm" },
];

function ArmSvg({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 60 200" className="isd-limb-svg">
      <path
        d="M30,4 C40,4 46,10 46,20 C46,32 43,38 43,48 L43,150 C43,168 40,188 30,192 C20,188 17,168 17,150 L17,48 C17,38 14,32 14,20 C14,10 20,4 30,4 Z"
        fill="none" stroke="#6B5240" strokeWidth="1.3"
      />
      <ellipse cx="30" cy="55" rx="12" ry="30" className={`isd-shade ${on ? "isd-shade-on" : ""}`} />
    </svg>
  );
}

function FrontTorsoSvg({ leftOn, rightOn }: { leftOn: boolean; rightOn: boolean }) {
  return (
    <svg viewBox="0 0 190 290" className="isd-torso-svg">
      <circle cx="95" cy="26" r="18" fill="none" stroke="#6B5240" strokeWidth="1.3" />
      <path
        d="M95,46 C 74,46 66,54 64,64 C 50,68 42,80 40,96 C 38,110 42,120 44,132 C 40,150 38,168 42,188 C 45,208 50,224 56,240 C 58,252 60,262 62,272 L 128,272 C 130,262 132,252 134,240 C 140,224 145,208 148,188 C 152,168 150,150 146,132 C 148,120 152,110 150,96 C 148,80 140,68 126,64 C 124,54 116,46 95,46 Z"
        fill="none" stroke="#6B5240" strokeWidth="1.3"
      />
      <line x1="95" y1="64" x2="95" y2="268" stroke="#6B5240" strokeWidth="0.6" opacity="0.35" />
      <ellipse cx="70" cy="150" rx="21" ry="34" transform="rotate(-5 70 150)" className={`isd-shade ${leftOn ? "isd-shade-on" : ""}`} />
      <ellipse cx="120" cy="150" rx="21" ry="34" transform="rotate(5 120 150)" className={`isd-shade ${rightOn ? "isd-shade-on" : ""}`} />
    </svg>
  );
}

function BackTorsoSvg({ leftOn, rightOn }: { leftOn: boolean; rightOn: boolean }) {
  return (
    <svg viewBox="0 0 190 290" className="isd-torso-svg">
      <circle cx="95" cy="26" r="18" fill="none" stroke="#6B5240" strokeWidth="1.3" />
      <path
        d="M95,46 C 74,46 66,54 64,64 C 50,68 42,80 40,96 C 38,110 42,120 44,132 C 40,150 38,168 42,188 C 45,208 50,224 56,240 C 58,252 60,262 62,272 L 128,272 C 130,262 132,252 134,240 C 140,224 145,208 148,188 C 152,168 150,150 146,132 C 148,120 152,110 150,96 C 148,80 140,68 126,64 C 124,54 116,46 95,46 Z"
        fill="none" stroke="#6B5240" strokeWidth="1.3"
      />
      <ellipse cx="72" cy="200" rx="20" ry="26" className={`isd-shade ${leftOn ? "isd-shade-on" : ""}`} />
      <ellipse cx="118" cy="200" rx="20" ry="26" className={`isd-shade ${rightOn ? "isd-shade-on" : ""}`} />
    </svg>
  );
}

/**
 * Real, clean anatomical silhouette (front/back torso + separate
 * arms), matching the approved mockup's simple mannequin-style
 * illustration. Every region is a real, generously-sized <button> —
 * not a tiny SVG-shape click target — so it's reliably tappable on a
 * phone. Left/right halves of each torso are two large overlapping
 * buttons positioned over the same illustration (so there's only one
 * torso drawing per view, matching the mockup, not a duplicated one
 * per side). The shaded ellipse is purely decorative; the button
 * covering that half is what actually registers the tap.
 */
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
          <button type="button" className="isd-tap-overlay isd-tap-full" onClick={() => onSelect("LEFT_ARM")} aria-label="Left Arm" />
          <ArmSvg on={is("LEFT_ARM")} />
        </div>

        <div className="isd-torso-col">
          <button type="button" className="isd-tap-overlay isd-tap-left" onClick={() => onSelect("LEFT_ABDOMEN")} aria-label="Left Abdomen" />
          <button type="button" className="isd-tap-overlay isd-tap-right" onClick={() => onSelect("RIGHT_ABDOMEN")} aria-label="Right Abdomen" />
          <FrontTorsoSvg leftOn={is("LEFT_ABDOMEN")} rightOn={is("RIGHT_ABDOMEN")} />
        </div>

        <div className="isd-torso-col">
          <button type="button" className="isd-tap-overlay isd-tap-left" onClick={() => onSelect("LEFT_GLUTE")} aria-label="Left Glute" />
          <button type="button" className="isd-tap-overlay isd-tap-right" onClick={() => onSelect("RIGHT_GLUTE")} aria-label="Right Glute" />
          <BackTorsoSvg leftOn={is("LEFT_GLUTE")} rightOn={is("RIGHT_GLUTE")} />
        </div>

        <div className="isd-limb-col">
          <button type="button" className="isd-tap-overlay isd-tap-full" onClick={() => onSelect("RIGHT_ARM")} aria-label="Right Arm" />
          <ArmSvg on={is("RIGHT_ARM")} />
        </div>
      </div>

      <div className="isd-radio-row">
        {INJECTION_SITES.map((s) => (
          <button key={s.key} type="button" className="isd-site-col" onClick={() => onSelect(s.key)}>
            <span className={`isd-radio ${is(s.key) ? "isd-radio-on" : ""} ${suggestedSite === s.key && !is(s.key) ? "isd-radio-suggested" : ""}`}>
              {is(s.key) && "✓"}
            </span>
            <span className="isd-site-label">{s.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
