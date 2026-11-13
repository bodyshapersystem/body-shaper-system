"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addManualCommission,
  approveParticipant,
  attributeLead,
  createParticipant,
  markPayoutPaid,
  saveLevels,
  setCommissionStatus,
  setParticipantStatus,
  updateParticipant,
} from "./actions";

type Participant = {
  id: string; name: string; email: string; phone: string | null; instagram: string | null; note: string | null;
  code: string; type: string; status: string; discountCents: number; percentOverride: number | null; notes: string | null;
  agreement: boolean; payout: string | null; visits: number; leads: number; sales: number; owed: number; paid: number;
};
type Commission = { id: string; who: string; description: string; baseCents: number; percent: number; amountCents: number; status: string; inPayout: boolean; createdAt: string };
type Payout = { id: string; who: string; amountCents: number; method: string | null; handle: string | null; status: string; requestedAt: string };
type Level = { name: string; minSales: number; percent: number };

const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const TABS = ["participants", "commissions", "payouts", "tools", "levels"] as const;

export default function HubSociety({ participants, commissions, payouts, levels }: { participants: Participant[]; commissions: Commission[]; payouts: Payout[]; levels: Level[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("participants");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string; success?: boolean } | undefined>, ok = "Saved.") {
    setMsg("");
    startTransition(async () => {
      try {
        const r = await fn();
        setMsg(r && "error" in r && r.error ? r.error : ok);
        if (!(r && "error" in r && r.error)) setEditing(null);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Something went wrong.");
      }
      router.refresh();
    });
  }
  const form = (fn: (fd: FormData) => Promise<{ error?: string; success?: boolean } | undefined>, ok?: string) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const el = e.currentTarget;
    run(async () => {
      const r = await fn(fd);
      if (!(r && "error" in r && r.error)) el.reset();
      return r;
    }, ok);
  };

  const [copiedProgram, setCopiedProgram] = useState(false);
  const pending = participants.filter((p) => p.status === "PENDING");
  const owed = commissions.filter((c) => c.status === "PENDING" || c.status === "APPROVED").reduce((s, c) => s + c.amountCents, 0);
  const paidOut = commissions.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amountCents, 0);
  const visits = participants.reduce((s, p) => s + p.visits, 0);
  const programUrl = "https://www.bodyshapersystem.com/society";
  const toApprove = commissions.filter((c) => c.status === "PENDING");
  const openPayouts = payouts.filter((p) => p.status === "REQUESTED");

  return (
    <div className="hsoc">
      <ol className="ss-how hsoc-how">
        <li><span>1</span><strong>Approve a member</strong><em>a client joins from her portal, or a collab applies</em></li>
        <li><span>2</span><strong>She shares her link</strong><em>visits are tracked for 30 days</em></li>
        <li><span>3</span><strong>Her referral pays</strong><em>a commission appears “to approve”</em></li>
        <li><span>4</span><strong>You approve &amp; pay</strong><em>she requests payout → mark it paid</em></li>
      </ol>

      <div className="hsoc-kpis">
        <button type="button" className="hsoc-kpi hsoc-kpi-marble" onClick={() => setTab("commissions")}><span>owed to members</span><strong>{money(owed)}</strong><em>{toApprove.length} to approve</em></button>
        <button type="button" className="hsoc-kpi" onClick={() => setTab("payouts")}><span>payout requests</span><strong>{openPayouts.length}</strong><em>paid so far {money(paidOut)}</em></button>
        <button type="button" className="hsoc-kpi" onClick={() => setTab("participants")}><span>members</span><strong>{participants.filter((p) => p.status === "ACTIVE").length}</strong><em>{pending.length} application{pending.length === 1 ? "" : "s"} waiting</em></button>
        <div className="hsoc-kpi"><span>link visits</span><strong>{visits}</strong><em>all members</em></div>
      </div>

      <div className="hsoc-share">
        <div>
          <p className="ss-label">invite collabs &amp; ambassadors</p>
          <code>{programUrl.replace("https://www.", "")}</code>
        </div>
        <div className="ss-actions">
          <button type="button" className="ss-btn ss-btn-sm" onClick={() => navigator.clipboard?.writeText(programUrl).then(() => { setCopiedProgram(true); setTimeout(() => setCopiedProgram(false), 1800); })}>{copiedProgram ? "copied ✓" : "copy link"}</button>
          <button type="button" className="ss-btn ss-btn-sm ss-btn-outline-dark" onClick={() => setTab("tools")}>+ add someone yourself</button>
        </div>
      </div>

      <div className="hsoc-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? "hsoc-tab on" : "hsoc-tab"} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {msg && <p className="hsoc-msg">{msg}</p>}

      {tab === "participants" && (
        <div className="hsoc-list">
          {participants.length === 0 && (
            <div className="hsoc-empty">
              <h4>No members yet</h4>
              <p>Share the link above with your collabs, or add an ambassador yourself. Clients can join from Invite &amp; Earn in their portal.</p>
              <button type="button" className="ss-btn" onClick={() => setTab("tools")}>+ add your first ambassador</button>
            </div>
          )}
          {participants.map((p) => (
            <div key={p.id} className={`hsoc-row hsoc-${p.status.toLowerCase()}`}>
              <div className="hsoc-row-main">
                <span className="hsoc-avatar">{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                <div className="hsoc-row-body">
                  <strong>{p.name}</strong> <code className="hsoc-code">{p.code}</code> <em className="hsoc-pill">{p.type === "CLIENT" ? "client" : "collab"}</em> <em className={`hsoc-pill hsoc-pill-${p.status.toLowerCase()}`}>{p.status.toLowerCase()}</em>
                  <p className="hsoc-meta">{p.email}{p.phone ? ` · ${p.phone}` : ""}{p.instagram ? ` · ${p.instagram}` : ""}</p>
                  <div className="hsoc-mini">
                    <span><b>{p.visits}</b> visits</span>
                    <span><b>{p.leads}</b> referrals</span>
                    <span><b>{p.sales}</b> paid</span>
                    <span><b>{money(p.owed)}</b> owed</span>
                  </div>
                  <p className="hsoc-meta">
                    {p.percentOverride != null ? `${p.percentOverride}% fixed` : "level %"} · friend discount {p.discountCents ? money(p.discountCents) : "none"} · paid out {money(p.paid)}
                    {!p.agreement && " · agreement not accepted yet"}
                  </p>
                  {p.payout && <p className="hsoc-meta">payout: {p.payout}</p>}
                  {p.note && <p className="hsoc-meta">“{p.note}”</p>}
                </div>
                <div className="hsoc-actions">
                  {p.status === "PENDING" && <button type="button" className="pt-btn solid" disabled={isPending} onClick={() => run(() => approveParticipant(p.id), "Approved — email sent.")}>approve</button>}
                  {p.status === "PENDING" && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => setParticipantStatus(p.id, "REJECTED"))}>reject</button>}
                  {p.status === "ACTIVE" && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => setParticipantStatus(p.id, "PAUSED"))}>pause</button>}
                  {(p.status === "PAUSED" || p.status === "REJECTED") && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => setParticipantStatus(p.id, "ACTIVE"))}>activate</button>}
                  {p.status === "ACTIVE" && p.type === "EXTERNAL" && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => approveParticipant(p.id), "Email re-sent.")}>re-send email</button>}
                  <button type="button" className="pt-btn" onClick={() => setEditing(editing === p.id ? null : p.id)}>edit</button>
                </div>
              </div>
              {editing === p.id && (
                <form className="hsoc-form" onSubmit={form((fd) => updateParticipant(p.id, fd))}>
                  <label>code<input name="code" defaultValue={p.code} className="sched-select" /></label>
                  <label>referral discount ($)<input name="discount" type="number" min={0} step={1} defaultValue={p.discountCents / 100 || ""} placeholder="e.g. 30 or 50" className="sched-select" /></label>
                  <label>fixed % (empty = use levels)<input name="percentOverride" type="number" min={0} max={50} defaultValue={p.percentOverride ?? ""} className="sched-select" /></label>
                  <label className="hsoc-wide">internal notes<textarea name="notes" rows={2} defaultValue={p.notes ?? ""} className="sched-textarea" /></label>
                  <button type="submit" className="pt-btn solid" disabled={isPending}>save</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "commissions" && (
        <table className="pt-table">
          <thead><tr><th>date</th><th>participant</th><th>referral</th><th>paid</th><th>%</th><th>commission</th><th>status</th><th /></tr></thead>
          <tbody>
            {commissions.length === 0 && <tr><td colSpan={8}>No commissions yet.</td></tr>}
            {commissions.map((c) => (
              <tr key={c.id}>
                <td>{day(c.createdAt)}</td>
                <td>{c.who}</td>
                <td>{c.description}</td>
                <td>{money(c.baseCents)}</td>
                <td>{c.percent}%</td>
                <td><strong>{money(c.amountCents)}</strong></td>
                <td>{c.status.toLowerCase()}{c.inPayout && c.status === "APPROVED" ? " · in payout" : ""}</td>
                <td className="hsoc-actions">
                  {c.status === "PENDING" && <button type="button" className="pt-btn solid" disabled={isPending} onClick={() => run(() => setCommissionStatus(c.id, "APPROVED"))}>approve</button>}
                  {(c.status === "PENDING" || c.status === "APPROVED") && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => setCommissionStatus(c.id, "VOID"))}>void</button>}
                  {c.status === "VOID" && <button type="button" className="pt-btn" disabled={isPending} onClick={() => run(() => setCommissionStatus(c.id, "PENDING"))}>restore</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "payouts" && (
        <table className="pt-table">
          <thead><tr><th>requested</th><th>participant</th><th>amount</th><th>pay to</th><th>status</th><th /></tr></thead>
          <tbody>
            {payouts.length === 0 && <tr><td colSpan={6}>No payout requests yet.</td></tr>}
            {payouts.map((p) => (
              <tr key={p.id}>
                <td>{day(p.requestedAt)}</td>
                <td>{p.who}</td>
                <td><strong>{money(p.amountCents)}</strong></td>
                <td>{p.method}: {p.handle}</td>
                <td>{p.status.toLowerCase()}</td>
                <td>{p.status === "REQUESTED" && <button type="button" className="pt-btn solid" disabled={isPending} onClick={() => run(() => markPayoutPaid(p.id), "Marked as paid.")}>mark paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "tools" && (
        <div className="hsoc-tools">
          <form className="hsoc-form" onSubmit={form(createParticipant, "Added — approval email sent.")}>
            <h4 className="hsoc-wide">add a collab / ambassador</h4>
            <label>first name<input name="firstName" required className="sched-select" /></label>
            <label>last name<input name="lastName" className="sched-select" /></label>
            <label>email<input name="email" type="email" required className="sched-select" /></label>
            <label>phone<input name="phone" className="sched-select" /></label>
            <label>instagram<input name="instagram" className="sched-select" /></label>
            <label>code (optional)<input name="code" className="sched-select" placeholder="auto from name" /></label>
            <label>referral discount ($)<input name="discount" type="number" min={0} placeholder="e.g. 30 or 50" className="sched-select" /></label>
            <button type="submit" className="pt-btn solid" disabled={isPending}>add & send login email</button>
          </form>

          <form className="hsoc-form" onSubmit={form(attributeLead, "Referral credited.")}>
            <h4 className="hsoc-wide">credit a referral by hand</h4>
            <p className="hsoc-meta hsoc-wide">For someone who came by DM or word of mouth instead of the link. Her future paid proposal will create the commission automatically.</p>
            <label>participant<ParticipantSelect participants={participants} /></label>
            <label>lead / client email<input name="email" type="email" required className="sched-select" /></label>
            <button type="submit" className="pt-btn solid" disabled={isPending}>credit</button>
          </form>

          <form className="hsoc-form" onSubmit={form(addManualCommission, "Commission added (approved).")}>
            <h4 className="hsoc-wide">add a commission by hand</h4>
            <p className="hsoc-meta hsoc-wide">For a package paid outside the proposal checkout (Zelle, card in the Hub). The % comes from her level.</p>
            <label>participant<ParticipantSelect participants={participants} /></label>
            <label>referral<input name="description" required placeholder="e.g. Ana M. — Sculpt Signature" className="sched-select" /></label>
            <label>amount the client paid ($)<input name="amount" type="number" min={1} step="0.01" required className="sched-select" /></label>
            <button type="submit" className="pt-btn solid" disabled={isPending}>add</button>
          </form>
        </div>
      )}

      {tab === "levels" && (
        <>
        <div className="ss-step">
          <p className="ss-label">current levels</p>
          <div className="ss-levels">
            <span className="ss-levels-line" />
            {levels.map((l, i) => {
              const nextMin = levels[i + 1]?.minSales;
              return (
                <div key={l.name} className="ss-level ss-level-next">
                  <span className="ss-level-dot">{l.percent}%</span>
                  <span className="ss-level-range">{nextMin ? `${l.minSales}–${nextMin - 1}` : `${l.minSales}+`} paid</span>
                </div>
              );
            })}
          </div>
        </div>
        <form className="hsoc-form" onSubmit={form(saveLevels, "Levels saved — they apply to future sales only.")}>
          <p className="hsoc-meta hsoc-wide">The paid referral that opens a level is paid at that level. Past commissions never change.</p>
          {[...levels, ...Array.from({ length: Math.max(0, 6 - levels.length) }, () => ({ name: "", minSales: 0, percent: 0 }))].map((l, i) => (
            <div key={i} className="hsoc-level-row hsoc-wide">
              <input name={`name_${i}`} defaultValue={l.name} placeholder="level name" className="sched-select" />
              <label>from referral #<input name={`min_${i}`} type="number" min={1} defaultValue={l.minSales || ""} className="sched-select" /></label>
              <label>%<input name={`pct_${i}`} type="number" min={0} max={50} defaultValue={l.name ? l.percent : ""} className="sched-select" /></label>
            </div>
          ))}
          <button type="submit" className="pt-btn solid" disabled={isPending}>save levels</button>
        </form>
        </>
      )}
    </div>
  );
}

function ParticipantSelect({ participants }: { participants: Participant[] }) {
  return (
    <select name="participantId" required className="sched-select" defaultValue="">
      <option value="" disabled>choose…</option>
      {participants.filter((p) => p.status === "ACTIVE").map((p) => (
        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
      ))}
    </select>
  );
}
