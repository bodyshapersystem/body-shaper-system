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

const money = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const STATUS_LABEL: Record<string, string> = { PENDING: "pending", APPROVED: "approved", PAID: "paid", VOID: "void", REQUESTED: "requested" };

export default function SocietyDashboard({ data, siteOrigin }: { data: Data; siteOrigin: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [method, setMethod] = useState(data.payoutMethod ?? "Zelle");
  const [handle, setHandle] = useState(data.payoutHandle ?? "");

  const link = `${siteOrigin}/r/${data.code}`;
  const links = [
    { label: "main link", url: link },
    { label: "body blueprint™", url: `${link}?to=/body-blueprint` },
    { label: "instagram bio", url: `${link}?c=instagram` },
  ];

  function copy(url: string) {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    });
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
      <div className="soc-card">
        <p className="soc-eyebrow">shaper society agreement</p>
        <h2 className="soc-title">Before you share your link</h2>
        <div className="soc-agreement">
          {SOCIETY_AGREEMENT_SECTIONS.map((s) => (
            <div key={s.title}>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        {msg && <p className="soc-msg">{msg}</p>}
        <button type="button" className="soc-btn" disabled={isPending} onClick={() => run(acceptSocietyAgreement)}>
          {isPending ? "Saving…" : "I accept — show my link"}
        </button>
      </div>
    );
  }

  const progressTo = data.nextLevel ? data.sales + data.nextLevel.salesToGo : data.sales;
  const canRequest = !data.hasOpenPayout && data.approvedCents >= data.minPayoutCents;

  return (
    <div className="soc-wrap">
      <div className="soc-card soc-card-marble">
        <p className="soc-eyebrow soc-on-dark">your link · code {data.code}</p>
        {links.map((l) => (
          <div key={l.url} className="soc-link-row">
            <span className="soc-link-label">{l.label}</span>
            <code className="soc-link">{l.url.replace(/^https?:\/\//, "")}</code>
            <button type="button" className="soc-btn soc-btn-light" onClick={() => copy(l.url)}>
              {copied === l.url ? "copied ✓" : "copy"}
            </button>
          </div>
        ))}
        {data.discountCents > 0 && <p className="soc-note soc-on-dark">People who arrive through your link get {money(data.discountCents)} off their first system.</p>}
      </div>

      <div className="soc-stats">
        <div className="soc-stat"><span>visits</span><strong>{data.visits}</strong></div>
        <div className="soc-stat"><span>referrals</span><strong>{data.referredLeads}</strong></div>
        <div className="soc-stat"><span>paid referrals</span><strong>{data.sales}</strong></div>
        <div className="soc-stat"><span>your level</span><strong>{data.level.percent}%</strong><em>{data.level.name}</em></div>
      </div>

      {data.nextLevel && (
        <div className="soc-card">
          <p className="soc-eyebrow">next level</p>
          <p className="soc-body">
            {data.nextLevel.salesToGo} more paid referral{data.nextLevel.salesToGo === 1 ? "" : "s"} to reach <strong>{data.nextLevel.name} · {data.nextLevel.percent}%</strong>
          </p>
          <div className="soc-bar"><span style={{ width: `${Math.min((data.sales / Math.max(progressTo, 1)) * 100, 100)}%` }} /></div>
          <div className="soc-levels">
            {data.levels.map((l, i) => {
              const nextMin = data.levels[i + 1]?.minSales;
              return (
                <span key={l.name} className={l.name === data.level.name ? "soc-level soc-level-on" : "soc-level"}>
                  {l.percent}% · {nextMin ? `${l.minSales}–${nextMin - 1}` : `${l.minSales}+`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="soc-stats">
        <div className="soc-stat"><span>pending</span><strong>{money(data.pendingCents)}</strong></div>
        <div className="soc-stat"><span>ready to request</span><strong>{money(data.approvedCents)}</strong></div>
        <div className="soc-stat"><span>paid to you</span><strong>{money(data.paidCents)}</strong></div>
      </div>

      <div className="soc-card">
        <p className="soc-eyebrow">payouts</p>
        <div className="soc-payout-form">
          <select className="sched-select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Zelle</option>
            <option>PayPal</option>
            <option>Other</option>
          </select>
          <input className="sched-select" placeholder={method === "Zelle" ? "Zelle email or phone" : method === "PayPal" ? "PayPal email" : "How should we pay you?"} value={handle} onChange={(e) => setHandle(e.target.value)} />
          <button
            type="button"
            className="soc-btn soc-btn-ghost"
            disabled={isPending}
            onClick={() => {
              const fd = new FormData();
              fd.set("payoutMethod", method);
              fd.set("payoutHandle", handle);
              run(() => updateSocietyPayoutDetails(fd), "Saved.");
            }}
          >
            Save
          </button>
        </div>
        <button type="button" className="soc-btn" disabled={isPending || !canRequest} onClick={() => run(requestSocietyPayout, "Request sent — we'll confirm when it's paid.")}>
          {data.hasOpenPayout ? "Payout in progress" : `Request payout${data.approvedCents ? ` · ${money(data.approvedCents)}` : ""}`}
        </button>
        {!canRequest && !data.hasOpenPayout && <p className="soc-note">Payouts open at {money(data.minPayoutCents)} in approved commissions.</p>}
        {msg && <p className="soc-msg">{msg}</p>}
        {data.payouts.length > 0 && (
          <ul className="soc-list">
            {data.payouts.map((p) => (
              <li key={p.id}>
                <span>{new Date(p.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <strong>{money(p.amountCents)}</strong>
                <em className={`soc-pill soc-pill-${p.status.toLowerCase()}`}>{STATUS_LABEL[p.status] ?? p.status}</em>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="soc-card">
        <p className="soc-eyebrow">commissions</p>
        {data.commissions.length === 0 ? (
          <p className="soc-body">No commissions yet — share your link to get started.</p>
        ) : (
          <ul className="soc-list">
            {data.commissions.map((c) => (
              <li key={c.id}>
                <span>{c.description}</span>
                <strong>{money(c.amountCents)}</strong>
                <em className={`soc-pill soc-pill-${c.status.toLowerCase()}`}>{STATUS_LABEL[c.status] ?? c.status} · {c.percent}%</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
