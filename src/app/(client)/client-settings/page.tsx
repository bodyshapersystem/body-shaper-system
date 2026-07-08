"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className={`toggle${on ? " on" : ""}`} onClick={() => setOn((v) => !v)} />
  );
}

export default function ClientSettingsPage() {
  return (
    <div className="dash-wrap">
      <DashboardSidebar active="settings" />

      <main className="dash-main" style={{ maxWidth: 720 }}>
        <div className="dash-greeting">
          <h1>Settings</h1>
          <p>Manage your profile and communication preferences.</p>
        </div>

        <div className="settings-section">
          <h3>Profile</h3>
          <div className="field-row">
            <div className="field">
              <label>Email</label>
              <input type="email" defaultValue="sarah@email.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" defaultValue="+1 (305) 555-0182" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Birthday</label>
              <input type="text" defaultValue="June 12" />
            </div>
            <div className="field">
              <label>Emergency Contact</label>
              <input type="text" placeholder="Name & phone number" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Communication Preferences</h3>
          <div className="toggle-row">
            <span>Appointment Reminders</span>
            <Toggle defaultOn />
          </div>
          <div className="toggle-row">
            <span>Blueprint Rewards™ Updates</span>
            <Toggle defaultOn />
          </div>
          <div className="toggle-row">
            <span>Body Education™ Newsletter</span>
            <Toggle />
          </div>
          <div className="toggle-row">
            <span>SMS Notifications</span>
            <Toggle defaultOn />
          </div>
        </div>

        <button className="btn btn-primary">Save Changes</button>
      </main>
    </div>
  );
}
