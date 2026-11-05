"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COPY, EXTRA, WHATSAPP_NUMBER } from "@/lib/proposals/copy";
import { applyCredit, bonusApplies, displayName, formatDay, money, secondChargeOptions, TECHNOLOGIES, type GoalKey, type PaymentMode, type TechnologyKey, type ZoneKey } from "@/lib/proposals/types";
import type { ProposalView } from "@/lib/proposals/server";
import { BACK_ZONES, FILL_SELECTED, FRONT_ZONES, IMAGE_HEIGHT, IMAGE_VIEWBOX, IMAGE_WIDTH } from "@/lib/body-map-zones";

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

/** Session Area Map™ zones lit for each priority zone (legs = thighs only, never calves). */
const ZONE_MAP: Record<ZoneKey, string[]> = {
  legs: ["Left Front Thigh", "Right Front Thigh", "Left Posterior Thigh", "Right Posterior Thigh"],
  abdomen: ["Upper Left Abdomen", "Upper Right Abdomen", "Lower Left Abdomen", "Lower Right Abdomen"],
  waist: ["Left Lateral", "Right Lateral"],
  arms: ["Left Front Arm", "Right Front Arm", "Left Posterior Arm", "Right Posterior Arm"],
  glutes: ["Left Glute", "Right Glute"],
};
const MAP_IMG = { front: `${A}/blueprint/session-area-map/front.png`, back: `${A}/blueprint/session-area-map/back.png` };

type Props = { view: ProposalView; checkoutState?: string | null };

export default function ProposalExperience({ view, checkoutState }: Props) {
  const t = COPY[view.lang];
  const x = EXTRA[view.lang];
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
  const [secondDate, setSecondDate] = useState<string | null>(null);
  const dateOptions = useMemo(() => secondChargeOptions(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoMode, setPromoMode] = useState<PaymentMode>("full");
  const [techOpen, setTechOpen] = useState<TechnologyKey | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const program = useMemo(() => view.programs.find((p) => p.key === programKey) ?? view.programs[0], [programKey, view.programs]);
  const zones = view.zones.filter((z): z is ZoneKey => z in t.zones);
  const goals = view.goals.filter((g): g is GoalKey => g in t.goals);
  const zoneLabels = zones.map((z) => t.zones[z]);
  const litZones = new Set(zones.flatMap((z) => ZONE_MAP[z]));
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

  const openSheet = (key: string) => {
    setProgramKey(key);
    setMode("full");
    setConsent(false);
    setSecondDate(null);
    setError(null);
    setSheetOpen(true);
    track("select_program", { programKey: key });
  };
  useEffect(() => {
    const d = sheetRef.current;
    if (!d) return;
    if (sheetOpen && !d.open) d.showModal();
    if (!sheetOpen && d.open) d.close();
  }, [sheetOpen]);
  // after Stripe: land on the "next step" block
  useEffect(() => {
    if (checkoutState === "success" || checkoutState === "assessment") setTimeout(() => document.getElementById("next")?.scrollIntoView({ block: "start" }), 300);
    if (checkoutState === "cancelled") setTimeout(() => document.getElementById("assessment")?.scrollIntoView({ block: "start" }), 300);
  }, [checkoutState]);

  async function startAssessment() {
    if (!view.token) return;
    setBusy("assessment");
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${view.token}/assessment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "checkout unavailable");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "checkout unavailable");
      setBusy(null);
    }
  }

  async function startCheckout(kind: "program" | "promo") {
    if (!view.token) return;
    if (kind === "program") {
      if (!program) return;
      if (mode === "split" && !secondDate) {
        setError(t.pickDateError);
        return;
      }
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
              body: JSON.stringify({ programKey: program!.key, mode, consent: mode === "split" ? consent : false, secondDate: mode === "split" ? secondDate : null }),
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

  // Only explain the technologies that are actually part of this client's programs.
  const usedTech = TECHNOLOGIES.filter((k) => view.programs.some((p) => p.sessions[k] > 0)).length >= 2 ? TECHNOLOGIES.filter((k) => view.programs.some((p) => p.sessions[k] > 0)) : [...TECHNOLOGIES];
  const isGabiPackages = view.token === "b6I1-9Bo9Aoy1suAXCwb-kufb8tReEvmQEAoEqeBeQ4";
  const pricing = program?.pricing;
  const creditAvail = view.assessment?.creditAvailableCents ?? 0;
  const applied = pricing && (mode === "full" || pricing.split) ? applyCredit(pricing, mode, creditAvail) : null;
  const due = applied ? applied.todayCents : 0;
  const assessmentPaid = !!view.assessment?.paid;
  const programPaid = ["paid_in_full", "first_installment_paid", "completed"].includes(view.payment.status ?? "");
  const assessmentDateLabel = view.assessment?.date
    ? new Date(`${view.assessment.date}T12:00:00Z`).toLocaleDateString(es ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).toLowerCase()
    : null;
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
              <div className="pp-map">
                <p className="pp-map-title">session area map</p>
                <div className="pp-map-figs">
                  {([["front", FRONT_ZONES], ["back", BACK_ZONES]] as const).map(([side, list]) => (
                    <figure key={side}>
                      <figcaption>{side === "front" ? (es ? "frente" : "front") : es ? "espalda" : "back"}</figcaption>
                      <div className="pp-map-fig">
                        <img src={MAP_IMG[side]} alt={es ? `zonas a trabajar, vista ${side === "front" ? "frontal" : "posterior"}` : `areas we will work on, ${side} view`} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
                        <svg viewBox={IMAGE_VIEWBOX} aria-hidden="true">
                          {list.filter((z) => litZones.has(z.name)).map((z) => (
                            <path key={z.name} d={z.path} fill={FILL_SELECTED} />
                          ))}
                        </svg>
                      </div>
                    </figure>
                  ))}
                </div>
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
              {usedTech.length === 2 ? (es ? "dos tecnologías, una estrategia" : "two technologies, one strategy") : t.techTitle}
            </h2>
            <p className="pp-lead" style={{ color: "var(--ivory-soft)" }} data-reveal>
              {t.techIntro}
            </p>
            <div className="pp-tech" style={{ gridTemplateColumns: `repeat(${usedTech.length}, 1fr)` }}>
              {usedTech.map((k, i) => {
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
                    <article key={c.id} className={`pp-result pp-result-${c.kind}`} data-reveal>
                      {c.kind === "card" ? (
                        <div className="pp-result-card">
                          <Image src={c.image} alt={c.alt} fill sizes="(max-width: 600px) 86vw, 440px" style={{ objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div className="pp-ba">
                          {(["before", "after"] as const).map((k) => (
                            <figure key={k}>
                              <div className="pp-ba-img">
                                <Image src={c[k]} alt={`${t[k]} — ${c.label}`} fill sizes="(max-width: 600px) 42vw, 210px" style={{ objectFit: "cover" }} />
                              </div>
                              <figcaption>
                                {t[k]} · {k === "before" ? c.beforeCaption.replace("session", es ? "sesión" : "session") : c.afterCaption.replace("session", es ? "sesión" : "session")}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}
                      <p className="pp-result-label">{es ? c.label.replace(/session/g, "sesión") : c.label}</p>
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
            {view.assessment && (
              <p className="pp-small" style={{ color: "var(--ivory-soft)", maxWidth: 640 }} data-reveal>
                <i aria-hidden="true">i</i>
                <span>{x.preliminary}</span>
              </p>
            )}

            <div className="pp-cards" style={{ ["--n" as string]: String(Math.min(3, view.programs.length || 1)) }}>
              {view.programs.map((p, i) => {
                const open = openCard === p.key;
                const rec = view.recommendedKey === p.key || !!p.bestValue;
                                return (
                  <article key={p.key} className={`pp-card${rec ? " is-rec" : ""}`} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                    {rec && <span className="pp-badge">{p.bestValue ? x.bestValue : t.recommended}</span>}
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
                    {p.bonus?.label && (
                      <div className="pp-gift">
                        <span className="pp-label">{x.gift}</span>
                        <span>{p.bonus.label}</span>
                        <small>{p.bonus.fullOnly ? x.giftFullOnly : x.giftAny}</small>
                      </div>
                    )}
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
                    {isGabiPackages ? (
                      <>
                        <p className="pp-split-line">Precio total: <strong>{money(p.pricing.regularCents)}</strong></p>
                        <p className="pp-split-line">Abono Zelle: <strong>−{money(creditAvail)}</strong></p>
                        <div className="pp-price">Restante pago completo (−$100): <strong>{money(Math.max(0,p.pricing.fullCents-creditAvail))}</strong></div>
                        <p className="pp-split-line">O en 2 pagos sin descuento: <strong>{money(Math.max(0,p.pricing.regularCents-creditAvail))}</strong></p>
                      </>
                    ) : (
                      <>
                        <div className="pp-price">
                          {t.from} <strong>{money(p.pricing.fullCents)}</strong>
                          {p.pricing.savingCents > 0 && <span className="pp-regular"> · {es ? "precio regular" : "regular"} <s>{money(p.pricing.regularCents)}</s></span>}
                        </div>
                        {p.pricing.split && <p className="pp-split-line">{es ? "o en 2 pagos" : "or pay in 2"}: {money(p.pricing.split.firstCents)} + {money(p.pricing.split.secondCents)}</p>}
                      </>
                    )}
                    <button type="button" className={`pp-btn ${rec ? "pp-btn-burgundy" : "pp-btn-line"}`} aria-haspopup="dialog" onClick={() => openSheet(p.key)}>
                      {t.sec.select} <span className="pp-arrow" aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </div>

            {view.assessment && (
              <div id="assessment" className="pp-assess" data-reveal>
                <p className="pp-eyebrow">{x.assessmentEyebrow}</p>
                <h3 className="pp-h3">{x.assessmentTitle}</h3>
                <p className="pp-lead" style={{ color: "var(--ivory-soft)" }}>{x.assessmentText(money(view.assessment.cents))}</p>
                <dl className="pp-assess-dl">
                  <div><dt>{es ? "tipo" : "appointment type"}</dt><dd>{x.assessmentType}</dd></div>
                  {assessmentDateLabel && <div><dt>{x.assessmentDate}</dt><dd>{assessmentDateLabel}</dd></div>}
                  <div><dt>{x.assessmentTime}</dt><dd>{view.assessment.timeConfirmed && view.assessment.time ? view.assessment.time : x.toBeConfirmed}</dd></div>
                </dl>
                {assessmentPaid ? (
                  <p className="pp-assess-paid" role="status"><span aria-hidden="true">✓</span> {x.assessmentPaid(money(view.assessment.cents))}</p>
                ) : programPaid ? null : (
                  <>
                    <button type="button" className="pp-btn pp-btn-line pp-btn-wide" onClick={startAssessment} disabled={!view.token || busy !== null}>
                      {busy === "assessment" ? t.redirecting : x.assessmentButton(money(view.assessment.cents))} <span className="pp-arrow" aria-hidden="true" />
                    </button>
                    {checkoutState === "cancelled" && <p className="pp-small"><i aria-hidden="true">i</i><span>{es ? "el pago no se completó — no se hizo ningún cargo." : "payment was not completed — you have not been charged."}</span></p>}
                    {error && busy === "assessment" && <p className="pp-error" role="alert">{error}</p>}
                    {!view.token && <p className="pp-small"><i aria-hidden="true">i</i><span>{t.previewOnly}</span></p>}
                    <p className="pp-terms">{x.assessmentCredit(money(view.assessment.cents))}</p>
                  </>
                )}
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


        {/* payment sheet: opens from "choose this program", goes straight to Stripe */}
        <dialog ref={sheetRef} className="pp-modal pp-sheet" aria-labelledby="pp-sheet-title" onClose={() => setSheetOpen(false)} onClick={(e) => e.target === sheetRef.current && busy === null && setSheetOpen(false)}>
          {sheetOpen && program && pricing && (
            <div className="pp-modal-in">
              <button type="button" className="pp-modal-close" onClick={() => setSheetOpen(false)} aria-label={t.close} />
              <p className="pp-eyebrow" style={{ color: "#6b3a35", marginBottom: 6 }}>{t.choosePayment}</p>
              <h3 id="pp-sheet-title">{displayName(program.name)}</h3>
              <p className="pp-sheet-sub">
                {t.technologySessions(program.total)} · {TECHNOLOGIES.filter((k) => program.sessions[k] > 0).map((k) => `${program.sessions[k]} ${t.tech[k].name}`).join(" · ")}
              </p>
              <fieldset className="pp-options">
                <legend className="pp-sr">{t.choosePayment}</legend>
                <label className="pp-option">
                  <input type="radio" name="pp-mode" value="full" checked={mode === "full"} onChange={() => { setMode("full"); track("select_payment", { programKey: program.key, mode: "full" }); }} />
                  <span className="pp-radio" aria-hidden="true" />
                  <span>
                    <span className="pp-option-t">{t.payFull}</span>
                    {pricing.savingCents > 0 && <span className="pp-option-s">{t.payFullNote(money(pricing.savingCents))}</span>}
                  </span>
                  <span className="pp-option-p">{money(isGabiPackages ? Math.max(0,pricing.fullCents-creditAvail) : pricing.fullCents)}</span>
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
                      {money(isGabiPackages ? Math.max(0,pricing.split.firstCents-creditAvail) : pricing.split.firstCents)}
                      <small>{pricing.split.firstCents === pricing.split.secondCents && !isGabiPackages ? t.each : "+ " + money(pricing.split.secondCents)}</small>
                    </span>
                  </label>
                )}
              </fieldset>
              {program.bonus?.label && (
                <p className="pp-small"><i aria-hidden="true">✦</i><span>{bonusApplies(program, mode) ? x.giftWithFull(program.bonus.label) : x.giftNotWithSplit(program.bonus.label)}</span></p>
              )}
              {applied && applied.creditCents > 0 && (
                <div className="pp-due pp-credit"><span>{x.creditLine(money(applied.creditCents))}</span></div>
              )}
              <div className="pp-due" aria-live="polite">
                <span>{t.dueToday}</span>
                <strong>{money(due)}</strong>
              </div>
              {mode === "split" && pricing.split && (
                <>
                  <fieldset className="pp-dates">
                    <legend className="pp-label">{t.pickDate}</legend>
                    <p className="pp-dates-hint">{t.pickDateHint}</p>
                    <div className="pp-dates-row">
                      {dateOptions.map((d) => (
                        <label key={d} className={`pp-date${secondDate === d ? " on" : ""}`}>
                          <input type="radio" name="pp-second" value={d} checked={secondDate === d} onChange={() => setSecondDate(d)} />
                          {formatDay(d, view.lang)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {secondDate && (
                    <label className="pp-consent">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                      <span>{t.consentAuto(money(applied?.todayCents ?? pricing.split.firstCents), money(applied?.secondCents ?? pricing.split.secondCents), formatDay(secondDate, view.lang))}</span>
                    </label>
                  )}
                </>
              )}
              <button type="button" className="pp-btn pp-btn-burgundy pp-btn-wide" onClick={() => startCheckout("program")} disabled={!view.token || busy !== null || (mode === "split" && (!consent || !secondDate))}>
                {busy === "program" ? t.redirecting : t.payNow} <span className="pp-arrow" aria-hidden="true" />
              </button>
              {!view.token && <p className="pp-small"><i aria-hidden="true">i</i><span>{t.previewOnly}</span></p>}
              {error && busy !== "promo" && <p className="pp-error" role="alert">{error}</p>}
              <p className="pp-small"><i aria-hidden="true">i</i><span>{t.scheduleNote}</span></p>
            </div>
          )}
        </dialog>

        {/* ------------------------------------------------ 05 questions + contact */}
        <section id="faq" className="pp-sec pp-sand" aria-labelledby="pp-faq-title">
          <div className="pp-bgwrap" aria-hidden="true"><div className="pp-bgimg" /></div>
          <div className="pp-inner">
            {(checkoutState === "assessment" || assessmentPaid) && !programPaid && checkoutState !== "success" && view.assessment && (
              <div id="next" className="pp-next" role="status">
                <p className="pp-eyebrow">{x.assessmentEyebrow}</p>
                <h2 className="pp-h2 pp-h2-sm">{x.assessmentNextTitle(view.clientName)}</h2>
                <p className="pp-lead">
                  {assessmentPaid ? x.assessmentPaid(money(view.assessment.cents)) : t.next.confirming} {x.assessmentNextText}
                </p>
                <a className="pp-btn pp-btn-burgundy" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(x.assessmentWa)}`} target="_blank" rel="noopener noreferrer">
                  {t.next.button} <span className="pp-arrow" aria-hidden="true" />
                </a>
              </div>
            )}
            {(checkoutState === "success" || programPaid) && (
              <div id="next" className="pp-next" role="status">
                <p className="pp-eyebrow">{t.next.eyebrow}</p>
                <h2 className="pp-h2 pp-h2-sm">{t.next.title(view.clientName)}</h2>
                <p className="pp-lead">
                  {view.payment.status === "first_installment_paid"
                    ? `${t.paidFirst(money(view.payment.balanceDueCents))} `
                    : view.payment.status === "paid_in_full" || view.payment.status === "completed"
                      ? `${t.paidFull} `
                      : `${t.next.confirming} `}
                  {t.next.text}
                </p>
                <a className="pp-btn pp-btn-burgundy" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.next.wa(paidProgram ? displayName(paidProgram.name) : program ? displayName(program.name) : ""))}`} target="_blank" rel="noopener noreferrer">
                  {t.next.button} <span className="pp-arrow" aria-hidden="true" />
                </a>
              </div>
            )}
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
