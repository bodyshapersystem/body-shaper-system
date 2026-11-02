"use client";

import { useState, useTransition } from "react";
import { saveProposalSettings } from "../actions";

type S = { founderTitle: string; founderBio: string; founderBioEs: string; activeCampaign: string | null; assessmentDollars: number };

export default function SettingsForm({ initial }: { initial: S }) {
  const [s, setS] = useState<S>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="pb">
      <section className="pb-block">
        <h3 className="pb-h">07 · about the founder</h3>
        <label className="sched-label">
          title
          <input className="sched-input" value={s.founderTitle} onChange={(e) => setS({ ...s, founderTitle: e.target.value })} />
        </label>
        <label className="sched-label">
          biography (english)
          <textarea className="sched-input" rows={6} value={s.founderBio} onChange={(e) => setS({ ...s, founderBio: e.target.value })} />
        </label>
        <label className="sched-label">
          biografía (español)
          <textarea className="sched-input" rows={6} value={s.founderBioEs} onChange={(e) => setS({ ...s, founderBioEs: e.target.value })} />
        </label>
      </section>
      <section className="pb-block">
        <h3 className="pb-h">10 · seasonal offer</h3>
        <label className="sched-label">
          active campaign
          <select className="sched-select" value={s.activeCampaign ?? ""} onChange={(e) => setS({ ...s, activeCampaign: e.target.value || null })}>
            <option value="holiday_333">the 333 holiday sculpt ritual — $1,290 or 2 × $645 (existing checkout)</option>
            <option value="">no seasonal offer</option>
          </select>
        </label>
        <p className="pb-hint">each proposal can also hide the offer individually. future campaigns are added here as new options.</p>
      </section>
      <section className="pb-block">
        <h3 className="pb-h">11 · body blueprint™ assessment reservation</h3>
        <label className="sched-label" style={{ maxWidth: 260 }}>
          amount ($) — shown on every proposal, credited once toward the program
          <input type="number" min={50} max={2000} step={1} className="sched-input" value={s.assessmentDollars} onChange={(e) => setS({ ...s, assessmentDollars: Number(e.target.value) })} />
        </label>
      </section>
      <div className="pb-save">
        <button
          type="button"
          className="dash-view-btn pb-primary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveProposalSettings(s);
              setMsg(r && "error" in r && r.error ? r.error : "saved.");
            })
          }
        >
          {pending ? "saving…" : "save"}
        </button>
        {msg && <span className={msg === "saved." ? "pb-ok" : "pb-err"}>{msg}</span>}
      </div>
    </div>
  );
}
