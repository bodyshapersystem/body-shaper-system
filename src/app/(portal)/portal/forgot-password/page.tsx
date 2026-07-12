"use client";

import { useState } from "react";
import Link from "next/link";
import BlueprintWaves from "@/components/BlueprintWaves";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PortalForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/reset-password`,
    });
    setIsPending(false);
    setSubmitted(true);
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
          {submitted ? (
            <>
              <h1>check your inbox.</h1>
              <p className="auth-form-sub">
                If an account exists for this email, we've sent instructions to reset your password.
              </p>
              <button type="button" className="auth-submit" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Resending…" : "Resend Email"}
              </button>
              <p className="auth-switch">
                <Link href="/portal/login">← Back to sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h1>reset your password.</h1>
              <p className="auth-form-sub">
                Enter the email associated with your account and we'll send you a secure reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="youremail@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="auth-submit" disabled={isPending}>
                  {isPending ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p className="auth-switch">
                <Link href="/portal/login">← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
