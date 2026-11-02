"use client";

import { useEffect, useRef, useState } from "react";
import type { Q } from "@/lib/forms/onboarding-forms";
import "@/app/(site)/body-blueprint/interactive-blueprint.css";
import "./onboarding-forms.css";

/** Shared building blocks for the native onboarding forms (same look as Build Your Blueprint™). */

export function Cards({ options, value, multi, onChange, exclusive = [], label }: { options: string[]; value: string | string[] | undefined; multi?: boolean; onChange: (v: string | string[]) => void; exclusive?: string[]; label: string }) {
  const sel = Array.isArray(value) ? value : value ? [value] : [];
  const two = options.length > 5 && options.every((o) => o.length < 26);
  return (
    <div className={`bp2-cards${two ? " two" : ""}`} role={multi ? "group" : "radiogroup"} aria-label={label}>
      {options.map((o) => {
        const on = sel.includes(o);
        return (
          <button
            key={o}
            type="button"
            className={`bp2-card${on ? " on" : ""}`}
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            onClick={() => {
              if (!multi) return onChange(o);
              if (on) return onChange(sel.filter((x) => x !== o));
              if (exclusive.includes(o)) return onChange([o]);
              onChange([...sel.filter((x) => !exclusive.includes(x)), o]);
            }}
          >
            <span>{o}</span>
            <span className="bp2-tick" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export function Question({ q, value, onChange, invalid, locked, exclusive }: { q: Q; value: string | string[] | undefined; onChange: (v: string | string[]) => void; invalid?: boolean; locked?: boolean; exclusive?: string[] }) {
  if (q.kind === "single" || q.kind === "multi") {
    return (
      <div className={`of-q bp2-reveal${invalid ? " err" : ""}`}>
        <p className="bp2-sub">
          {q.label}
          {q.required ? <span aria-hidden="true"> *</span> : null}
        </p>
        {q.hint ? <p className="of-qhint">{q.hint}</p> : null}
        <Cards options={q.options} value={value} multi={q.kind === "multi"} onChange={onChange} exclusive={exclusive} label={q.label} />
      </div>
    );
  }
  const common = {
    value: typeof value === "string" ? value : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder: "placeholder" in q ? q.placeholder : undefined,
    "aria-invalid": invalid || undefined,
    readOnly: locked,
  };
  return (
    <label className={`bp2-field bp2-reveal${invalid ? " err" : ""}`}>
      <span>
        {q.label}
        {q.required ? " *" : <em> (optional)</em>}
      </span>
      {q.kind === "textarea" ? (
        <textarea rows={3} maxLength={2000} {...common} />
      ) : (
        <input
          type={q.kind === "tel" ? "tel" : q.kind === "email" ? "email" : q.kind === "date" ? "date" : "text"}
          inputMode={q.kind === "tel" ? "tel" : undefined}
          autoComplete={AUTO[q.id]}
          maxLength={200}
          {...common}
        />
      )}
      {locked ? <small className="of-locked">linked to your client portal</small> : null}
    </label>
  );
}
const AUTO: Record<string, string> = { "3_first": "given-name", "3_last": "family-name", "4": "email", "8": "tel", "7": "bday", "9_street": "address-line1", "9_unit": "address-line2", "9_city": "address-level2", "9_zip": "postal-code" };

/** Finger / mouse signature pad. Emits a white-background JPEG data URL, or null when cleared. */
export function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const ink = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  const setup = () => {
    const c = ref.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e1416";
    ctx.lineWidth = 2.4;
    ink.current = 0;
    setEmpty(true);
  };
  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const emit = () => {
    if (ink.current < 25) return onChange(null); // a dot or a tiny tick is not a signature
    onChange(ref.current!.toDataURL("image/jpeg", 0.85));
  };
  return (
    <div className="of-sig">
      <canvas
        ref={ref}
        className="of-sigpad"
        aria-label="signature pad — draw your signature with your finger"
        role="img"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = pos(e);
          const ctx = ref.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
          ctx.fillStyle = "#1e1416";
          ctx.fill();
        }}
        onPointerMove={(e) => {
          if (!drawing.current || !last.current) return;
          const p = pos(e);
          const ctx = ref.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.moveTo(last.current.x, last.current.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ink.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
          last.current = p;
          if (empty) setEmpty(false);
        }}
        onPointerUp={() => {
          drawing.current = false;
          last.current = null;
          emit();
        }}
        onPointerCancel={() => {
          drawing.current = false;
          last.current = null;
          emit();
        }}
      />
      {empty ? <span className="of-sighint" aria-hidden="true">sign here with your finger</span> : null}
      <span className="of-sigline" aria-hidden="true" />
      <button
        type="button"
        className="bp2-edit of-clear"
        onClick={() => {
          setup();
          onChange(null);
        }}
      >
        clear
      </button>
    </div>
  );
}

export function Progress({ i, n }: { i: number; n: number }) {
  return (
    <div className="bp2-progress" aria-label={`step ${i} of ${n}`}>
      <span className="bp2-count">
        {String(i).padStart(2, "0")} / {String(n).padStart(2, "0")}
      </span>
      <span className="bp2-bar">
        <i style={{ width: `${(i / n) * 100}%` }} />
      </span>
    </div>
  );
}

export function Nav({ onBack, onNext, nextLabel = "continue", busy }: { onBack?: () => void; onNext: () => void; nextLabel?: string; busy?: boolean }) {
  return (
    <div className="bp2-nav">
      {onBack ? (
        <button type="button" className="bp2-back" onClick={onBack}>
          <span className="bp2-arrow left" aria-hidden="true" /> back
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="bp2-btn champagne" onClick={onNext} disabled={busy}>
        {busy ? "saving…" : nextLabel} {!busy && <span className="bp2-arrow" aria-hidden="true" />}
      </button>
    </div>
  );
}
