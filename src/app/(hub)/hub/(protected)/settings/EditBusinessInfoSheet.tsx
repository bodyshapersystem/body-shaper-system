"use client";

import { useState, useTransition } from "react";
import { updateBusinessSettings } from "./actions";

export default function EditBusinessInfoSheet({
  businessName,
  contactEmail,
  contactPhone,
  address,
  website,
  timezone,
  fullPaymentDiscount,
}: {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  timezone: string;
  fullPaymentDiscount: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateBusinessSettings(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="sched-cta" onClick={() => setOpen(true)}>
        Edit Information
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Business Information</h3>
            <form action={handleSubmit} className="bp-sheet-form">
              <label className="sched-label">
                Business Name
                <input name="businessName" defaultValue={businessName} className="sched-select" />
              </label>
              <label className="sched-label">
                Business Email
                <input name="contactEmail" type="email" defaultValue={contactEmail} className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">
                  Phone Number
                  <input name="contactPhone" defaultValue={contactPhone} className="sched-select" />
                </label>
                <label className="sched-label">
                  Website
                  <input name="website" defaultValue={website} placeholder="www.example.com" className="sched-select" />
                </label>
              </div>
              <label className="sched-label">
                Address
                <input name="address" defaultValue={address} className="sched-select" />
              </label>
              <label className="sched-label">
                Time Zone
                <select name="timezone" defaultValue={timezone} className="sched-select">
                  <option value="America/New_York">(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                  <option value="America/Chicago">(GMT-06:00) Central Time (US &amp; Canada)</option>
                  <option value="America/Denver">(GMT-07:00) Mountain Time (US &amp; Canada)</option>
                  <option value="America/Los_Angeles">(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                </select>
              </label>
              <label className="sched-label">
                "Exclusive Courtesy" full-payment discount ($, leave blank to disable)
                <input name="fullPaymentDiscount" type="number" step="0.01" defaultValue={fullPaymentDiscount} placeholder="e.g. 120" className="sched-select" />
              </label>
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
