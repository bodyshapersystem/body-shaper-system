"use client";

import { useState, useTransition } from "react";
import BlueprintWaves from "@/components/BlueprintWaves";
import { loginHubUser } from "./actions";

export default function HubLoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await loginHubUser(formData);
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
          <h1>hub sign in.</h1>
          <p className="auth-form-sub">Internal access only.</p>

          <form action={handleSubmit}>
            <label htmlFor="hub-email">Email Address</label>
            <input id="hub-email" name="email" type="email" placeholder="you@bodyshapersystem.com" required />

            <label htmlFor="hub-password">Password</label>
            <input id="hub-password" name="password" type="password" placeholder="••••••••" required />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-help">
            Need access? <a href="mailto:hello@bodyshapersystem.com">hello@bodyshapersystem.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
