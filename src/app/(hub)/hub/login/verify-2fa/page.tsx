"use client";

import { useState, useTransition } from "react";
import BlueprintWaves from "@/components/BlueprintWaves";
import { verifyTotpLogin } from "../actions";

export default function Verify2FAPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    const code = String(formData.get("code") ?? "");
    startTransition(async () => {
      const result = await verifyTotpLogin(code);
      if (result?.error) setError(result.error);
    });
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
            the hub.
            <br />
            the brain of
            <br />
            the company.
          </p>
          <span className="auth-spark" aria-hidden="true">
            ✦
          </span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h1>two-factor code.</h1>
          <p className="auth-form-sub">Enter the 6-digit code from your authenticator app.</p>

          <form action={handleSubmit}>
            <label htmlFor="totp-code">Code</label>
            <input
              id="totp-code"
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              required
              autoFocus
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={isPending}>
              {isPending ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>

          <p className="auth-help">
            Lost access to your authenticator? <a href="mailto:hello@bodyshapersystem.com">hello@bodyshapersystem.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
