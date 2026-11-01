"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProposal, type ProposalInput } from "./actions";
import { GOALS, KEY_BISCAYNE_TEMPLATE, KEY_BISCAYNE_TEMPLATE_ES, money, priceProgram, totalSessions, ZONES, type ProposalProgram } from "@/lib/proposals/types";
import { COPY } from "@/lib/proposals/copy";

type ClientOption = { id: string; name: string; firstName: string; city: string | null };
type ResultCase = { id: string; label: string };

const PRESETS: { label: string; program: ProposalProgram }[] = [
  ...KEY_BISCAYNE_TEMPLATE.map((p) => ({ label: p.name, program: p })),
  ...["sculpt start", "mom reset", "glp-1 reshape"].map((name) => ({
    label: name,
    program: {
      key: name.replace(/[^a-z0-9]+/g, "-"),
      name,
      description: "",
      focus: [],
      sessions: { exilis: 0, endospheres: 0, ems: 0 },
      totalCents: 0,
      fullDiscountCents: 10000,
      allowSplit: true,
    },
  })),
];

const ZONE_HUB_LABEL: Record<string, string> = { legs: "legs (thighs front/back/sides — no calves)", abdomen: "abdomen", arms: "arms", glutes: "glutes", waist: "waist / laterals" };

const blank = (): ProposalInput => ({
  clientId: null,
  clientName: "",
  locationLabel: "",
  language: "en",
  zones: [],
  goals: [],
  personalMessage: "",
  internalNotes: "",
  programs: KEY_BISCAYNE_TEMPLATE,
  recommendedKey: "sculpt-signature-ii",
  promoEnabled: true,
  showWelcomeVideo: false,
  resultCaseIds: [],
  expiresAt: null,
  programStartDate: null,
});

export default function ProposalBuilder({
  initial,
  clients,
  resultCases,
  videoAvailable,
}: {
  initial: ProposalInput | null;
  clients: ClientOption[];
  resultCases: ResultCase[];
  videoAvailable: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState<ProposalInput>(initial ?? blank());
  const [programs, setPrograms] = useState<ProposalProgram[]>((initial?.programs as ProposalProgram[]) ?? KEY_BISCAYNE_TEMPLATE);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [pending, start] = useTransition();
  const t = COPY.en;

  const set = <K extends keyof ProposalInput>(k: K, v: ProposalInput[K]) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (k: "zones" | "goals" | "resultCaseIds", v: string) =>
    setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const setProgram = (i: number, patch: Partial<ProposalProgram>) => setPrograms((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, d: -1 | 1) =>
    setPrograms((ps) => {
      const n = [...ps];
      const j = i + d;
      if (j < 0 || j >= n.length) return ps;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const addPreset = (label: string) => {
    const pre = PRESETS.find((p) => p.label === label);
    if (!pre) return;
    let key = pre.program.key;
    while (programs.some((p) => p.key === key)) key += "-2";
    setPrograms((ps) => [...ps, { ...structuredClone(pre.program), key }]);
  };

  const keyBiscayne = () => {
    setPrograms(structuredClone(f.language === "es" ? KEY_BISCAYNE_TEMPLATE_ES : KEY_BISCAYNE_TEMPLATE));
    setF((s) => ({ ...s, zones: ["legs"], goals: ["laxity", "muscle-tone", "firmness"], recommendedKey: "sculpt-signature-ii" }));
  };

  const totals = useMemo(() => programs.map((p) => ({ n: totalSessions(p), pr: priceProgram(p) })), [programs]);

  function submit() {
    setMsg({});
    start(async () => {
      const res = await saveProposal({ ...f, programs });
      if (res.error) setMsg({ error: res.error });
      else {
        setMsg({ ok: "saved." });
        if (!f.id && res.id) router.push(`/hub/proposals/${res.id}`);
        else router.refresh();
      }
    });
  }

  return (
    <div className="pb">
      {/* ---------------- client */}
      <section className="pb-block">
        <h3 className="pb-h">1 · client</h3>
        <div className="pb-grid2">
          <label className="sched-label">
            existing client (optional)
            <select
              className="sched-select"
              value={f.clientId ?? ""}
              onChange={(e) => {
                const c = clients.find((x) => x.id === e.target.value);
                setF((s) => ({ ...s, clientId: c?.id ?? null, clientName: c ? c.firstName.toLowerCase() : s.clientName, locationLabel: s.locationLabel || (c?.city ?? "").toLowerCase() }));
              }}
            >
              <option value="">new client — no record yet</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="sched-label">
            name shown on the proposal
            <input className="sched-input" value={f.clientName} maxLength={60} onChange={(e) => set("clientName", e.target.value)} placeholder="e.g. her first name" />
          </label>
          <label className="sched-label">
            location (hub only — not shown on the page)
            <input className="sched-input" value={f.locationLabel} maxLength={60} onChange={(e) => set("locationLabel", e.target.value)} placeholder="optional" />
          </label>
          <label className="sched-label">
            language
            <select className="sched-select" value={f.language} onChange={(e) => set("language", e.target.value)}>
              <option value="en">english</option>
              <option value="es">español</option>
            </select>
          </label>
        </div>
        <p className="pb-hint">
          a new client is created automatically (lead → client, portal invite) only when she pays, using the details she enters in stripe checkout.
        </p>
        <button type="button" className="dash-view-btn" onClick={keyBiscayne}>
          load standard programs (sculpt signature I, II, total body optimization)
        </button>
      </section>

      {/* ---------------- goals */}
      <section className="pb-block">
        <h3 className="pb-h">2 · zones & goals</h3>
        <div className="pb-chips">
          {ZONES.map((z) => (
            <button key={z} type="button" className={`pb-chip${f.zones.includes(z) ? " on" : ""}`} onClick={() => toggle("zones", z)} aria-pressed={f.zones.includes(z)}>
              {ZONE_HUB_LABEL[z]}
            </button>
          ))}
        </div>
        <div className="pb-chips">
          {GOALS.map((g) => (
            <button key={g} type="button" className={`pb-chip${f.goals.includes(g) ? " on" : ""}`} onClick={() => toggle("goals", g)} aria-pressed={f.goals.includes(g)}>
              {t.goals[g]}
            </button>
          ))}
        </div>
        <div className="pb-grid2">
          <label className="sched-label">
            personal welcome message (shown — optional, replaces the automatic one)
            <textarea className="sched-input" rows={3} maxLength={600} value={f.personalMessage} onChange={(e) => set("personalMessage", e.target.value)} />
          </label>
          <label className="sched-label">
            internal notes (hub only — never shown to the client)
            <textarea className="sched-input" rows={3} maxLength={4000} value={f.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} />
          </label>
        </div>
      </section>

      {/* ---------------- programs */}
      <section className="pb-block">
        <h3 className="pb-h">3 · programs</h3>
        {programs.map((p, i) => (
          <div key={i} className={`pb-prog${f.recommendedKey === p.key ? " rec" : ""}`}>
            <div className="pb-prog-head">
              <input className="sched-input pb-prog-name" value={p.name} onChange={(e) => setProgram(i, { name: e.target.value })} aria-label="program name" />
              <label className="pb-inline">
                <input type="radio" name="rec" checked={f.recommendedKey === p.key} onChange={() => set("recommendedKey", p.key)} /> recommended
              </label>
              <span className="pb-tools">
                <button type="button" onClick={() => move(i, -1)} aria-label="move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="move down">↓</button>
                <button type="button" onClick={() => setPrograms((ps) => ps.filter((_, j) => j !== i))} aria-label="remove">remove</button>
              </span>
            </div>
            <div className="pb-grid4">
              {(["exilis", "endospheres", "ems"] as const).map((k) => (
                <label key={k} className="sched-label">
                  {t.tech[k].name} sessions
                  <input type="number" min={0} max={60} className="sched-input" value={p.sessions[k]} onChange={(e) => setProgram(i, { sessions: { ...p.sessions, [k]: Number(e.target.value) } })} />
                </label>
              ))}
              <label className="sched-label">
                total price ($)
                <input type="number" min={0} step={1} className="sched-input" value={p.totalCents / 100} onChange={(e) => setProgram(i, { totalCents: Math.round(Number(e.target.value) * 100) })} />
              </label>
              <label className="sched-label">
                pay-in-full saving ($)
                <input type="number" min={0} step={1} className="sched-input" value={p.fullDiscountCents / 100} onChange={(e) => setProgram(i, { fullDiscountCents: Math.round(Number(e.target.value) * 100) })} />
              </label>
              <label className="pb-inline" style={{ alignSelf: "end" }}>
                <input type="checkbox" checked={p.allowSplit} onChange={(e) => setProgram(i, { allowSplit: e.target.checked })} /> offer pay in 2
              </label>
            </div>
            <div className="pb-grid2">
              <label className="sched-label">
                personalized description
                <textarea className="sched-input" rows={2} maxLength={600} value={p.description} onChange={(e) => setProgram(i, { description: e.target.value })} />
              </label>
              <label className="sched-label">
                protocol objectives (one per line)
                <textarea className="sched-input" rows={2} value={p.focus.join("\n")} onChange={(e) => setProgram(i, { focus: e.target.value.split("\n") })} />
              </label>
            </div>
            <p className="pb-calc">
              {totals[i].n} sessions · regular {money(totals[i].pr.regularCents)} · <b>pay in full {money(totals[i].pr.fullCents)}</b>
              {totals[i].pr.split ? ` · pay in 2: ${money(totals[i].pr.split.firstCents)} at booking + ${money(totals[i].pr.split.secondCents)} in week 2` : " · pay in 2 off"}
            </p>
          </div>
        ))}
        {programs.length < 6 && (
          <label className="sched-label" style={{ maxWidth: 320 }}>
            add a program
            <select className="sched-select" value="" onChange={(e) => addPreset(e.target.value)}>
              <option value="">choose…</option>
              {PRESETS.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      {/* ---------------- modules */}
      <section className="pb-block">
        <h3 className="pb-h">4 · modules & dates</h3>
        <label className="pb-inline">
          <input type="checkbox" checked={f.promoEnabled} onChange={(e) => set("promoEnabled", e.target.checked)} /> show the seasonal offer (current campaign: the 333 holiday sculpt ritual)
        </label>
        <label className="pb-inline" title={videoAvailable ? "" : "add the original hands video to /proposal-assets/founder/welcome-video first"}>
          <input type="checkbox" disabled={!videoAvailable} checked={f.showWelcomeVideo} onChange={(e) => set("showWelcomeVideo", e.target.checked)} /> welcome hands video {videoAvailable ? "" : "(pending — original file not added yet)"}
        </label>
        <p className="pb-hint" style={{ marginTop: 14 }}>real results to show</p>
        <div className="pb-chips">
          {resultCases.map((c) => (
            <button key={c.id} type="button" className={`pb-chip${f.resultCaseIds.includes(c.id) ? " on" : ""}`} onClick={() => toggle("resultCaseIds", c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="pb-grid2">
          <label className="sched-label">
            program start date (sets the week-2 due date)
            <input type="date" className="sched-input" value={f.programStartDate ?? ""} onChange={(e) => set("programStartDate", e.target.value || null)} />
          </label>
          <label className="sched-label">
            link expires (optional)
            <input type="date" className="sched-input" value={f.expiresAt ?? ""} onChange={(e) => set("expiresAt", e.target.value || null)} />
          </label>
        </div>
      </section>

      <div className="pb-save">
        <button type="button" className="dash-view-btn pb-primary" onClick={submit} disabled={pending}>
          {pending ? "saving…" : f.id ? "save changes" : "create proposal"}
        </button>
        {msg.error && <span className="pb-err" role="alert">{msg.error}</span>}
        {msg.ok && <span className="pb-ok" role="status">{msg.ok}</span>}
      </div>
    </div>
  );
}
