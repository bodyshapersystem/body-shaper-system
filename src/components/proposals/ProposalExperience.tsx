"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COPY, WHATSAPP_NUMBER } from "@/lib/proposals/copy";
import { money, TECHNOLOGIES, type GoalKey, type PaymentMode, type TechnologyKey, type ZoneKey } from "@/lib/proposals/types";
import type { ProposalView } from "@/lib/proposals/server";

const A = "/proposal-assets";
const ICON: Record<string, string> = {
  exilis: `${A}/brand/icons/line-contour-waves.png`,
  endospheres: `${A}/brand/icons/line-molecule.png`,
  ems: `${A}/brand/icons/line-target-cross.png`,
  protocol: `${A}/brand/icons/line-target-grid.png`,
  technology: `${A}/brand/icons/line-contour-waves.png`,
  guided: `${A}/brand/icons/line-arch-spiral.png`,
};
const STEP_ICONS = ["line-target-cross", "line-target-grid", "line-grid-circle", "line-contour-waves", "line-arch-spiral"];
function Ic({ src }: { src: string }) {
  return <span className="pp-ic" aria-hidden="true" style={{ ["--ic" as string]: `url(${src})` }} />;
}
const TECH_PHOTO: Record<TechnologyKey, { src: string; alt: string; pos: string } | null> = {
  exilis: { src: `${A}/technologies/exilis-ultra/exilis-ultra-session.webp`, alt: "exilis ultra session by body shaper system", pos: "50% 50%" },
  endospheres: { src: `${A}/technologies/endospheres/endospheres-roller-emmy.jpeg`, alt: "endospheres roller held by the founder", pos: "50% 30%" },
  ems: { src: `${A}/technologies/ems/emszero-applicator-emmy.jpeg`, alt: "ems applicator held by the founder", pos: "50% 45%" },
};

/** Marker positions on the official body diagram (828 × 1024). */
const ZONE_POINTS: Record<ZoneKey, [number, number][]> = {
  arms: [[268, 341], [441, 349]],
  waist: [[323, 426], [381, 426]],
  abdomen: [[352, 488]],
  glutes: [[276, 554], [428, 554]],
  legs: [[297, 658], [409, 654], [310, 812], [395, 812]],
};

type Props = { view: ProposalView; checkoutState?: string | null };

export default function ProposalExperience({ view, checkoutState }: Props) {
  const t = COPY[view.lang];
  const rootRef = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("welcome");
  const [focusZone, setFocusZone] = useState<ZoneKey | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);
  const firstKey = view.recommendedKey ?? view.programs[0]?.key ?? null;
  const [programKey, setProgramKey] = useState<string | null>(view.payment.programKey && view.programs.some((p) => p.key === view.payment.programKey) ? view.payment.programKey : firstKey);
  const [mode, setMode] = useState<PaymentMode>("full");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoMode, setPromoMode] = useState<PaymentMode>("full");
  const [techOpen, setTechOpen] = useState<TechnologyKey | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const program = useMemo(() => view.programs.find((p) => p.key === programKey) ?? view.programs[0], [programKey, view.programs]);
  const zoneLabels = view.zones.filter((z): z is ZoneKey => z in t.zones).map((z) => t.zones[z as ZoneKey]);
  const goalLabels = view.goals.filter((g): g is GoalKey => g in t.goals).map((g) => t.goals[g as GoalKey]);

  // ---- tracking (best-effort, never blocks the page) ----
  const track = useCallback(
    (type: string, data?: Record<string, unknown>) => {
      if (!view.token) return;
      fetch(`/api/proposals/${view.token}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...data }),
        keepalive: true,
      }).catch(() => undefined);
    },
    [view.token],
  );
  useEffect(() => {
    if (!view.token) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(`pp-view-${view.token.slice(0, 10)}`) === "1";
      sessionStorage.setItem(`pp-view-${view.token.slice(0, 10)}`, "1");
    } catch {
      /* storage unavailable */
    }
    if (!seen) track("view");
  }, [track, view.token]);

  // ---- reveal, lazy backgrounds, active section, top bar, steps line ----
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            reveal.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    root.querySelectorAll("[data-reveal], .pp-step").forEach((el) => (reduce ? el.classList.add("is-in") : reveal.observe(el)));

    const bg = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("bg-on");
            bg.unobserve(e.target);
          }
        }),
      { rootMargin: "700px 0px" },
    );
    root.querySelectorAll(".pp-sec").forEach((el) => bg.observe(el));

    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    root.querySelectorAll("section[id]").forEach((el) => spy.observe(el));

    const onScroll = () => {
      setSolid(window.scrollY > window.innerHeight * 0.55);
      const ol = stepsRef.current;
      if (ol) {
        const r = ol.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - r.top) / (r.height + window.innerHeight * 0.2)));
        ol.style.setProperty("--p", reduce ? "1" : p.toFixed(3));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      reveal.disconnect();
      bg.disconnect();
      spy.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (techOpen && !d.open) d.showModal();
    if (!techOpen && d.open) d.close();
  }, [techOpen]);

  const go = (id: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const choose = (key: string) => {
    setProgramKey(key);
    setError(null);
    track("select_program", { programKey: key });
  };

  async function bookAndPay() {
    if (!program || !view.token) return;
    if (mode === "split" && !consent) {
      setError(view.lang === "es" ? "confirma el calendario de las dos cuotas para continuar." : "please confirm the two-installment schedule to continue.");
      return;
    }
    setBusy("program");
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${view.token}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programKey: program.key, mode, consent: mode === "split" ? consent : false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "checkout unavailable");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "checkout unavailable");
      setBusy(null);
    }
  }

  async function bookPromo() {
    if (!view.token) return;
    setBusy("promo");
    setError(null);
    try {
      const res = await fetch(`/api/holiday-333/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: promoMode, proposalToken: view.token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "checkout unavailable");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "checkout unavailable");
      setBusy(null);
    }
  }

  const pricing = program?.pricing;
  const due = pricing ? (mode === "full" ? pricing.fullCents : pricing.split?.firstCents ?? pricing.fullCents) : 0;
  const paidProgram = view.payment.programKey ? view.programs.find((p) => p.key === view.payment.programKey) : null;
  const navItems: [string, string][] = [
    ["plan", t.nav.plan],
    ["goals", t.nav.goals],
    ["technology", t.nav.technology],
    ["process", t.nav.process],
    ["faq", t.nav.faq],
  ];
  const tech = techOpen ? t.tech[techOpen] : null;
  const waText = encodeURIComponent(view.lang === "es" ? "hola, tengo una pregunta sobre mi body blueprint." : "hi, i have a question about my body blueprint.");

  return (
    <div className="pp" ref={rootRef}>
      {/* ---------------------------------------------------------------- top bar */}
      <header className={`pp-top${solid ? " is-solid" : ""}`}>
        <a href="#welcome" className="pp-logo" onClick={go("welcome")} aria-label="body shaper system — back to top">
          body shaper system<sup>™</sup>
        </a>
        <nav className="pp-nav" aria-label={view.lang === "es" ? "secciones" : "sections"}>
          {navItems.map(([id, label], i) => (
            <a key={id} href={`#${id}`} onClick={go(id)} className={active === id || (id === "plan" && active === "payment") ? "is-active" : ""}>
              {i + 1}. {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* ------------------------------------------------------------ 01 welcome */}
        <section id="welcome" className="pp-sec pp-burgundy pp-hero bg-on" aria-labelledby="pp-title">
          <div className="pp-inner">
            <div>
              <p className="pp-coords" aria-hidden="true">
                25.7617° N
                <br />
                80.1918° W
                {view.locationLabel ? (
                  <>
                    <br />
                    {view.locationLabel}
                  </>
                ) : null}
              </p>
              <p className="pp-eyebrow pp-for" data-reveal>
                {t.preparedFor}
              </p>
              <p className="pp-name" data-reveal style={{ ["--d" as string]: "0.1s" }}>
                {view.clientName}
              </p>
              <h1 id="pp-title" data-reveal style={{ ["--d" as string]: "0.2s" }}>
                {t.title[0]} <em>{t.title[1]}</em>
              </h1>
              <p className="pp-lead" data-reveal style={{ ["--d" as string]: "0.3s" }}>
                {view.personalMessage || t.welcomeText(goalLabels, zoneLabels)}
              </p>
              <a href="#goals" className="pp-btn pp-btn-champagne" onClick={go("goals")} data-reveal style={{ ["--d" as string]: "0.4s" }}>
                {t.explore} <span className="pp-arrow down" aria-hidden="true" />
              </a>
              <ul className="pp-pillars" data-reveal style={{ ["--d" as string]: "0.5s", padding: 0 }}>
                {(["protocol", "technology", "guided"] as const).map((k, i) => (
                  <li key={k}>
                    <Ic src={ICON[k]} />
                    {t.pillars[i]}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`pp-arch${view.showWelcomeVideo ? "" : " is-empty"}`} data-reveal style={{ ["--d" as string]: "0.3s" }}>
              {view.showWelcomeVideo && view.welcomeVideoSrc ? (
                <video src={view.welcomeVideoSrc} autoPlay muted playsInline loop preload="metadata" aria-hidden="true" />
              ) : (
                <div className="pp-arch-words" aria-hidden="true">
                  <span>{view.lang === "es" ? "ciencia" : "science"}</span>
                  <span>{view.lang === "es" ? "estrategia" : "strategy"}</span>
                  <span>{view.lang === "es" ? "transformación" : "transformation"}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 02 goals */}
        <section id="goals" className="pp-sec pp-sand" aria-labelledby="pp-goals-title">
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              02 — {t.goalsEyebrow}
            </p>
            <h2 id="pp-goals-title" className="pp-h2" data-reveal>
              {t.goalsTitle}
            </h2>
            <p className="pp-lead" data-reveal>
              {t.goalsIntro}
            </p>
            <div className="pp-goals-grid">
              <div className="pp-diagram" data-reveal>
                <img src={`${A}/blueprint/body-diagram/body-diagram-official.jpg`} alt={view.lang === "es" ? "diagrama corporal body blueprint con tus zonas prioritarias" : "body blueprint diagram showing your priority zones"} width={828} height={1024} />
                {(Object.keys(ZONE_POINTS) as ZoneKey[]).map((z) =>
                  ZONE_POINTS[z].map(([x, y], i) => (
                    <span
                      key={`${z}${i}`}
                      className={`pp-mark${view.zones.includes(z) || focusZone === z ? " on" : ""}${focusZone === z ? " focus" : ""}`}
                      style={{ left: `${(x / 828) * 100}%`, top: `${(y / 1024) * 100}%` }}
                      aria-hidden="true"
                    />
                  )),
                )}
              </div>
              <div data-reveal>
                <p className="pp-label">{t.zonesLabel}</p>
                <div className="pp-chiprow" role="group" aria-label={t.zonesLabel}>
                  {(Object.keys(t.zones) as ZoneKey[]).map((z) => {
                    const on = view.zones.includes(z);
                    return (
                      <button
                        key={z}
                        type="button"
                        className={`pp-chip${on ? " on" : ""}${!on && focusZone !== z ? " dim" : ""}`}
                        aria-pressed={focusZone === z}
                        onClick={() => setFocusZone((f) => (f === z ? null : z))}
                      >
                        {t.zones[z]}
                      </button>
                    );
                  })}
                </div>
                <p className="pp-label">{t.goalsLabel}</p>
                <ul className="pp-goal-list">
                  {(goalLabels.length ? goalLabels : [t.goals.firmness, t.goals.contour]).map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 03 systems */}
        <section id="plan" className="pp-sec pp-sand" aria-labelledby="pp-plan-title" style={{ paddingTop: 40 }}>
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              03 — {t.systemsEyebrow}
            </p>
            <h2 id="pp-plan-title" className="pp-h2" data-reveal>
              {t.systemsTitle}
            </h2>
            <p className="pp-lead" data-reveal>
              {t.systemsIntro}
            </p>
            <div className="pp-cards" style={{ ["--n" as string]: String(Math.min(3, view.programs.length || 1)) }}>
              {view.programs.map((p, i) => {
                const open = openCard === p.key;
                const rec = view.recommendedKey === p.key;
                return (
                  <article key={p.key} className={`pp-card${rec ? " is-rec" : ""}`} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                    {rec && <span className="pp-badge">{t.recommended}</span>}
                    <button type="button" className="pp-card-head" aria-expanded={open} aria-controls={`pp-x-${p.key}`} onClick={() => setOpenCard(open ? null : p.key)}>
                      <span className="pp-opt">{t.option(i + 1)}</span>
                      <h3>{p.name}</h3>
                      <span className="pp-sessions">{t.technologySessions(p.total)}</span>
                    </button>
                    <ul className="pp-techrows">
                      {TECHNOLOGIES.filter((k) => p.sessions[k] > 0).map((k) => (
                        <li key={k}>
                          <Ic src={ICON[k]} />
                          <b>{p.sessions[k]}</b>
                          <span>{t.tech[k].name}</span>
                        </li>
                      ))}
                    </ul>
                    <p>{p.description}</p>
                    <div className="pp-price">
                      {t.from} <strong>{money(p.pricing.fullCents)}</strong>
                    </div>
                    <div id={`pp-x-${p.key}`} className={`pp-expand${open ? " open" : ""}`}>
                      <div>
                        <div className="pp-expand-body">
                          {p.focus.length > 0 && (
                            <div>
                              <span className="pp-label">{t.objectives}</span>
                              <ul>
                                {p.focus.map((f) => (
                                  <li key={f}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <span className="pp-regular">
                            {t.regular} {money(p.pricing.regularCents)} · {t.payFull} {money(p.pricing.fullCents)}
                            {p.pricing.split ? ` · ${t.pay2} ${money(p.pricing.split.firstCents)} + ${money(p.pricing.split.secondCents)}` : ""}
                          </span>
                          <button
                            type="button"
                            className="pp-btn pp-btn-burgundy"
                            onClick={() => {
                              choose(p.key);
                              go("payment")();
                            }}
                          >
                            {t.bookPay} <span className="pp-arrow" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="pp-btn pp-btn-line" style={{ marginTop: 14 }} aria-expanded={open} aria-controls={`pp-x-${p.key}`} onClick={() => setOpenCard(open ? null : p.key)}>
                      {open ? t.hideDetails : t.viewDetails} <span className="pp-arrow" aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 04 payment */}
        {program && pricing && (
          <section id="payment" className="pp-sec pp-burgundy pp-pay" aria-labelledby="pp-pay-title">
            <div className="pp-inner">
              <p className="pp-eyebrow" data-reveal>
                04 — {t.paymentEyebrow}
              </p>
              {checkoutState === "success" && <div className="pp-banner" role="status">{view.lang === "es" ? "gracias — estamos confirmando tu pago." : "thank you — we are confirming your payment."}</div>}
              {view.payment.status === "paid_in_full" && <div className="pp-banner" role="status">{t.paidFull}{paidProgram ? ` (${paidProgram.name})` : ""}</div>}
              {view.payment.status === "first_installment_paid" && <div className="pp-banner" role="status">{t.paidFirst(money(view.payment.balanceDueCents))}</div>}
              <div className="pp-pay-grid">
                <div data-reveal>
                  <span className="pp-label" style={{ color: "var(--ivory-soft)" }}>
                    {t.chooseProgram}
                  </span>
                  {view.programs.length > 1 && (
                    <div className="pp-seg" role="group" aria-label={t.chooseProgram}>
                      {view.programs.map((p) => (
                        <button key={p.key} type="button" aria-pressed={p.key === program.key} onClick={() => choose(p.key)}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <h2 id="pp-pay-title" className="pp-pay-name">
                    {program.name}
                  </h2>
                  <span className="pp-sessions" style={{ color: "var(--ivory-soft)" }}>
                    {t.technologySessions(program.total)}
                  </span>
                  <div className="pp-icons3">
                    {TECHNOLOGIES.map((k) => (
                      <div key={k}>
                        <Ic src={ICON[k]} />
                        <b>{program.sessions[k]}</b>
                        <span>{t.tech[k].name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="pp-lead" style={{ color: "var(--ivory-soft)" }}>
                    {program.description}
                  </p>
                </div>

                <div data-reveal>
                  <fieldset className="pp-options">
                    <legend className="pp-label" style={{ color: "var(--ivory-soft)" }}>
                      {t.choosePayment}
                    </legend>
                    <label className="pp-option">
                      <input type="radio" name="pp-mode" value="full" checked={mode === "full"} onChange={() => { setMode("full"); track("select_payment", { programKey: program.key, mode: "full" }); }} />
                      <span className="pp-radio" aria-hidden="true" />
                      <span>
                        <span className="pp-option-t">{t.payFull}</span>
                        {pricing.savingCents > 0 && <span className="pp-option-s">{t.payFullNote(money(pricing.savingCents))}</span>}
                      </span>
                      <span className="pp-option-p">{money(pricing.fullCents)}</span>
                    </label>
                    {pricing.split && (
                      <label className="pp-option">
                        <input type="radio" name="pp-mode" value="split" checked={mode === "split"} onChange={() => { setMode("split"); track("select_payment", { programKey: program.key, mode: "split" }); }} />
                        <span className="pp-radio" aria-hidden="true" />
                        <span>
                          <span className="pp-option-t">{t.pay2}</span>
                          <span className="pp-option-s">{t.pay2Note(money(pricing.split.firstCents), money(pricing.split.secondCents))}</span>
                        </span>
                        <span className="pp-option-p">
                          {money(pricing.split.firstCents)}
                          <small>{pricing.split.firstCents === pricing.split.secondCents ? t.each : "+ " + money(pricing.split.secondCents)}</small>
                        </span>
                      </label>
                    )}
                  </fieldset>
                  <div className="pp-due" aria-live="polite">
                    <span>{t.dueToday}</span>
                    <strong>{money(due)}</strong>
                  </div>
                  {mode === "split" && pricing.split && (
                    <label className="pp-consent">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                      <span>{t.consent(money(pricing.split.firstCents), money(pricing.split.secondCents))}</span>
                    </label>
                  )}
                  <button type="button" className="pp-btn pp-btn-champagne" onClick={bookAndPay} disabled={!view.token || busy !== null || (mode === "split" && !consent)}>
                    {busy === "program" ? t.redirecting : t.bookPay} <span className="pp-arrow" aria-hidden="true" />
                  </button>
                  {!view.token && <p className="pp-small"><i>i</i><span>{t.previewOnly}</span></p>}
                  {error && busy !== "promo" && <p className="pp-error" role="alert">{error}</p>}
                  <p className="pp-small">
                    <i aria-hidden="true">i</i>
                    <span>{t.scheduleNote}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ 05 technology */}
        <section id="technology" className="pp-sec pp-olive" aria-labelledby="pp-tech-title">
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              05 — {t.techEyebrow}
            </p>
            <h2 id="pp-tech-title" className="pp-h2" data-reveal>
              {t.techTitle}
            </h2>
            <p className="pp-lead" style={{ color: "var(--ivory-soft)" }} data-reveal>
              {t.techIntro}
            </p>
            <div className="pp-tech">
              {TECHNOLOGIES.map((k, i) => {
                const ph = TECH_PHOTO[k];
                return (
                  <article key={k} data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
                    <div className="pp-tech-photo">
                      {ph ? <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 600px) 30vw, 220px" style={{ objectFit: "cover", objectPosition: ph.pos }} /> : <span className="pp-placeholder">{t.photoPending}</span>}
                    </div>
                    <h3>{t.tech[k].name}</h3>
                    <p>{t.tech[k].short}</p>
                    <button type="button" className="pp-btn pp-btn-line" onClick={() => setTechOpen(k)} aria-haspopup="dialog">
                      {t.learnMore} <span className="pp-arrow" aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="pp-integral" data-reveal>
              <h3>{view.lang === "es" ? "un enfoque integral y personalizado" : "an integrated, personalized approach"}</h3>
              <p>
                {view.lang === "es"
                  ? "combinamos tecnología avanzada, estrategia y acompañamiento cercano para ayudarte a lograr la versión que buscas de ti."
                  : "we combine advanced technology, strategy and close guidance to help you work toward the version of you that you are looking for."}
              </p>
            </div>
          </div>
        </section>

        <dialog ref={dialogRef} className="pp-modal" aria-labelledby="pp-modal-title" onClose={() => setTechOpen(null)} onClick={(e) => e.target === dialogRef.current && setTechOpen(null)}>
          {tech && techOpen && (
            <div className="pp-modal-in">
              <button type="button" className="pp-modal-close" onClick={() => setTechOpen(null)} aria-label={t.close} />
              {TECH_PHOTO[techOpen] && (
                <div className="pp-modal-photo">
                  <img src={TECH_PHOTO[techOpen]!.src} alt={TECH_PHOTO[techOpen]!.alt} style={{ objectPosition: TECH_PHOTO[techOpen]!.pos }} />
                </div>
              )}
              <p className="pp-eyebrow" style={{ color: "#6b3a35", marginBottom: 6 }}>
                {t.techEyebrow}
              </p>
              <h3 id="pp-modal-title">{tech.name}</h3>
              {(["what", "use", "integrate", "feel", "eligibility"] as const).map((k) => (
                <div key={k}>
                  <h4>{t.modalHeads[k]}</h4>
                  <p>{tech[k]}</p>
                </div>
              ))}
              <p style={{ marginTop: 22, fontSize: 11.5 }}>{t.resultsNote}</p>
            </div>
          )}
        </dialog>

        {/* ------------------------------------------------------------ 06 process */}
        <section id="process" className="pp-sec pp-sand" aria-labelledby="pp-process-title">
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              06 — {t.processEyebrow}
            </p>
            <h2 id="pp-process-title" className="pp-h2" data-reveal>
              {t.processTitle}
            </h2>
            <p className="pp-lead" data-reveal>
              {t.processIntro}
            </p>
            <div className="pp-steps-wrap" ref={stepsRef}>
            <span className="pp-steps-line" aria-hidden="true" />
            <ol className="pp-steps">
              {t.steps.map((s, i) => (
                <li key={s.title} className="pp-step" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span className="pp-step-icon">
                    <Ic src={`${A}/brand/icons/${STEP_ICONS[i]}.png`} />
                  </span>
                  <div>
                    <span className="pp-step-n">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 07 founder */}
        <section id="founder" className="pp-sec pp-burgundy" aria-labelledby="pp-founder-title">
          <div className="pp-inner pp-founder">
            <div className="pp-founder-photo" data-reveal>
              <Image src={`${A}/founder/portrait/emmy-founder-seated-original.jpg`} alt={view.lang === "es" ? "emmy, fundadora de body shaper system" : "emmy, founder of body shaper system"} fill sizes="(max-width: 900px) 90vw, 420px" style={{ objectFit: "cover", objectPosition: "50% 22%" }} />
            </div>
            <div data-reveal>
              <p className="pp-eyebrow">07 — {t.founderEyebrow}</p>
              <h2 id="pp-founder-title" className="pp-h2">
                {view.founder.title}
              </h2>
              <p className="pp-lead">{view.founder.bio || t.founderDefaultBio}</p>
              <p className="pp-sign">
                emmy branger
                <small>{view.lang === "es" ? "fundadora · body shaper system™" : "founder · body shaper system™"}</small>
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 08 results */}
        {view.results.length > 0 && (
          <section id="results" className="pp-sec pp-olive" aria-labelledby="pp-results-title">
            <div className="pp-inner">
              <p className="pp-eyebrow" data-reveal>
                08 — {t.resultsEyebrow}
              </p>
              <h2 id="pp-results-title" className="pp-h2" data-reveal>
                {t.resultsTitle}
              </h2>
              <p className="pp-lead" style={{ color: "var(--ivory-soft)" }} data-reveal>
                {t.resultsIntro}
              </p>
              <div className="pp-results" tabIndex={0} aria-label={t.resultsTitle}>
                {view.results.map((c) => (
                  <article key={c.id} className="pp-result" data-reveal>
                    <div className="pp-ba">
                      <figure>
                        <div className="pp-ba-img">
                          <Image src={c.before} alt={`${t.before} — ${c.system}`} fill sizes="(max-width: 600px) 42vw, 210px" style={{ objectFit: "cover" }} />
                        </div>
                        <figcaption>{t.before}</figcaption>
                      </figure>
                      <figure>
                        <div className="pp-ba-img">
                          <Image src={c.after} alt={`${t.after} — ${c.system}`} fill sizes="(max-width: 600px) 42vw, 210px" style={{ objectFit: "cover" }} />
                        </div>
                        <figcaption>{t.after}</figcaption>
                      </figure>
                    </div>
                    <div className="pp-result-meta">
                      <span>
                        <b>{c.system}</b>
                        {c.technologies}
                      </span>
                      <span style={{ textAlign: "right" }}>
                        <b>{c.sessions}</b>
                        {view.lang === "es" ? (c.sessions === 1 ? "sesión" : "sesiones") : c.sessions === 1 ? "session" : "sessions"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="pp-small" style={{ display: "block" }}>{t.resultsNote}</p>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ 09 faq */}
        <section id="faq" className="pp-sec pp-sand" aria-labelledby="pp-faq-title">
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              09 — {t.faqEyebrow}
            </p>
            <h2 id="pp-faq-title" className="pp-h2" data-reveal>
              {t.faqTitle}
            </h2>
            <div className="pp-faq">
              {t.faqs.map((f, i) => {
                const open = faqOpen === i;
                return (
                  <div key={f.q} className="pp-faq-item" data-reveal>
                    <h3>
                      <button type="button" className="pp-faq-q" aria-expanded={open} aria-controls={`pp-faq-${i}`} id={`pp-faq-q-${i}`} onClick={() => setFaqOpen(open ? null : i)}>
                        {f.q}
                        <span className="pp-plus" aria-hidden="true" />
                      </button>
                    </h3>
                    <div id={`pp-faq-${i}`} role="region" aria-labelledby={`pp-faq-q-${i}`} className={`pp-expand pp-faq-a${open ? " open" : ""}`}>
                      <div>
                        <p>{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ 10 seasonal */}
        {view.promo && (
          <section id="seasonal" className="pp-sec pp-burgundy" aria-labelledby="pp-promo-title">
            <div className="pp-inner pp-promo">
              <div className="pp-promo-img" data-reveal>
                <Image src={view.promo.image} alt={view.promo.title} width={1672} height={940} sizes="(max-width: 900px) 92vw, 540px" />
              </div>
              <div data-reveal>
                <p className="pp-eyebrow">10 — {view.promo.eyebrow}</p>
                <h2 id="pp-promo-title" className="pp-h2">
                  the <em>333</em> holiday sculpt ritual
                </h2>
                <span className="pp-sessions" style={{ color: "var(--ivory-soft)" }}>
                  {t.promoTreatments}
                </span>
                <div className="pp-icons3">
                  {TECHNOLOGIES.map((k) => (
                    <div key={k}>
                      <b>{view.promo!.sessions[k]}</b>
                      <span>{t.tech[k].name}</span>
                    </div>
                  ))}
                </div>
                <fieldset className="pp-options">
                  <legend className="pp-label" style={{ color: "var(--ivory-soft)" }}>
                    {t.choosePayment} · <span className="pp-strike">{money(view.promo.regularCents)}</span>
                  </legend>
                  <label className="pp-option">
                    <input type="radio" name="pp-promo" checked={promoMode === "full"} onChange={() => setPromoMode("full")} />
                    <span className="pp-radio" aria-hidden="true" />
                    <span className="pp-option-t">{t.payFull}</span>
                    <span className="pp-option-p">{money(view.promo.fullCents)}</span>
                  </label>
                  <label className="pp-option">
                    <input type="radio" name="pp-promo" checked={promoMode === "split"} onChange={() => setPromoMode("split")} />
                    <span className="pp-radio" aria-hidden="true" />
                    <span>
                      <span className="pp-option-t">{t.pay2}</span>
                      <span className="pp-option-s">{t.pay2Note(money(view.promo.installmentCents), money(view.promo.installmentCents))}</span>
                    </span>
                    <span className="pp-option-p">
                      {money(view.promo.installmentCents)}
                      <small>{t.each}</small>
                    </span>
                  </label>
                </fieldset>
                <button type="button" className="pp-btn pp-btn-champagne" style={{ width: "100%", marginTop: 22, minHeight: 54 }} onClick={bookPromo} disabled={!view.token || busy !== null}>
                  {busy === "promo" ? t.redirecting : t.promoBook} <span className="pp-arrow" aria-hidden="true" />
                </button>
                {error && busy === "promo" && <p className="pp-error" role="alert">{error}</p>}
                <p className="pp-terms">
                  {view.promo.paymentNote} {view.promo.terms}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ closing */}
        <section id="contact" className="pp-sec pp-sand pp-close" aria-labelledby="pp-close-title">
          <div className="pp-inner">
            <h2 id="pp-close-title" className="pp-h2" data-reveal>
              {t.ctaTitle}
            </h2>
            <p className="pp-lead" data-reveal>
              {t.ctaText}
            </p>
            <a className="pp-btn pp-btn-burgundy" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer" data-reveal>
              {t.ctaButton} <span className="pp-arrow" aria-hidden="true" />
            </a>
            <p className="pp-logo3" aria-label="body shaper system">
              body
              <br />
              shaper
              <br />
              system<sup>™</sup>
            </p>
            <p className="pp-tag">{t.footerTagline}</p>
            <p className="pp-disclaimer">{t.disclaimer}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
