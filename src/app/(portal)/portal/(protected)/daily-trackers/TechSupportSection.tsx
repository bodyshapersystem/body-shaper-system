"use client";

import { useState, useTransition } from "react";
import { createTechSupportCheckoutSession } from "./tech-support-actions";
import { TECH_SUPPORT_ADDONS, type AddonType } from "@/lib/tech-support-config";

export default function TechSupportSection({ allowedAddons, systemName }: { allowedAddons: AddonType[]; systemName: string | null }) {
  const [openAddon, setOpenAddon] = useState<AddonType | null>(null);
  const [sessions, setSessions] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (allowedAddons.length === 0) return null;

  function handleCheckout(addonType: AddonType) {
    setError("");
    startTransition(async () => {
      const result = await createTechSupportCheckoutSession(addonType, sessions);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.url) window.location.href = result.url;
    });
  }

  return (
    <div className="techsup-section">
      <p className="dtj-mini-label">ENHANCE YOUR SYSTEM</p>
      <p className="techsup-intro">Recommended support available for your current System{systemName ? ` — ${systemName}` : ""}.</p>

      {allowedAddons.slice(0, 3).map((addonType) => {
        const addon = TECH_SUPPORT_ADDONS[addonType];
        const open = openAddon === addonType;
        return (
          <div key={addonType} className="techsup-card">
            <p className="techsup-card-title">{addon.label}</p>
            <p className="techsup-card-desc">{addon.description}</p>
            <div className="techsup-card-meta">
              <span>{addonType}</span>
              <span>1 session</span>
              <span>${(addon.pricePerSessionCents / 100).toFixed(0)}</span>
            </div>

            {!open ? (
              <button type="button" className="dtj-log-btn" style={{ marginBottom: 0 }} onClick={() => { setOpenAddon(addonType); setSessions(1); setError(""); }}>
                ADD TO MY SYSTEM →
              </button>
            ) : (
              <div className="techsup-add-form">
                <p className="dtj-field-label">Current System</p>
                <p className="techsup-current-system">{systemName ?? "Personalized System™"}</p>
                <p className="dtj-field-label">Adding</p>
                <div className="dtj-pill-row">
                  {[1, 2].map((n) => (
                    <button key={n} type="button" className={`dtj-pill ${sessions === n ? "dtj-pill-active" : ""}`} onClick={() => setSessions(n)}>
                      {n} {addonType} Session{n > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
                <p className="techsup-total">Total: ${((addon.pricePerSessionCents * sessions) / 100).toFixed(0)}</p>
                {error && <p className="sched-error">{error}</p>}
                <button type="button" className="dtj-editor-save" style={{ width: "100%", marginTop: 8 }} onClick={() => handleCheckout(addonType)} disabled={isPending}>
                  {isPending ? "Redirecting…" : "ADD + CHECKOUT →"}
                </button>
                <button type="button" className="dtj-link-small" style={{ display: "block", textAlign: "center", marginTop: 8 }} onClick={() => setOpenAddon(null)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
