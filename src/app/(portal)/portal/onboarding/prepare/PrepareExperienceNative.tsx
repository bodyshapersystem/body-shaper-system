"use client";

import { useEffect, useRef, useState } from "react";
import { PREPARE_INTRO, PREPARE_QUESTIONS, PREPARE_STEPS, prepareVisible, validatePrepare, type Answers } from "@/lib/forms/onboarding-forms";
import { Cards, Nav, Progress, Question, SignaturePad } from "@/components/forms/FormKit";

const Q = Object.fromEntries(PREPARE_QUESTIONS.map((q) => [q.id, q]));
const EXCLUSIVE: Record<string, string[]> = { "103": ["None of the above"], "106": ["None of the Above"], "32": ["None"] };
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0);
const DRAFT = "bss-prepare-draft-v2";

type Prefill = { firstName: string; lastName: string; email: string; phone: string };

export default function PrepareExperienceNative({ client }: { client: Prefill }) {
  const base: Answers = { "3_first": client.firstName, "3_last": client.lastName, "4": client.email, "8": client.phone };
  const [a, setA] = useState<Answers>(base);
  const [step, setStep] = useState(-1); // -1 intro, 0..n-1 questions, n signature, n+1 done
  const [bad, setBad] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [signedName, setSignedName] = useState(`${client.firstName} ${client.lastName}`.trim());
  const [signature, setSignature] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const N = PREPARE_STEPS.length;

  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT) || "null");
      if (d && typeof d === "object") setA({ ...d, "4": client.email });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify(a));
    } catch {}
  }, [a]);
  const go = (n: number) => {
    setStep(n);
    setError("");
    setBad([]);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const set = (id: string, v: string | string[]) => setA((p) => ({ ...p, [id]: v }));

  const checkStep = (i: number) => {
    const ids = PREPARE_STEPS[i].questions.filter((id) => prepareVisible(id, a));
    const missing = ids.filter((id) => Q[id].required && !filled(a[id]));
    const q107 = Q["107"];
    if (ids.includes("107") && q107.kind === "multi" && (a["107"] as string[] | undefined)?.length !== q107.options.length) missing.push("107");
    if (ids.includes("4") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a["4"] || ""))) missing.push("4");
    for (const t of ["8", "11"]) if (ids.includes(t) && String(a[t] || "").replace(/\D/g, "").length < 10) missing.push(t);
    if (missing.length) {
      setBad(missing);
      setError(missing.includes("107") ? "please confirm each statement to continue." : "please complete the highlighted answers.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    const invalid = validatePrepare(a);
    if (invalid) return setError(invalid);
    if (signedName.trim().length < 3) return setError("please type your full legal name.");
    if (!signature) return setError("please draw your signature in the box.");
    if (!agree) return setError("please accept the electronic signature to continue.");
    setBusy(true);
    setError("");
    try {
      const answers = Object.fromEntries(Object.entries(a).filter(([id]) => Q[id] && prepareVisible(id, a)));
      const r = await fetch("/api/portal/prepare-experience", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers, signedName: signedName.trim(), signature, agree }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "we couldn't save your evaluation. please try again.");
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {}
      go(N + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "we couldn't save your evaluation. please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (step === -1)
    return (
      <div ref={top} className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in bp2-intro">
          <p className="bp2-logo">body shaper system™</p>
          <p className="bp2-eyebrow">step 1 of 2 · before your first session</p>
          <h3>
            prepare your <em>experience™</em>
          </h3>
          <p className="bp2-lead small">body blueprint™ pre-treatment evaluation</p>
          <p className="bp2-lead">{PREPARE_INTRO}</p>
          <p className="bp2-time">≈ 5 minutes · your answers are private</p>
          <div style={{ marginTop: 22 }}>
            <button type="button" className="bp2-btn champagne" onClick={() => go(0)}>
              begin <span className="bp2-arrow" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );

  if (step === N + 1)
    return (
      <div ref={top} className="bp2 tone-burgundy">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in bp2-done">
          <p className="bp2-logo">body shaper system™</p>
          <span className="bp2-bigcheck" aria-hidden="true" />
          <h3>
            thank you, <em>{client.firstName.toLowerCase()}</em>
          </h3>
          <p className="bp2-lead">your evaluation is signed and saved in your private portal. one last step: your client agreement.</p>
          <div className="of-done-actions">
            <a className="bp2-btn champagne" href="/portal/onboarding/almost-done">
              continue to almost ready™ <span className="bp2-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    );

  if (step === N) {
    const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" });
    return (
      <div ref={top} className="bp2 tone-sand">
        <div className="bp2-bg" aria-hidden="true" />
        <div className="bp2-in">
          <p className="bp2-logo">body shaper system™</p>
          <Progress i={N + 1} n={N + 1} />
          <h3 className="bp2-title">sign your evaluation</h3>
          <p className="bp2-hint">your signature confirms the answers you provided.</p>
          <label className="bp2-field">
            <span>Client Signature — full legal name *</span>
            <input value={signedName} onChange={(e) => setSignedName(e.target.value)} autoComplete="name" maxLength={150} />
          </label>
          <p className="bp2-sub">Firma</p>
          <SignaturePad onChange={setSignature} />
          <p className="of-date">Date: {today}</p>
          <div className="of-agree">
            <Cards label="electronic signature consent" options={["I agree to sign electronically. My drawn signature and typed name have the same validity as a handwritten signature."]} multi value={agree ? ["I agree to sign electronically. My drawn signature and typed name have the same validity as a handwritten signature."] : []} onChange={(v) => setAgree((v as string[]).length > 0)} />
          </div>
          {error ? (
            <p className="bp2-error" role="alert">
              {error}
            </p>
          ) : null}
          <Nav onBack={() => go(N - 1)} onNext={submit} nextLabel="complete evaluation" busy={busy} />
        </div>
      </div>
    );
  }

  const s = PREPARE_STEPS[step];
  return (
    <div ref={top} className={`bp2 tone-${s.tone}`}>
      <div className="bp2-bg" aria-hidden="true" />
      <div className="bp2-in" key={s.key}>
        <p className="bp2-logo">body shaper system™</p>
        <Progress i={step + 1} n={N + 1} />
        <h3 className="bp2-title">{s.title}</h3>
        {s.hint ? <p className="bp2-hint">{s.hint}</p> : null}
        <div className="bp2-form">
          {s.questions
            .filter((id) => prepareVisible(id, a))
            .map((id) => (
              <Question key={id} q={Q[id]} value={a[id]} onChange={(v) => set(id, v)} invalid={bad.includes(id)} locked={id === "4"} exclusive={EXCLUSIVE[id]} />
            ))}
        </div>
        {error ? (
          <p className="bp2-error" role="alert">
            {error}
          </p>
        ) : null}
        <Nav onBack={() => go(step - 1)} onNext={() => checkStep(step) && go(step + 1)} />
      </div>
    </div>
  );
}
