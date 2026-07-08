"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function ClientDashboardPage() {
  const [rewardsUnlocked, setRewardsUnlocked] = useState(false);

  useEffect(() => {
    setRewardsUnlocked(window.localStorage.getItem("bss_rewards_unlocked") === "1");
  }, []);

  return (
    <div className="dash-wrap">
      <DashboardSidebar active="dashboard" />

      <main className="dash-main">
        <div className="dash-greeting reveal in">
          <h1>Good Morning, Sarah.</h1>
          <p>Welcome back to your transformation journey.</p>
        </div>

        <div className="dash-grid reveal in">
          {/* Card 1: Body Credits */}
          <div className="dash-card">
            <div className="card-label">Current Body Credits™</div>
            <div className="credit-num">125</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: "83%" }} />
            </div>
            <div className="bar-nums">
              <span>125</span>
              <span>150</span>
            </div>
            <div className="small-note">25 Body Credits™ until your next Privilege.</div>
          </div>

          {/* Card 4: Current System */}
          <div className="dash-card">
            <div className="card-label">Current Personalized System™</div>
            <h3>Sculpt Signature™</h3>
            <div className="sys-tags">
              <span className="sys-tag">Exilis®</span>
              <span className="sys-tag">EMS®</span>
              <span className="sys-tag">Lymphatic Protocol™</span>
            </div>
            <span className="status-pill">Active</span>
          </div>

          {/* Card 2: Progress (full width) */}
          <div className="dash-card span-2">
            <div className="card-label">Current Progress</div>
            <div className="progress-line">
              <div className="p-step">
                <div className="p-dot">✓</div>
                <h5>Blueprint™</h5>
                <span>Completed</span>
              </div>
              <div className="p-step">
                <div className="p-dot">✓</div>
                <h5>System™</h5>
                <span>Completed</span>
              </div>
              <div className="p-step current">
                <div className="p-dot">2/6</div>
                <h5>Treatment Sessions</h5>
                <span>In Progress</span>
              </div>
              <div className="p-step upcoming">
                <div className="p-dot">—</div>
                <h5>Next Appointment</h5>
                <span>July 18</span>
              </div>
              <div className="p-step upcoming">
                <div className="p-dot">—</div>
                <h5>Current Phase</h5>
                <span>Skin Tightening</span>
              </div>
            </div>
          </div>

          {/* Card 3: Next Appointment */}
          <div className="dash-card">
            <div className="card-label">Next Appointment</div>
            <div className="appt-row">
              <span className="lbl">Date</span>
              <span className="val">July 18, 2026</span>
            </div>
            <div className="appt-row">
              <span className="lbl">Time</span>
              <span className="val">10:00 AM</span>
            </div>
            <div className="appt-row">
              <span className="lbl">Location</span>
              <span className="val">Home Visit — Kendall</span>
            </div>
            <div className="appt-row">
              <span className="lbl">Status</span>
              <span className="status-pill">Confirmed</span>
            </div>
          </div>

          {/* Card 6: Resources */}
          <div className="dash-card">
            <div className="card-label">Recommended Resources</div>
            <div className="resource-list">
              <a href="/tech-talks#article-hydration">
                Hydration Guide <span>→</span>
              </a>
              <a href="/tech-talks#article-recovery">
                Recovery Guide <span>→</span>
              </a>
              <a href="/tech-talks">
                Technology Education <span>→</span>
              </a>
              <a href="/faq">
                FAQ <span>→</span>
              </a>
            </div>
          </div>

          {/* Card 5: Progress Photos (full width) */}
          <div className="dash-card span-2">
            <div className="card-label">Progress Photos</div>
            <div className="photo-trio">
              <div className="ph-block dark">
                <span>Before</span>
              </div>
              <div className="ph-block">
                <span>Progress</span>
              </div>
              <div className="ph-block rose">
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Card 7: Blueprint Rewards — teased until unlocked */}
          <div className="dash-card" id="rewards">
            <div className="card-label">Blueprint Rewards™</div>
            {rewardsUnlocked ? (
              <>
                <div className="appt-row">
                  <span className="lbl">Current Credits</span>
                  <span className="val">125</span>
                </div>
                <div className="appt-row">
                  <span className="lbl">Current Privilege</span>
                  <span className="val">—</span>
                </div>
                <div className="appt-row">
                  <span className="lbl">Current Challenges</span>
                  <span className="val">1 Active</span>
                </div>
                <a href="#" className="btn btn-dark-outline" style={{ marginTop: 20 }}>
                  Explore Rewards
                </a>
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: "#6b6259" }}>
                Complete your welcome experience to unlock Blueprint Rewards™.
              </p>
            )}
          </div>

          {/* Card 8: Need Assistance */}
          <div className="dash-card">
            <div className="card-label">Need Assistance?</div>
            <p style={{ fontSize: 13.5, color: "#6b6259" }}>
              We&rsquo;re here whenever you need us.
            </p>
            <div className="assist-actions">
              <a href="https://wa.me/17379755112" className="btn btn-dark-outline">
                WhatsApp
              </a>
              <a href="tel:+17379755112" className="btn btn-dark-outline">
                Call
              </a>
              <a href="mailto:hello@bodyshapersystem.com" className="btn btn-dark-outline">
                Email
              </a>
            </div>
          </div>
        </div>

        {/* FUTURE PLACEHOLDERS */}
        <div className="future-section">
          <span className="card-label">Coming Soon</span>
          <div className="future-grid">
            <div className="future-tile">
              ◻︎<span>Square</span>
              <small>Payments</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Appointment History</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Client Notes</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Invoices</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Referral History</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>QR Code</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Partner Experiences</span>
              <small>Coming Soon</small>
            </div>
            <div className="future-tile">
              ◻︎<span>Secret Challenges™</span>
              <small>Coming Soon</small>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
