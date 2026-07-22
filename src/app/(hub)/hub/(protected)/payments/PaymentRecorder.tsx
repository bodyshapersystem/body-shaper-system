"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPayment,
  getClientFinancialSummary,
  updatePlanTotal,
  getFullPaymentDiscount,
  generatePaymentSchedule,
  payInstallment,
  getClientPaymentSchedule,
} from "./actions";
import SendPaymentReminderButton from "@/app/(hub)/hub/(protected)/clients/[id]/SendPaymentReminderButton";

type ClientOption = { id: string; firstName: string; lastName: string };

type FinancialSummary = {
  assessmentId: string | null;
  firstName: string;
  lastName: string;
  system: string | null;
  currentSession: number;
  totalSessions: number | null;
  planTotalCents: number | null;
  paidCents: number;
  pendingCents: number;
  balanceCents: number | null;
};

type ScheduleRow = {
  id: string;
  amountCents: number;
  status: string;
  dueDate: string | Date | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
};

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
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [discountCents, setDiscountCents] = useState<number | null>(null);

  const [planTotalInput, setPlanTotalInput] = useState("");
  const [installmentCount, setInstallmentCount] = useState("4");
  const [cadenceDays, setCadenceDays] = useState("14");

  const [applyTo, setApplyTo] = useState<string>("custom");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CARD");
  const [origin, setOrigin] = useState("CLIENT_PAYMENT");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [recorded, setRecorded] = useState<{
    amountCents: number;
    method: string;
    newBalanceCents: number | null;
    installmentLabel: string | null;
  } | null>(null);

  async function reloadClientData(id: string) {
    const [s, discount, sched] = await Promise.all([
      getClientFinancialSummary(id),
      getFullPaymentDiscount(),
      getClientPaymentSchedule(id),
    ]);
    setSummary(s);
    setDiscountCents(discount);
    setSchedule(sched as unknown as ScheduleRow[]);
    return s;
  }

  function handleClientChange(id: string) {
    setClientId(id);
    setSummary(null);
    setSchedule([]);
    setAmount("");
    setApplyTo("custom");
    setReference("");
    setNotes("");
    setRecorded(null);
    if (!id) return;
    setLoadingSummary(true);
    startTransition(async () => {
      await reloadClientData(id);
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
      await reloadClientData(clientId);
      setPlanTotalInput("");
    });
  }

  function handleGenerateSchedule() {
    if (!summary?.assessmentId) return;
    setError("");
    const formData = new FormData();
    formData.set("installmentCount", installmentCount);
    formData.set("cadenceDays", cadenceDays);
    startTransition(async () => {
      const result = await generatePaymentSchedule(clientId, summary.assessmentId!, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      await reloadClientData(clientId);
    });
  }

  const pendingInstallments = schedule.filter((s) => s.status === "PENDING");
  const selectedInstallment = pendingInstallments.find((s) => s.id === applyTo);

  function handleApplyToChange(value: string) {
    setApplyTo(value);
    const inst = pendingInstallments.find((s) => s.id === value);
    if (inst) setAmount((inst.amountCents / 100).toFixed(2));
    else if (summary?.balanceCents != null && summary.balanceCents > 0) setAmount((summary.balanceCents / 100).toFixed(2));
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

    startTransition(async () => {
      let result;
      if (selectedInstallment) {
        const formData = new FormData();
        formData.set("amount", amount);
        formData.set("method", method);
        if (reference) formData.set("reference", reference);
        if (notes) formData.set("notes", notes);
        result = await payInstallment(selectedInstallment.id, formData);
      } else {
        const formData = new FormData();
        formData.set("clientId", clientId);
        formData.set("amount", amount);
        formData.set("method", method);
        formData.set("origin", origin);
        formData.set("status", "PAID");
        formData.set("paymentType", "CUSTOM_AMOUNT");
        if (reference) formData.set("reference", reference);
        if (notes) formData.set("notes", notes);
        result = await createPayment(formData);
      }

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
        installmentLabel: selectedInstallment ? `Payment ${selectedInstallment.installmentNumber} of ${selectedInstallment.installmentTotal}` : null,
      });
      router.refresh();
    });
  }

  function resetAll() {
    setRecorded(null);
    setClientId("");
    setSummary(null);
    setSchedule([]);
    setAmount("");
    setApplyTo("custom");
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
          {recorded.installmentLabel && (
            <div>
              <span>Installment</span>
              <strong>{recorded.installmentLabel}</strong>
            </div>
          )}
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
              {summary.totalSessions !== null ? `Session ${summary.currentSession} of ${summary.totalSessions}` : `Session ${summary.currentSession} · plan not set yet`}
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

          {/* ---------- Payment Schedule ---------- */}
          {summary.planTotalCents !== null && schedule.length === 0 && (
            <div className="sched-section">
              <h4 className="sched-subheading">Payment Schedule</h4>
              <p className="sched-hint">No schedule yet — split the total plan into equal installments.</p>
              <div className="pay-schedule-setup">
                <label className="sched-label">
                  Installments
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    className="sched-select"
                  />
                </label>
                <label className="sched-label">
                  Days Between
                  <input type="number" min={1} value={cadenceDays} onChange={(e) => setCadenceDays(e.target.value)} className="sched-select" />
                </label>
              </div>
              <button type="button" className="pay-plan-save-btn pay-generate-btn" onClick={handleGenerateSchedule}>
                Generate Payment Schedule
              </button>
              <div style={{ marginTop: 12 }}>
                <SendPaymentReminderButton clientId={clientId} />
              </div>
            </div>
          )}

          {schedule.length > 0 && (
            <div className="sched-section">
              <h4 className="sched-subheading">Payment Schedule</h4>
              <div style={{ marginBottom: 12 }}>
                <SendPaymentReminderButton clientId={clientId} />
              </div>
              <ul className="pay-schedule-list">
                {schedule.map((s) => (
                  <li key={s.id} className="pay-schedule-row">
                    <div>
                      <strong>
                        Payment {s.installmentNumber} of {s.installmentTotal}
                      </strong>
                      <span>{s.dueDate ? new Date(s.dueDate).toLocaleDateString() : ""}</span>
                    </div>
                    <div className="pay-schedule-right">
                      <span>{money(s.amountCents)}</span>
                      <span className={`dash-status dash-status-${s.status.toLowerCase()}`}>{s.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sched-section">
            <h4 className="sched-subheading">Record Payment</h4>

            {pendingInstallments.length > 0 && (
              <>
                <label className="sched-label">Apply To</label>
                <div className="pay-origin-options">
                  {pendingInstallments.map((inst) => (
                    <label key={inst.id} className="pay-origin-option">
                      <input type="radio" name="applyTo" checked={applyTo === inst.id} onChange={() => handleApplyToChange(inst.id)} />
                      Payment {inst.installmentNumber} of {inst.installmentTotal} — {money(inst.amountCents)}
                      {inst.dueDate ? ` — due ${new Date(inst.dueDate).toLocaleDateString()}` : ""}
                    </label>
                  ))}
                  <label className="pay-origin-option">
                    <input type="radio" name="applyTo" checked={applyTo === "custom"} onChange={() => handleApplyToChange("custom")} />
                    Custom Amount
                  </label>
                </div>
              </>
            )}

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

            {applyTo === "custom" && (
              <>
                <label className="sched-label sched-notes-label">Payment Origin</label>
                <div className="pay-origin-options">
                  {PAYMENT_ORIGINS.map((o) => (
                    <label key={o.value} className="pay-origin-option">
                      <input type="radio" name="origin" checked={origin === o.value} onChange={() => setOrigin(o.value)} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </>
            )}

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
