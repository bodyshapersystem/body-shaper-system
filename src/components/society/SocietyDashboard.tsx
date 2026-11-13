"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptSocietyAgreement, requestSocietyPayout, updateSocietyPayoutDetails } from "@/app/(site)/society/actions";
import { SOCIETY_AGREEMENT_SECTIONS } from "@/lib/society-agreement";

type Data = {
  code: string;
  firstName: string;
  agreementCurrent: boolean;
  discountCents: number;
  payoutMethod: string | null;
  payoutHandle: string | null;
  visits: number;
  referredLeads: number;
  sales: number;
  level: { name: string; percent: number };
  nextLevel: { name: string; percent: number; salesToGo: number } | null;
  pendingCents: number;
  approvedCents: number;
  paidCents: number;
  minPayoutCents: number;
  hasOpenPayout: boolean;
  commissions: { id: string; description: string; amountCents: number; percent: number; status: string; createdAt: string }[];
  payouts: { id: string; amountCents: number; status: string; requestedAt: string; paidAt: string | null }[];
  levels: { name: string; minSales: number; percent: number }[];
};

const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const STATUS: Record<string, string> = { PENDING: "in review", APPROVED: "ready", PAID: "paid", VOID: "cancelled", REQUESTED: "requested" };

/** Shaper Society member area, organized as 4 clear steps. Shared by the portal and /society/dashboard. */
export default function SocietyDashboard({ data, siteOrigin }: { data: Data; siteOrigin: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [moreLinks, setMoreLinks] = useState(false);
  const [msg, setMsg] = useState("");
  const [method, setMethod] = useState(data.payoutMethod ?? "Zelle");
  const [handle, setHandle] = useState(data.payoutHandle ?? "");

  const link = `${siteOrigin}/r/${data.code}`;
  const shareText = `I trust Body Shaper System™ with my body goals — book your Body Blueprint™ here: ${link}`;

  function copy(url: string) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    });
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Body Shaper System™", text: shareText, url: link });
      } catch {
        /* closed */
      }
    } else copy(link);
  }
  function run(fn: () => Promise<{ error?: string; success?: boolean } | undefined>, ok?: string) {
    setMsg("");
    startTransition(async () => {
      const r = await fn();
      if (r && "error" in r && r.error) setMsg(r.error);
      else if (ok) setMsg(ok);
      router.refresh();
    });
  }

  if (!data.agreementCurrent) {
    return (
      <div className="ss-step ss-step-open">
        <StepHead n={1} title="Accept the agreement" sub="Read how commissions work — then your personal link appears." />
        <div className="soc-agreement">
          {SOCIETY_AGREEMENT_SECTIONS.map((s) => (
            <div key={s.title}>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        {msg && <p className="soc-msg">{msg}</p>}
        <button type="button" className="ss-btn" disabled={isPending} onClick={() => run(acceptSocietyAgreement)}>
          {isPending ? "Saving…" : "I accept — show my link"}
        </button>
      </div>
    );
  }

  const levels = [...data.levels].sort((a, b) => a.minSales - b.minSales);
  const currentIdx = Math.max(0, levels.findIndex((l) => l.name === data.level.name));
  const canRequest = !data.hasOpenPayout && data.approvedCents >= data.minPayoutCents;
  const toMin = Math.max(data.minPayoutCents - data.approvedCents, 0);

  return (
    <div className="ss">
      {/* ---------- 1 · link ---------- */}
      <section className="ss-step ss-step-marble">
        <StepHead n={1} title="Share your link" sub="Anyone who opens it is connected to you for 30 days." dark />
        <div className="ss-code">
          <span>your code</span>
          <strong>{data.code}</strong>
        </div>
        <div className="ss-link-box">
          <code>{link.replace(/^https?:\/\/(www\.)?/, "")}</code>
        </div>
        <div className="ss-actions">
          <button type="button" className="ss-btn ss-btn-light" onClick={() => copy(link)}>{copied === link ? "copied ✓" : "copy link"}</button>
          <button type="button" className="ss-btn ss-btn-outline" onClick={share}>share</button>
          <a className="ss-btn ss-btn-outline" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">whatsapp</a>
        </div>
        {data.discountCents > 0 && <p className="ss-note-dark">Your friends get <strong>{money(data.discountCents)} off</strong> their first system with your link.</p>}
        <button type="button" className="ss-more" onClick={() => setMoreLinks((v) => !v)}>{moreLinks ? "hide" : "more links"} {moreLinks ? "−" : "+"}</button>
        {moreLinks && (
          <div className="ss-more-links">
            {[
              { label: "straight to the Body Blueprint™ form", url: `${link}?to=/body-blueprint` },
              { label: "for your Instagram bio", url: `${link}?c=instagram` },
            ].map((l) => (
              <div key={l.url} className="ss-more-row">
                <span>{l.label}</span>
                <button type="button" className="ss-btn ss-btn-light ss-btn-sm" onClick={() => copy(l.url)}>{copied === l.url ? "copied ✓" : "copy"}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- 2 · friends ---------- */}
      <section className="ss-step">
        <StepHead n={2} title="Your friends book" sub="Follow each step — a commission is created when she completes payment for her system." />
        <div className="ss-flow">
          <FlowStat value={data.visits} label="opened your link" />
          <span className="ss-flow-arrow" aria-hidden="true" />
          <FlowStat value={data.referredLeads} label="filled her blueprint" />
          <span className="ss-flow-arrow" aria-hidden="true" />
          <FlowStat value={data.sales} label="paid her system" strong />
        </div>
      </section>

      {/* ---------- 3 · level ---------- */}
      <section className="ss-step">
        <StepHead n={3} title={`You earn ${data.level.percent}%`} sub={data.nextLevel ? `${data.nextLevel.salesToGo} more paid referral${data.nextLevel.salesToGo === 1 ? "" : "s"} to reach ${data.nextLevel.percent}%.` : "You're at the top level."} />
        <div className="ss-levels">
          <span className="ss-levels-line" />
          {levels.map((l, i) => {
            const nextMin = levels[i + 1]?.minSales;
            const state = i < currentIdx ? "past" : i === currentIdx ? "now" : "next";
            return (
              <div key={l.name} className={`ss-level ss-level-${state}`}>
                <span className="ss-level-dot">{l.percent}%</span>
                <span className="ss-level-range">{nextMin ? `${l.minSales}–${nextMin - 1}` : `${l.minSales}+`} paid</span>
                {state === "now" && <span className="ss-level-you">you</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- 4 · paid ---------- */}
      <section className="ss-step">
        <StepHead n={4} title="Get paid" sub="We review each commission, then you request your payout." />
        <div className="ss-money">
          <div className="ss-money-col">
            <span>in review</span>
            <strong>{money(data.pendingCents)}</strong>
          </div>
          <span className="ss-flow-arrow" aria-hidden="true" />
          <div className="ss-money-col ss-money-ready">
            <span>ready to request</span>
            <strong>{money(data.approvedCents)}</strong>
          </div>
          <span className="ss-flow-arrow" aria-hidden="true" />
          <div className="ss-money-col">
            <span>paid to you</span>
            <strong>{money(data.paidCents)}</strong>
          </div>
        </div>

        <div className="ss-payout">
          <p className="ss-label">how should we pay you?</p>
          <div className="ss-pills">
            {["Zelle", "PayPal", "Other"].map((m) => (
              <button key={m} type="button" className={method === m ? "ss-pill on" : "ss-pill"} onClick={() => setMethod(m)}>{m}</button>
            ))}
          </div>
          <div className="ss-payout-row">
            <input className="sched-select" placeholder={method === "Zelle" ? "Zelle email or phone" : method === "PayPal" ? "PayPal email" : "How should we pay you?"} value={handle} onChange={(e) => setHandle(e.target.value)} />
            <button
              type="button"
              className="ss-btn ss-btn-outline-dark"
              disabled={isPending || !handle.trim()}
              onClick={() => {
                const fd = new FormData();
                fd.set("payoutMethod", method);
                fd.set("payoutHandle", handle);
                run(() => updateSocietyPayoutDetails(fd), "Saved.");
              }}
            >
              save
            </button>
          </div>
          <button type="button" className="ss-btn" disabled={isPending || !canRequest} onClick={() => run(requestSocietyPayout, "Request sent — we'll let you know when it's paid.")}>
            {data.hasOpenPayout ? "payout in progress" : `request ${data.approvedCents ? money(data.approvedCents) : "payout"}`}
          </button>
          {!canRequest && !data.hasOpenPayout && <p className="ss-hint">{toMin > 0 ? `${money(toMin)} more in ready commissions to request a payout (minimum ${money(data.minPayoutCents)}).` : ""}</p>}
          {msg && <p className="soc-msg">{msg}</p>}
        </div>
      </section>

      {/* ---------- history ---------- */}
      {(data.commissions.length > 0 || data.payouts.length > 0) && (
        <section className="ss-step">
          <p className="ss-label">history</p>
          <ul className="ss-history">
            {data.commissions.map((c) => (
              <li key={c.id}>
                <span className="ss-h-date">{day(c.createdAt)}</span>
                <span className="ss-h-what">{c.description}<em>{c.percent}%</em></span>
                <strong>{money(c.amountCents)}</strong>
                <span className={`ss-h-status ss-h-${c.status.toLowerCase()}`}>{STATUS[c.status] ?? c.status}</span>
              </li>
            ))}
            {data.payouts.map((p) => (
              <li key={p.id} className="ss-h-payout">
                <span className="ss-h-date">{day(p.requestedAt)}</span>
                <span className="ss-h-what">payout</span>
                <strong>{money(p.amountCents)}</strong>
                <span className={`ss-h-status ss-h-${p.status.toLowerCase()}`}>{STATUS[p.status] ?? p.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StepHead({ n, title, sub, dark = false }: { n: number; title: string; sub: string; dark?: boolean }) {
  return (
    <div className={dark ? "ss-head ss-head-dark" : "ss-head"}>
      <span className="ss-num">{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
    </div>
  );
}

function FlowStat({ value, label, strong = false }: { value: number; label: string; strong?: boolean }) {
  return (
    <div className={strong ? "ss-flow-stat ss-flow-strong" : "ss-flow-stat"}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
