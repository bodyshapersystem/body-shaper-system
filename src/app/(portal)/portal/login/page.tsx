"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import BlueprintWaves from "@/components/BlueprintWaves";
import { loginPortalClient } from "./actions";

export default function PortalLoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await loginPortalClient(formData);
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
          <h1>welcome back.</h1>
          <p className="auth-form-sub">
            Sign in to continue your personalized Body Blueprint™ journey.
          </p>

          <form action={handleSubmit}>
            <label htmlFor="login-email">Email Address</label>
            <input id="login-email" name="email" type="email" placeholder="youremail@email.com" required />

            <div className="auth-label-row">
              <label htmlFor="login-password">Password</label>
              <Link href="#" className="auth-forgot">
                Forgot password?
              </Link>
            </div>
            <input id="login-password" name="password" type="password" placeholder="••••••••" required />

            <label className="auth-checkbox">
              <input type="checkbox" />
              Remember me
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link href="/portal/signup">Create your account →</Link>
          </p>

          <p className="auth-help">
            Need help? <a href="mailto:hello@bodyshapersystem.com">hello@bodyshapersystem.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

