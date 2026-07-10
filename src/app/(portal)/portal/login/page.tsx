"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_EMAIL = "demo@bodyshapersystem.com";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Temporary demo gate only — no real authentication yet.
    // Any password is accepted; the email just needs to be the demo
    // address so this doesn't get mistaken for a real login.
    if (email.trim().toLowerCase() !== DEMO_EMAIL) {
      setError(`Use the demo email: ${DEMO_EMAIL}`);
      return;
    }
    window.sessionStorage.setItem("bss_portal_demo_auth", "1");
    router.push("/portal/dashboard");
  }

  return (
    <div className="portal-login-wrap cat-body">
      <div className="portal-login-card">
        <span className="portal-login-word">body shaper system™</span>
        <h1>Client Portal</h1>
        <p className="portal-login-sub">Temporary demo access — production authentication arrives in Phase 2.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="demo-email">Email</label>
          <input
            id="demo-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="demo-password">Password</label>
          <input id="demo-password" type="password" placeholder="any password works" />
          {error && <p className="portal-login-error">{error}</p>}
          <button type="submit" className="asb-btn-primary" style={{ marginTop: "18px" }}>
            Enter Portal
          </button>
        </form>

        <p className="portal-login-note">Demo credential: {DEMO_EMAIL}</p>
      </div>
    </div>
  );
}
