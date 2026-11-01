"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COPY, WHATSAPP_NUMBER } from "@/lib/proposals/copy";
import { displayName, money, TECHNOLOGIES, type GoalKey, type PaymentMode, type TechnologyKey, type ZoneKey } from "@/lib/proposals/types";
import type { ProposalView } from "@/lib/proposals/server";

/**
 * Master template — five steps:
 * 01 your blueprint (welcome + goals) · 02 technology · 03 vision & real results ·
 * 04 your plan & investment (programs, payment, seasonal offer) · 05 questions.
 */

const A = "/proposal-assets";
const ICON: Record<TechnologyKey, string> = {
  exilis: `${A}/brand/icons/line-contour-waves.png`,
  endospheres: `${A}/brand/icons/line-molecule.png`,
  ems: `${A}/brand/icons/line-target-cross.png`,
};
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
  const es = view.lang === "es";
  const rootRef = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("welcome");
  const [openCard, setOpenCard] = useState<string | null>(null);
  const firstKey = view.recommendedKey ?? view.programs[0]?.key ?? null;
  const [programKey, setProgramKey] = useState<string | null>(
    view.payment.programKey && view.programs.some((p) => p.key === view.payment.programKey) ? view.payment.programKey : firstKey,
  );
  const [mode, setMode] = useState<PaymentMode>("full");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoMode, setPromoMode] = useState<PaymentMode>("full");
  const [techOpen, setTechOpen] = useState<TechnologyKey | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const program = useMemo(() => view.programs.find((p) => p.key === programKey) ?? view.programs[0], [programKey, view.programs]);
  const zones = view.zones.filter((z): z is ZoneKey => z in t.zones);
  const goals = view.goals.filter((g): g is GoalKey => g in t.goals);
  const zoneLabels = zones.map((z) => t.zones[z]);
  const goalLabels = goals.map((g) => t.goals[g]);

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

  // ---- reveal, lazy backgrounds, active section, top bar ----
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
    root.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-in") : reveal.observe(el)));
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
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).id)), {
      rootMargin: "-45% 0px -50% 0px",
    });
    root.querySelectorAll("section[id]").forEach((el) => spy.observe(el));
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.55);
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

  async function startCheckout(kind: "program" | "promo") {
    if (!view.token) return;
    if (kind === "program") {
      if (!program) return;
      if (mode === "split" && !consent) {
        setError(es ? "confirma el calendario de las dos cuotas para continuar." : "please confirm the two-installment schedule to continue.");
        return;
      }
    }
    setBusy(kind);
    setError(null);
    try {
      const res =
        kind === "program"
          ? await fetch(`/api/proposals/${view.token}/checkout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ programKey: program!.key, mode, consent: mode === "split" ? consent : false }),
            })
          : await fetch(`/api/holiday-333/checkout`, {
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
    ["welcome", t.nav.blueprint],
    ["technology", t.nav.technology],
    ["results", t.nav.results],
    ["plan", t.nav.plan],
    ["faq", t.nav.faq],
  ];
  const tech = techOpen ? t.tech[techOpen] : null;
  const waText = encodeURIComponent(es ? "hola, tengo una pregunta sobre mi body blueprint." : "hi, i have a question about my body blueprint.");

  return (
    <div className="pp" ref={rootRef}>
      <header className={`pp-top${solid ? " is-solid" : ""}`}>
        <a href="#welcome" className="pp-logo" onClick={go("welcome")} aria-label="body shaper system — back to top">
          body shaper system<sup>™</sup>
        </a>
        <nav className="pp-nav" aria-label={es ? "secciones" : "sections"}>
          {navItems.map(([id, label], i) => (
            <a key={id} href={`#${id}`} onClick={go(id)} className={active === id ? "is-active" : ""}>
              {i + 1}. {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* ------------------------------------------------ 01 your blueprint: welcome + goals */}
        <section id="welcome" className="pp-sec pp-burgundy pp-hero bg-on" aria-labelledby="pp-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
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
              <a href="#technology" className="pp-btn pp-btn-champagne" onClick={go("technology")} data-reveal style={{ ["--d" as string]: "0.4s" }}>
                {t.explore} <span className="pp-arrow down" aria-hidden="true" />
              </a>
            </div>

            {/* goals: official diagram with only her zones + her goals */}
            <div className="pp-goals" data-reveal style={{ ["--d" as string]: "0.3s" }} aria-label={t.goalsEyebrow}>
              <div className="pp-diagram">
                <img
                  src={`${A}/blueprint/body-diagram/body-diagram-official.jpg`}
                  alt={es ? "diagrama corporal body blueprint con tus zonas prioritarias" : "body blueprint diagram showing your priority zones"}
                  width={828}
                  height={1024}
                />
                {zones.map((z) =>
                  ZONE_POINTS[z].map(([x, y], i) => (
                    <span key={`${z}${i}`} className="pp-mark on" style={{ left: `${(x / 828) * 100}%`, top: `${(y / 1024) * 100}%` }} aria-hidden="true" />
                  )),
                )}
              </div>
              <div className="pp-goals-text">
                <p className="pp-eyebrow">{t.goalsEyebrow}</p>
                {zoneLabels.length > 0 && (
                  <>
                    <span className="pp-label-l">{t.zonesLabel}</span>
                    <p className="pp-goals-big">{zoneLabels.join(" · ")}</p>
                  </>
                )}
                {goalLabels.length > 0 && (
                  <>
                    <span className="pp-label-l">{t.goalsLabel}</span>
                    <ul className="pp-goal-list">
                      {goalLabels.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 02 technology */}
        <section id="technology" className="pp-sec pp-olive" aria-labelledby="pp-tech-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              02 — {t.sec.technology}
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
                      {ph ? (
                        <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 600px) 30vw, 220px" style={{ objectFit: "cover", objectPosition: ph.pos }} />
                      ) : (
                        <span className="pp-placeholder">{t.photoPending}</span>
                      )}
                    </div>
                    <h3>{t.tech[k].name}</h3>
                    <p>{t.tech[k].short}</p>
                    <dl className="pp-rhythm">
                      <div><dt className="pp-sr">{es ? "frecuencia" : "frequency"}</dt><dd>{t.tech[k].freq}</dd></div>
                      <div><dt className="pp-sr">{es ? "duración" : "duration"}</dt><dd>{t.tech[k].time}</dd></div>
                    </dl>
                    <button type="button" className="pp-btn pp-btn-line" onClick={() => setTechOpen(k)} aria-haspopup="dialog">
                      {t.learnMore} <span className="pp-arrow" aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
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
              <h4>{t.modalHeads.rhythm}</h4>
              <p>{tech.freq} · {tech.time}</p>
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

        {/* ------------------------------------------------ 03 vision & real results */}
        <section id="results" className="pp-sec pp-sand" aria-labelledby="pp-founder-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              03 — {t.sec.results}
            </p>
            <div className="pp-founder" data-reveal>
              <div className="pp-founder-photo">
                <Image
                  src={`${A}/founder/portrait/emmy-founder-seated-original.jpg`}
                  alt={es ? "Emmy Branger, fundadora de body shaper system" : "Emmy Branger, founder of body shaper system"}
                  fill
                  sizes="(max-width: 900px) 40vw, 300px"
                  style={{ objectFit: "cover", objectPosition: "50% 22%" }}
                />
              </div>
              <div>
                <h2 id="pp-founder-title" className="pp-h2 pp-h2-sm">
                  {view.founder.title}
                </h2>
                <p className="pp-lead">{view.founder.bio || t.founderDefaultBio}</p>
                <p className="pp-sign">
                  Emmy Branger
                  <small>{es ? "fundadora · body shaper system™" : "founder · body shaper system™"}</small>
                </p>
              </div>
            </div>
            {view.results.length > 0 && (
              <>
                <h3 className="pp-h3" data-reveal>
                  {t.resultsTitle}
                </h3>
                <div className="pp-results" tabIndex={0} aria-label={t.resultsTitle}>
                  {view.results.map((c) => (
                    <article key={c.id} className="pp-result" data-reveal>
                      <div className="pp-ba">
                        {(["before", "after"] as const).map((k) => (
                          <figure key={k}>
                            <div className="pp-ba-img">
                              <Image src={c[k]} alt={`${t[k]} — ${c.system}`} fill sizes="(max-width: 600px) 42vw, 210px" style={{ objectFit: "cover" }} />
                            </div>
                            <figcaption>{t[k]}</figcaption>
                          </figure>
                        ))}
                      </div>
                      <div className="pp-result-meta">
                        <span>
                          <b>{c.system}</b>
                          {c.technologies}
                        </span>
                        <span style={{ textAlign: "right" }}>
                          <b>{c.sessions}</b>
                          {es ? (c.sessions === 1 ? "sesión" : "sesiones") : c.sessions === 1 ? "session" : "sessions"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="pp-note">{t.resultsNote}</p>
              </>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ 04 your plan & investment */}
        <section id="plan" className="pp-sec pp-burgundy pp-pay" aria-labelledby="pp-plan-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              04 — {t.sec.plan}
            </p>
            <h2 id="pp-plan-title" className="pp-h2" data-reveal>
              {t.sec.planTitle}
            </h2>
            <p className="pp-lead" style={{ color: "var(--ivory-soft)" }} data-reveal>
              {t.sec.planIntro}
            </p>
            {checkoutState === "success" && <div className="pp-banner" role="status">{es ? "gracias — estamos confirmando tu pago." : "thank you — we are confirming your payment."}</div>}
            {view.payment.status === "paid_in_full" && <div className="pp-banner" role="status">{t.paidFull}{paidProgram ? ` (${displayName(paidProgram.name)})` : ""}</div>}
            {view.payment.status === "first_installment_paid" && <div className="pp-banner" role="status">{t.paidFirst(money(view.payment.balanceDueCents))}</div>}

            <div className="pp-cards" style={{ ["--n" as string]: String(Math.min(3, view.programs.length || 1)) }}>
              {view.programs.map((p, i) => {
                const open = openCard === p.key;
                const rec = view.recommendedKey === p.key;
                const sel = program?.key === p.key;
                return (
                  <article key={p.key} className={`pp-card${rec ? " is-rec" : ""}${sel ? " is-sel" : ""}`} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                    {rec && <span className="pp-badge">{t.recommended}</span>}
                    <span className="pp-opt">{t.option(i + 1)}</span>
                    <h3>{displayName(p.name)}</h3>
                    <span className="pp-sessions">{t.technologySessions(p.total)}</span>
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
                    <div id={`pp-x-${p.key}`} className={`pp-expand${open ? " open" : ""}`}>
                      <div>
                        {p.focus.length > 0 && (
                          <div className="pp-expand-body">
                            <span className="pp-label">{t.objectives}</span>
                            <ul>
                              {p.focus.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {p.focus.length > 0 && (
                      <button type="button" className="pp-link" aria-expanded={open} aria-controls={`pp-x-${p.key}`} onClick={() => setOpenCard(open ? null : p.key)}>
                        {open ? t.hideDetails : t.viewDetails} <span className="pp-plus" aria-hidden="true" />
                      </button>
                    )}
                    <div className="pp-price">
                      {t.from} <strong>{money(p.pricing.fullCents)}</strong>
                    </div>
                    <button type="button" className={`pp-btn ${sel ? "pp-btn-burgundy" : "pp-btn-line"}`} aria-pressed={sel} onClick={() => choose(p.key)}>
                      {sel ? t.sec.selected : t.sec.select}
                    </button>
                  </article>
                );
              })}
            </div>

            {program && pricing && (
              <div className="pp-paybox" data-reveal>
                <div className="pp-paybox-head">
                  <span className="pp-label-l">{t.choosePayment}</span>
                  <strong>{displayName(program.name)}</strong>
                </div>
                <fieldset className="pp-options">
                  <legend className="pp-sr">{t.choosePayment}</legend>
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
                <button type="button" className="pp-btn pp-btn-champagne pp-btn-wide" onClick={() => startCheckout("program")} disabled={!view.token || busy !== null || (mode === "split" && !consent)}>
                  {busy === "program" ? t.redirecting : t.bookPay} <span className="pp-arrow" aria-hidden="true" />
                </button>
                {!view.token && <p className="pp-small"><i aria-hidden="true">i</i><span>{t.previewOnly}</span></p>}
                {error && busy !== "promo" && <p className="pp-error" role="alert">{error}</p>}
                <p className="pp-small">
                  <i aria-hidden="true">i</i>
                  <span>{t.scheduleNote}</span>
                </p>
              </div>
            )}

            {view.promo && (
              <div id="seasonal" className="pp-promo" data-reveal>
                <div className="pp-promo-img">
                  <Image src={view.promo.image} alt={view.promo.title} width={1672} height={940} sizes="(max-width: 900px) 92vw, 520px" />
                </div>
                <div>
                  <p className="pp-eyebrow">{t.sec.promoOr}</p>
                  <h3 className="pp-h3">
                    the <em>333</em> holiday sculpt ritual
                  </h3>
                  <span className="pp-sessions" style={{ color: "var(--ivory-soft)" }}>
                    {t.promoTreatments} · 3 exilis ultra + 3 endospheres + 3 ems
                  </span>
                  <fieldset className="pp-options">
                    <legend className="pp-label-l">
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
                  <button type="button" className="pp-btn pp-btn-line pp-btn-wide" style={{ marginTop: 18 }} onClick={() => startCheckout("promo")} disabled={!view.token || busy !== null}>
                    {busy === "promo" ? t.redirecting : t.promoBook} <span className="pp-arrow" aria-hidden="true" />
                  </button>
                  {error && busy === "promo" && <p className="pp-error" role="alert">{error}</p>}
                  <p className="pp-terms">
                    {es ? `${view.promo.paymentNoteEs} ${view.promo.termsEs}` : `${view.promo.paymentNote} ${view.promo.terms}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ 05 questions + contact */}
        <section id="faq" className="pp-sec pp-sand" aria-labelledby="pp-faq-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
          <div className="pp-inner">
            <p className="pp-eyebrow" data-reveal>
              05 — {t.sec.faq}
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
            <div className="pp-close">
              <h3 className="pp-h3">{t.ctaTitle}</h3>
              <p className="pp-lead">{t.ctaText}</p>
              <a className="pp-btn pp-btn-burgundy" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer">
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
          </div>
        </section>
      </main>
    </div>
  );
}
