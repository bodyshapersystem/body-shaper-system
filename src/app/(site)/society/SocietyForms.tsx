"use client";

import { useState, useTransition } from "react";
import { applyToSociety, loginSociety, activateSocietyAccount } from "./actions";

function useAction() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  function submit(fn: (fd: FormData) => Promise<{ error?: string; success?: boolean } | undefined | void>) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      setError("");
      startTransition(async () => {
        const r = await fn(fd);
        if (r && "error" in r && r.error) setError(r.error);
        else setDone(true);
      });
    };
  }
  return { error, done, isPending, submit };
}

export function ApplyForm() {
  const { error, done, isPending, submit } = useAction();
  if (done) return <p className="soc-body">Thank you — your application is in. We review every one personally and will email you soon.</p>;
  return (
    <form className="soc-form" onSubmit={submit(applyToSociety)}>
      <div className="soc-form-row">
        <input name="firstName" required placeholder="First name" className="sched-select" />
        <input name="lastName" placeholder="Last name" className="sched-select" />
      </div>
      <input name="email" type="email" required placeholder="Email" className="sched-select" />
      <input name="phone" placeholder="Phone" className="sched-select" />
      <input name="instagram" placeholder="Instagram / TikTok @" className="sched-select" />
      <textarea name="note" rows={3} placeholder="Tell us about your community" className="sched-textarea" />
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
      {error && <p className="soc-msg">{error}</p>}
      <button type="submit" className="soc-btn" disabled={isPending}>{isPending ? "Sending…" : "Apply to the Shaper Society"}</button>
    </form>
  );
}

export function LoginForm() {
  const { error, isPending, submit } = useAction();
  return (
    <form className="soc-form" onSubmit={submit(loginSociety)}>
      <input name="email" type="email" required placeholder="Email" className="sched-select" autoComplete="email" />
      <input name="password" type="password" required placeholder="Password" className="sched-select" autoComplete="current-password" />
      {error && <p className="soc-msg">{error}</p>}
      <button type="submit" className="soc-btn" disabled={isPending}>{isPending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function ActivateForm({ token }: { token: string }) {
  const { error, isPending, submit } = useAction();
  return (
    <form className="soc-form" onSubmit={submit(activateSocietyAccount)}>
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" minLength={8} required placeholder="Create a password (8+ characters)" className="sched-select" autoComplete="new-password" />
      {error && <p className="soc-msg">{error}</p>}
      <button type="submit" className="soc-btn" disabled={isPending}>{isPending ? "Creating…" : "Create my login"}</button>
    </form>
  );
}
