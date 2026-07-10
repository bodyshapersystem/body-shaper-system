"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BlueprintWaves from "@/components/BlueprintWaves";

export default function PortalSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password && confirm && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    // Phase 1 demo gate — any credentials are accepted. Production
    // account creation is Phase 2.
    window.sessionStorage.setItem("bss_portal_demo_auth", "1");
    router.push("/portal/dashboard");
  }

  return (
    <div className="auth-screen">
      <div className="auth-side">
        <BlueprintWaves className="auth-side-waves" />
        <div className="auth-side-inner">
          <span className="auth-wordmark">
            body
            <br />
            shaper
            <br />
            system™
          </span>
          <p className="auth-tagline">
            science.
            <br />
            strategy.
            <br />
            transformation.
          </p>
          <span className="auth-spark" aria-hidden="true">
            ✦
          </span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h1>create your account.</h1>
          <p className="auth-form-sub">Begin your personalized transformation.</p>

          <form onSubmit={handleSubmit}>
            <div className="auth-two-col">
              <div>
                <label htmlFor="signup-first">First Name</label>
                <input
                  id="signup-first"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="signup-last">Last Name</label>
                <input
                  id="signup-last"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="youremail@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/portal/login">Sign In →</Link>
          </p>

          <p className="auth-help">
            Need help? <a href="mailto:hello@bodyshapersystem.com">hello@bodyshapersystem.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
