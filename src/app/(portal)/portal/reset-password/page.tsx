"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BlueprintWaves from "@/components/BlueprintWaves";
import PasswordInput from "@/components/auth/PasswordInput";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PortalResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function establishSession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setSessionError("This reset link is invalid or has expired. Please request a new one.");
          return;
        }
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
        return;
      }

      setSessionError("This reset link is invalid or has expired. Please request a new one.");
    }

    establishSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
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
          {success ? (
            <>
              <h1>password updated.</h1>
              <p className="auth-form-sub">Your password has been changed successfully. You can now sign in.</p>
              <Link href="/portal/login" className="auth-submit" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                Return to Sign In
              </Link>
            </>
          ) : sessionError ? (
            <>
              <h1>link expired.</h1>
              <p className="auth-form-sub">{sessionError}</p>
              <Link href="/portal/forgot-password" className="auth-submit" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                Request New Link
              </Link>
            </>
          ) : !ready ? (
            <p className="auth-form-sub">Verifying your reset link…</p>
          ) : (
            <>
              <h1>set a new password.</h1>
              <p className="auth-form-sub">Choose a new password for your account.</p>
              <form onSubmit={handleSubmit}>
                <label htmlFor="new-password">New Password</label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="confirm-password">Confirm New Password</label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <p className="pay-history-meta" style={{ marginBottom: 16 }}>
                  At least 8 characters.
                </p>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-submit" disabled={isPending}>
                  {isPending ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
