"use client";

import { useRef, useState } from "react";
import { WAIVER_CERTIFY, WAIVER_PREAMBLE, WAIVER_SECTIONS, WAIVER_SUBTITLE, WAIVER_TITLE, validateWaiver, type Answers } from "@/lib/forms/onboarding-forms";
import { Cards, Nav, Progress, SignaturePad } from "@/components/forms/FormKit";

const TONES = ["sand", "olive", "sand", "olive", "sand", "olive", "sand"] as const;
const ESIGN = "I agree to sign electronically. My drawn signature has the same validity as a handwritten signature.";

export default function AlmostDoneNative({ client }: { client: { firstName: string; lastName: string; email: string } }) {
  const [a, setA] = useState<Answers>({});
  const [step, setStep] = useState(-1); // -1 intro · 0..6 sections · 7 sign · 8 done
  const [error, setError] = useState("");
  const [first, setFirst] = useState(client.firstName);
  const [last, setLast] = useState(client.lastName);
  const [signature, setSignature] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const N = WAIVER_SECTIONS.length;
  const total = N + 1;

  const go = (n: number) => {
    setStep(n);
    setError("");
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submit = async () => {
    const invalid = validateWaiver(a);
    if (invalid) return setError(invalid);
    if (!first.trim() || !last.trim()) return setError("please enter your first and last name.");
    if (!signature) return setError("please draw your signature in the box.");
    if (!agree) return setError("please accept the electronic signature to continue.");
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/portal/almost-done", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: a, firstName: first.trim(), lastName: last.trim(), signature, agree }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "we couldn't save your agreement. please try again.");
      go(N + 1);
      setTimeout(() => window.location.assign("/portal/onboarding/welcome"), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "we couldn't save your agreement. please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (step === -1) {
    const [heading, ...rest] = WAIVER_PREAMBLE.split("\n\n");
    return (
      <div ref={top} className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in">
          <p className="bp2-logo">body shaper system™</p>
          <p className="bp2-eyebrow">step 2 of 2 · almost ready™</p>
          <h3 className="bp2-title">{WAIVER_TITLE.toLowerCase()}</h3>
          <p className="bp2-hint">{WAIVER_SUBTITLE}</p>
          <div className="of-legal">
            <h4>{heading}</h4>
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="bp2-time">7 short sections · ≈ 3 minutes</p>
          <Nav onNext={() => go(0)} nextLabel="begin" />
        </div>
      </div>
    );
  }

  if (step === N + 1)
    return (
      <div ref={top} className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in bp2-done">
          <p className="bp2-logo">body shaper system™</p>
          <span className="bp2-bigcheck" aria-hidden="true" />
          <h3>
            you're all set, <em>{client.firstName.toLowerCase()}</em>
          </h3>
          <p className="bp2-lead">your client agreement is signed. a copy is saved in your private portal and we've sent you a confirmation by email.</p>
          <div className="of-done-actions">
            <a className="bp2-btn champagne" href="/portal/onboarding/welcome">
              opening your portal… <span className="bp2-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    );

  if (step === N) {
    const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" });
    return (
      <div ref={top} className="bp2 tone-sand">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in">
          <p className="bp2-logo">body shaper system™</p>
          <Progress i={total} n={total} />
          <h3 className="bp2-title">confirm &amp; sign</h3>
          <div className="of-legal">
            <p>{WAIVER_CERTIFY}</p>
          </div>
          <p className="bp2-sub">Client Name *</p>
          <div className="of-row">
            <label className="bp2-field">
              <span>First Name</span>
              <input value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" maxLength={80} />
            </label>
            <label className="bp2-field">
              <span>Last Name</span>
              <input value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" maxLength={80} />
            </label>
          </div>
          <p className="bp2-sub">Client&apos;s Signature *</p>
          <SignaturePad onChange={setSignature} />
          <p className="of-date">Today&apos;s Date: {today}</p>
          <div className="of-agree">
            <Cards label="electronic signature consent" options={[ESIGN]} multi value={agree ? [ESIGN] : []} onChange={(v) => setAgree((v as string[]).length > 0)} />
          </div>
          {error ? (
            <p className="bp2-error" role="alert">
              {error}
            </p>
          ) : null}
          <Nav onBack={() => go(N - 1)} onNext={submit} nextLabel="confirm & sign" busy={busy} />
        </div>
      </div>
    );
  }

  const s = WAIVER_SECTIONS[step];
  const [num, name] = s.title.split(" — ");
  const next = () => {
    if (a[s.agree.id] !== s.agree.label) return setError(`please confirm “${s.agree.label.toLowerCase()}” to continue.`);
    if (s.choice && !a[s.choice.id]) return setError("please choose one option for marketing & content.");
    go(step + 1);
  };
  return (
    <div ref={top} className={`bp2 tone-${TONES[step]}`}>
      <div className="bp2-bg" aria-hidden="true" />
      <div className="bp2-in" key={s.id}>
        <p className="bp2-logo">body shaper system™</p>
        <Progress i={step + 1} n={total} />
        <p className="bp2-eyebrow" style={{ marginTop: 0 }}>
          {num.toLowerCase()}
        </p>
        <h3 className="bp2-title">{name.toLowerCase()}</h3>
        <div className="of-legal" style={{ marginTop: 16 }}>
          <h4>{s.title}</h4>
          {s.subtitle ? <h5>{s.subtitle}</h5> : null}
          <p>{s.text}</p>
        </div>
        <div className="of-agree">
          <Cards label={s.agree.label} options={[s.agree.label]} multi value={a[s.agree.id] ? [s.agree.label] : []} onChange={(v) => setA((p) => ({ ...p, [s.agree.id]: (v as string[]).length ? s.agree.label : "" }))} />
        </div>
        {s.extra && s.choice ? (
          <>
            <div className="of-legal" style={{ marginTop: 18 }}>
              <h5 style={{ marginTop: 0 }}>{s.extra.subtitle}</h5>
              <p>{s.extra.text}</p>
            </div>
            <p className="bp2-sub">{s.choice.label} *</p>
            <Cards label={s.choice.label} options={s.choice.options} value={a[s.choice.id]} onChange={(v) => setA((p) => ({ ...p, [s.choice!.id]: v }))} />
          </>
        ) : null}
        {error ? (
          <p className="bp2-error" role="alert">
            {error}
          </p>
        ) : null}
        <Nav onBack={() => go(step - 1)} onNext={next} />
      </div>
    </div>
  );
}
