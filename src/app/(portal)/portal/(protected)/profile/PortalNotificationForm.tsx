"use client";

import { useTransition } from "react";
import { updatePortalNotificationPreferences } from "./actions";

export default function PortalNotificationForm({ emailNotifications }: { emailNotifications: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updatePortalNotificationPreferences(formData);
    });
  }

  return (
    <form action={handleSubmit} className="settings-toggle-list">
      <label className="settings-toggle-row">
        <span>Email Notifications</span>
        <span className="settings-toggle">
          <input type="checkbox" name="emailNotifications" defaultChecked={emailNotifications} />
          <span className="settings-toggle-track" />
        </span>
      </label>
      <button type="submit" className="dash-view-btn" style={{ marginTop: 12 }} disabled={isPending}>
        {isPending ? "Saving…" : "Save Preferences"}
      </button>
    </form>
  );
}
