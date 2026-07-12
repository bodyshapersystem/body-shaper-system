"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPayment,
  getClientFinancialSummary,
  updatePlanTotal,
  getFullPaymentDiscount,
} from "./actions";

type ClientOption = { id: string; firstName: string; lastName: string };

type FinancialSummary = {
  assessmentId: string | null;
  firstName: string;
  lastName: string;
  system: string | null;
  currentSession: number;
  totalSessions: number;
  planTotalCents: number | null;
  paidCents: number;
  pendingCents: number;
  balanceCents: number | null;
};

const PAYMENT_TYPES = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "INSTALLMENT", label: "Installment" },
  { value: "FULL_PAYMENT", label: "Full Payment" },
  { value: "CUSTOM_AMOUNT", label: "Custom Amount" },
  { value: "REFUND", label: "Refund" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

const PAYMENT_METHODS = [
  { value: "OTHER", label: "Zelle" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "ACH / Transfer" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_ORIGINS = [
  { value: "CLIENT_PAYMENT", label: "Client Payment" },
  { value: "AMBASSADOR", label: "Ambassador" },
  { value: "INFLUENCER_COLLABORATION", label: "Influencer Collaboration" },
  { value: "PARTNER", label: "Partner" },
  { value: "INTERNAL_ADJUSTMENT", label: "Internal Adjustment" },
];

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentRecorder({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState("");
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [discountCents, setDiscountCents] = useState<number | null>(null);

  const [planTotalInput, setPlanTotalInput] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [method, setMethod] = useState("CARD");
  const [origin, setOrigin] = useState("CLIENT_PAYMENT");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [recorded, setRecorded] = useState<{ amountCents: number; method: string; newBalanceCents: number | null } | null>(null);

  function handleClientChange(id: string) {
    setClientId(id);
    setSummary(null);
    setAmount("");
    setPaymentType("");
    setReference("");
    setNotes("");
    setRecorded(null);
    if (!id) return;
    setLoadingSummary(true);
    startTransition(async () => {
      const [s, discount] = await Promise.all([getClientFinancialSummary(id), getFullPaymentDiscount()]);
      setSummary(s);
      setDiscountCents(discount);
      if (s?.balanceCents != null && s.balanceCents > 0) {
        setAmount((s.balanceCents / 100).toFixed(2));
      }
      setLoadingSummary(false);
    });
  }

  function handleSavePlanTotal() {
    if (!summary?.assessmentId) return;
    const formData = new FormData();
    formData.set("planTotal", planTotalInput);
    startTransition(async () => {
      const result = await updatePlanTotal(summary.assessmentId!, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      const s = await getClientFinancialSummary(clientId);
      setSummary(s);
      setPlanTotalInput("");
    });
  }

  function handleSubmit() {
    setError("");
    if (!clientId) {
      setError("Select a client first.");
      return;
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const formData = new FormData();
    formData.set("clientId", clientId);
    formData.set("amount", amount);
    formData.set("method", method);
    formData.set("origin", origin);
    formData.set("status", "PAID");
    if (paymentType) formData.set("paymentType", paymentType);
    if (reference) formData.set("reference", reference);
    if (notes) formData.set("notes", notes);

    startTransition(async () => {
      const result = await createPayment(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      const amountCents = Math.round(amountNum * 100);
      const newBalanceCents = summary?.balanceCents != null ? Math.max(summary.balanceCents - amountCents, 0) : null;
      setRecorded({
        amountCents,
        method: PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method,
        newBalanceCents,
      });
      router.refresh();
    });
  }

  function resetAll() {
    setRecorded(null);
    setClientId("");
    setSummary(null);
    setAmount("");
    setPaymentType("");
    setReference("");
    setNotes("");
  }

  if (recorded) {
    return (
      <div className="sched-success">
        <span className="sched-success-check">✓</span>
        <h3>payment recorded.</h3>
        <div className="sched-confirm-details">
          <div>
            <span>Amount</span>
            <strong>{money(recorded.amountCents)}</strong>
          </div>
          <div>
            <span>Client</span>
            <strong>
              {summary?.firstName} {summary?.lastName}
            </strong>
          </div>
          <div>
            <span>Method</span>
            <strong>{recorded.method}</strong>
          </div>
          {recorded.newBalanceCents != null && (
            <div>
              <span>Remaining Balance</span>
              <strong>{money(recorded.newBalanceCents)}</strong>
            </div>
          )}
        </div>
        <div className="sched-success-actions">
          <a href={`/hub/clients/${clientId}`} className="sched-cta">
            View Client Account →
          </a>
          <button type="button" className="sched-secondary-btn" onClick={resetAll}>
            Record Another Payment
          </button>
          <a href="/hub/payments" className="sched-text-link">
            Back to Payments
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="sched-form">
      <div className="sched-section">
        <label className="sched-label" htmlFor="pay-client-select">
          Client
        </label>
        <select id="pay-client-select" value={clientId} onChange={(e) => handleClientChange(e.target.value)} className="sched-select">
          <option value="">Select client…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {loadingSummary && <p className="sched-loading">Loading financial summary…</p>}

      {summary && (
        <>
          <div className="sched-summary-card">
            <h3>
              {summary.firstName} {summary.lastName}
            </h3>
            {summary.system && <p className="sched-system">{summary.system}</p>}
            <p className="sched-session-line">
              Session {summary.currentSession} of {summary.totalSessions}
            </p>

            {summary.planTotalCents === null ? (
              <div className="pay-plan-setup">
                <input
                  type="number"
                  step="0.01"
                  value={planTotalInput}
                  onChange={(e) => setPlanTotalInput(e.target.value)}
                  placeholder="Set total plan value ($)"
                  className="sched-inline-input sched-system-input"
                />
                <button type="button" className="pay-plan-save-btn" onClick={handleSavePlanTotal}>
                  Save
                </button>
              </div>
            ) : (
              <div className="pay-financials">
                <div>
                  <span>Total Plan</span>
                  <strong>{money(summary.planTotalCents)}</strong>
                </div>
                <div>
                  <span>Paid</span>
                  <strong>{money(summary.paidCents)}</strong>
                </div>
                <div>
                  <span>Balance</span>
                  <strong>{money(summary.balanceCents ?? 0)}</strong>
                </div>
              </div>
            )}

            {summary.planTotalCents !== null && (
              <div className="sched-progress-track">
                <div
                  className="sched-progress-fill"
                  style={{ width: `${Math.min((summary.paidCents / summary.planTotalCents) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {discountCents != null && summary.balanceCents != null && summary.balanceCents > 0 && (
            <div className="pay-discount-card">
              <strong>Exclusive Courtesy</strong>
              <p>Pay the remaining balance in full today and receive a {money(discountCents)} courtesy discount.</p>
            </div>
          )}

          <div className="sched-section">
            <h4 className="sched-subheading">Record Payment</h4>

            <label className="sched-label" htmlFor="pay-type">
              Payment Type
            </label>
            <select id="pay-type" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="sched-select">
              <option value="">Select type…</option>
              {PAYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label className="sched-label" htmlFor="pay-amount">
              Amount ($)
            </label>
            <input
              id="pay-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="sched-select"
              placeholder="0.00"
            />

            <label className="sched-label" htmlFor="pay-method">
              Payment Method
            </label>
            <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} className="sched-select">
              {PAYMENT_METHODS.map((m, i) => (
                <option key={`${m.value}-${i}`} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <label className="sched-label" htmlFor="pay-reference">
              Reference
            </label>
            <input
              id="pay-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="sched-select"
              placeholder="Transaction ID, check #, etc. (optional)"
            />

            <label className="sched-label sched-notes-label">Payment Origin</label>
            <div className="pay-origin-options">
              {PAYMENT_ORIGINS.map((o) => (
                <label key={o.value} className="pay-origin-option">
                  <input type="radio" name="origin" checked={origin === o.value} onChange={() => setOrigin(o.value)} />
                  {o.label}
                </label>
              ))}
            </div>

            <label className="sched-label sched-notes-label" htmlFor="pay-notes">
              Notes
            </label>
            <textarea
              id="pay-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="sched-textarea"
              placeholder="Add any relevant notes…"
            />
          </div>

          {error && <p className="sched-error">{error}</p>}

          <button type="button" className="sched-cta sched-cta-block" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Recording…" : "Record Payment →"}
          </button>
        </>
      )}
    </div>
  );
}
