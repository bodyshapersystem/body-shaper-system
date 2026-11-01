"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { blueprintSections } from "./blueprint-fields";
import BodySilhouette, { BODY_AREAS } from "@/components/blueprint/BodySilhouette";
import MiamiMap, { ZONE_OPTIONS } from "@/components/blueprint/MiamiMap";

/**
 * Build Your Blueprint™ — interactive, step-by-step version of the native form.
 * Same field ids, options and validation as blueprint-fields.ts (the Hub reads those), one
 * question or small group per screen, answers kept when going back, same /api/intake/blueprint.
 */

type Answers = Record<string, string | string[]>;
const FIELDS = Object.fromEntries(blueprintSections.flatMap((s) => s.fields.map((f) => [f.id, f]))) as Record<string, { id: string; label: string; type: string; required?: boolean; options?: readonly string[] }>;
const opts = (id: string) => (FIELDS[id]?.options ?? []) as readonly string[];
const DRAFT_KEY = "bss-blueprint-draft-v2";

type Step = {
  key: string;
  tone: "burgundy" | "sand" | "olive";
  title: string;
  hint?: string;
  required: string[]; // field ids required on this step (when visible)
};

const STEPS: Step[] = [
  { key: "intro", tone: "burgundy", title: "discover your personalized strategy", required: [] },
  { key: "areas", tone: "sand", title: "where would you like to focus?", hint: "tap the body or the cards — choose as many as you like.", required: ["areas"] },
  { key: "goals", tone: "olive", title: "what would you like to improve?", hint: "select all that apply.", required: ["goals"] },
  { key: "timeline", tone: "sand", title: "when would you like to begin?", required: ["startTimeline", "hasEvent"] },
  { key: "experience", tone: "olive", title: "have you had body treatments before?", hint: "select all that apply.", required: ["previousTreatments"] },
  { key: "challenge", tone: "sand", title: "what has been your biggest challenge?", hint: "select all that apply.", required: ["biggestChallenge"] },
  { key: "priorities", tone: "olive", title: "what matters most to you?", hint: "select all that apply.", required: ["priorities"] },
  { key: "investment", tone: "sand", title: "preferred investment option", required: ["investment"] },
  { key: "location", tone: "olive", title: "where are you located?", hint: "tap your area on the map or choose it below. we only need the area, never your address.", required: ["city"] },
  { key: "access", tone: "sand", title: "a few details for your visit", required: ["referralSource"] },
  { key: "about", tone: "sand", title: "let's make it personal.", hint: "tell us how to reach you.", required: ["firstName", "lastName", "email", "phone", "ageRange"] },
  { key: "vision", tone: "burgundy", title: "imagine we're celebrating your results three months from now.", hint: "what would make you say: “i'm so glad i did this.” (optional)", required: [] },
  { key: "review", tone: "olive", title: "your blueprint in review", hint: "please confirm before sending.", required: [] },
];
const QUESTION_STEPS = STEPS.length - 2; // intro & review are not counted as questions

function visible(id: string, a: Answers) {
  if (id === "eventDate" || id === "eventType") return a.hasEvent === "Yes";
  if (id === "previousExperience") return Array.isArray(a.previousTreatments) && a.previousTreatments.some((t) => t !== "None");
  if (id === "referredBy") return Array.isArray(a.referralSource) && a.referralSource.some((r) => r === "Friend / Family" || r === "Existing Client");
  return true;
}
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0);

export default function InteractiveBlueprint() {
  const [a, setA] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [hp, setHp] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const s = STEPS[step];

  // keep an unsent draft on this device only (convenience; never required)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setA(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(a));
    } catch {
      /* storage unavailable */
    }
  }, [a]);

  const set = (id: string, v: string | string[]) => {
    setError("");
    setA((p) => ({ ...p, [id]: v }));
  };
  const toggle = (id: string, v: string) => {
    const cur = Array.isArray(a[id]) ? (a[id] as string[]) : [];
    let next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    if (id === "previousTreatments") next = v === "None" && !cur.includes("None") ? ["None"] : next.filter((x) => x !== "None" || v === "None");
    set(id, next);
  };

  const go = (n: number) => {
    setError("");
    setStep(n);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  function validate(): string {
    for (const id of s.required) if (visible(id, a) && !filled(a[id])) return "please complete the highlighted question to continue.";
    if (s.key === "about") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a.email || ""))) return "please enter a valid email address.";
      if (String(a.phone || "").replace(/\D/g, "").length < 10) return "please enter a valid phone number.";
    }
    return "";
  }

  function next() {
    const e = validate();
    if (e) return setError(e);
    go(step + 1);
  }

  async function submit() {
    // final check across every step
    for (let i = 1; i < STEPS.length - 1; i++) {
      const missing = STEPS[i].required.find((id) => visible(id, a) && !filled(a[id]));
      if (missing) {
        setError("one question still needs an answer.");
        return go(i);
      }
    }
    setSending(true);
    setError("");
    const payload: Answers = {};
    for (const [k, v] of Object.entries(a)) if (visible(k, a)) payload[k] = v;
    try {
      const res = await fetch("/api/intake/blueprint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, website: hp }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "we couldn't send your blueprint. please try again.");
      if (typeof window !== "undefined") window.gtag?.("event", "generate_lead", { event_category: "conversion", form_name: "interactive_body_blueprint" });
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setDone(true);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message.toLowerCase() : "we couldn't send your blueprint.");
    } finally {
      setSending(false);
    }
  }

  const chips = (id: string, multi: boolean, options: readonly string[] = opts(id)) => (
    <div className={`bp2-cards${options.length > 6 ? " two" : ""}`} role="group" aria-label={FIELDS[id]?.label}>
      {options.map((o) => {
        const on = multi ? Array.isArray(a[id]) && (a[id] as string[]).includes(o) : a[id] === o;
        return (
          <button key={o} type="button" className={`bp2-card${on ? " on" : ""}`} aria-pressed={on} onClick={() => (multi ? toggle(id, o) : set(id, o))}>
            <span>{o.toLowerCase()}</span>
            <i className="bp2-tick" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
  const text = (id: string, props: { type?: string; placeholder?: string; autoComplete?: string; optional?: boolean } = {}) => (
    <label className={`bp2-field${s.required.includes(id) && error && !filled(a[id]) ? " err" : ""}`}>
      <span>
        {FIELDS[id].label.toLowerCase()}
        {props.optional ? <em> (optional)</em> : FIELDS[id].required ? " *" : ""}
      </span>
      <input
        type={props.type ?? "text"}
        value={String(a[id] ?? "")}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        maxLength={props.type === "email" ? 254 : props.type === "tel" ? 32 : 150}
        onChange={(e) => set(id, e.target.value)}
      />
    </label>
  );
  const area = (id: string, placeholder: string) => (
    <label className="bp2-field">
      <span>
        {FIELDS[id].label.toLowerCase()} <em>(optional)</em>
      </span>
      <textarea rows={3} maxLength={3000} value={String(a[id] ?? "")} placeholder={placeholder} onChange={(e) => set(id, e.target.value)} />
    </label>
  );
  const sub = (label: string) => <p className="bp2-sub">{label.toLowerCase()}</p>;

  const zoneLabel = useMemo(() => ZONE_OPTIONS.find((z) => z.id === a.zoneId)?.label ?? String(a.city ?? ""), [a.zoneId, a.city]);
  const progress = Math.max(0, Math.min(step, QUESTION_STEPS));

  if (done) {
    return (
      <div ref={topRef} id="native-blueprint" className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in bp2-done" role="status">
          <p className="bp2-logo">body shaper system™</p>
          <span className="bp2-bigcheck" aria-hidden="true" />
          <h3>
            thank you{a.firstName ? `, ${String(a.firstName).toLowerCase()}` : ""}.
            <br />
            <em>your blueprint has been received.</em>
          </h3>
          <p className="bp2-lead">your body is unique. your strategy should be too.</p>
          <p className="bp2-lead small">our team will personally review your answers and prepare your next steps. we&apos;ll reach out by email or whatsapp soon.</p>
          <p className="bp2-foot">science · strategy · transformation</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} id="native-blueprint" className={`bp2 tone-${s.tone}`}>
      <div className="bp2-bg" aria-hidden="true" />
      <div className="bp2-in" key={s.key}>
        <p className="bp2-logo">body shaper system™</p>
        {step > 0 && step <= QUESTION_STEPS && (
          <div className="bp2-progress" role="progressbar" aria-label="blueprint progress" aria-valuemin={1} aria-valuemax={QUESTION_STEPS} aria-valuenow={progress}>
            <span className="bp2-count">
              {String(progress).padStart(2, "0")} / {String(QUESTION_STEPS).padStart(2, "0")}
            </span>
            <span className="bp2-bar">
              <i style={{ width: `${(progress / QUESTION_STEPS) * 100}%` }} />
            </span>
          </div>
        )}

        {s.key === "intro" ? (
          <div className="bp2-intro">
            <p className="bp2-eyebrow">the body blueprint™</p>
            <h3>
              discover your <em>personalized strategy</em>
            </h3>
            <p className="bp2-lead">your body is unique. your strategy should be too. a quick, visual experience to understand your goals.</p>
            <ul className="bp2-pillars">
              <li>
                <i style={{ ["--ic" as string]: "url(/proposal-assets/brand/icons/line-target-cross.png)" }} />
                evaluate your goals
              </li>
              <li>
                <i style={{ ["--ic" as string]: "url(/proposal-assets/brand/icons/line-contour-waves.png)" }} />
                define your focus
              </li>
              <li>
                <i style={{ ["--ic" as string]: "url(/proposal-assets/brand/icons/line-arch-spiral.png)" }} />
                receive a personalized plan
              </li>
            </ul>
            <button type="button" className="bp2-btn champagne" onClick={() => go(1)}>
              start my blueprint <i className="bp2-arrow" aria-hidden="true" />
            </button>
            <p className="bp2-time">about 2 minutes</p>
          </div>
        ) : (
          <>
            <h3 className="bp2-title">{s.title}</h3>
            {s.hint && <p className="bp2-hint">{s.hint}</p>}

            <div className="bp2-body">
              {s.key === "areas" && (
                <>
                  <BodySilhouette selected={(a.areas as string[]) ?? []} onToggle={(z) => toggle("areas", z)} />
                  {chips("areas", true, BODY_AREAS)}
                </>
              )}
              {s.key === "goals" && (
                <>
                  {chips("goals", true)}
                  {area("oneChange", "in your own words…")}
                </>
              )}
              {s.key === "timeline" && (
                <>
                  {chips("startTimeline", false)}
                  {sub("do you have an upcoming event?")}
                  {chips("hasEvent", false)}
                  {visible("eventDate", a) && (
                    <div className="bp2-reveal">
                      {sub("what are you preparing for?")}
                      {chips("eventType", false)}
                      {text("eventDate", { type: "date", optional: true })}
                    </div>
                  )}
                </>
              )}
              {s.key === "experience" && (
                <>
                  {chips("previousTreatments", true)}
                  {visible("previousExperience", a) && (
                    <div className="bp2-reveal">
                      {sub("how was your experience?")}
                      {chips("previousExperience", false)}
                    </div>
                  )}
                </>
              )}
              {s.key === "challenge" && chips("biggestChallenge", true)}
              {s.key === "priorities" && chips("priorities", true)}
              {s.key === "investment" && chips("investment", false)}
              {s.key === "location" && (
                <MiamiMap
                  value={(a.zoneId as string) || null}
                  onChange={(id) => {
                    const o = ZONE_OPTIONS.find((z) => z.id === id);
                    setError("");
                    setA((p) => ({ ...p, zoneId: id ?? "", city: o ? o.label.replace(/\b\w/g, (c) => c.toUpperCase()) : "" }));
                  }}
                />
              )}
              {s.key === "access" && (
                <>
                  {sub("does your building require any of the following? (optional)")}
                  {chips("buildingAccess", true)}
                  {sub("how did you hear about us? *")}
                  {chips("referralSource", true)}
                  {visible("referredBy", a) && <div className="bp2-reveal">{text("referredBy", { optional: true })}</div>}
                  <p className="bp2-fine">valet or paid parking fees, when applicable, are not included in your treatment price and will be the client&apos;s responsibility. locations outside our standard service area may incur a travel fee, confirmed before booking.</p>
                </>
              )}
              {s.key === "about" && (
                <div className="bp2-form">
                  {text("firstName", { autoComplete: "given-name", placeholder: "first name" })}
                  {text("lastName", { autoComplete: "family-name", placeholder: "last name" })}
                  {text("email", { type: "email", autoComplete: "email", placeholder: "you@email.com" })}
                  {text("phone", { type: "tel", autoComplete: "tel", placeholder: "(305) 555-1234" })}
                  {sub("age range *")}
                  <div className="bp2-ages">{chips("ageRange", false)}</div>
                  {zoneLabel && (
                    <button type="button" className="bp2-chiprow" onClick={() => go(STEPS.findIndex((x) => x.key === "location"))}>
                      <span className="mm-pin" aria-hidden="true" /> your area: <b>{zoneLabel}</b> <span className="bp2-edit">edit</span>
                    </button>
                  )}
                  <input className="bp2-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" name="website" />
                </div>
              )}
              {s.key === "vision" && area("vision", "in your own words…")}
              {s.key === "review" && (
                <dl className="bp2-review">
                  {[
                    ["focus areas", (a.areas as string[])?.join(", "), "areas"],
                    ["goals", (a.goals as string[])?.join(", "), "goals"],
                    ["timeline", [a.startTimeline, a.hasEvent === "Yes" ? `event: ${a.eventType ?? ""} ${a.eventDate ?? ""}` : ""].filter(Boolean).join(" · "), "timeline"],
                    ["previous treatments", (a.previousTreatments as string[])?.join(", "), "experience"],
                    ["biggest challenge", (a.biggestChallenge as string[])?.join(", "), "challenge"],
                    ["what matters most", (a.priorities as string[])?.join(", "), "priorities"],
                    ["investment", a.investment, "investment"],
                    ["area", zoneLabel, "location"],
                    ["contact", [`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim(), a.email, a.phone, a.ageRange ? `age ${a.ageRange}` : ""].filter(Boolean).join(" · "), "about"],
                  ].map(([k, v, target]) => (
                    <div key={k as string}>
                      <dt>{k as string}</dt>
                      <dd>{String(v || "—").toLowerCase()}</dd>
                      <button type="button" className="bp2-edit" onClick={() => go(STEPS.findIndex((x) => x.key === target))}>
                        edit
                      </button>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {error && (
              <p className="bp2-error" role="alert">
                {error}
              </p>
            )}
            <div className="bp2-nav">
              <button type="button" className="bp2-back" onClick={() => go(step - 1)} aria-label="back">
                <i className="bp2-arrow left" aria-hidden="true" /> back
              </button>
              {s.key === "review" ? (
                <button type="button" className="bp2-btn burgundy" onClick={submit} disabled={sending}>
                  {sending ? "sending…" : "send my blueprint"} <i className="bp2-arrow" aria-hidden="true" />
                </button>
              ) : (
                <button type="button" className="bp2-btn burgundy" onClick={next}>
                  {s.required.length === 0 ? "continue" : "continue"} <i className="bp2-arrow" aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
