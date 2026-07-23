"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { checkOnboardingStatus } from "./actions";

export default function OnboardingFlow({
  firstName,
  initialStep,
  agreementUrl,
  consentUrl,
  totalSteps = 2,
}: {
  firstName: string;
  initialStep: 1 | 2 | 3;
  agreementUrl: string;
  consentUrl: string;
  totalSteps?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | "done">(initialStep);
  const [checking, setChecking] = useState(false);
  const [clickedContinue, setClickedContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset the "already clicked Continue" flag whenever the step
  // actually advances, so the next real step's Continue button works
  // normally again.
  useEffect(() => {
    setClickedContinue(false);
    setShowRetry(false);
  }, [step]);

  // If nothing advances within 40s of clicking Continue, offer a way
  // back to the real link instead of leaving them stuck on "waiting"
  // forever if they closed the Jotform tab without finishing it.
  useEffect(() => {
    if (!clickedContinue) return;
    retryTimeoutRef.current = setTimeout(() => setShowRetry(true), 40000);
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [clickedContinue]);

  // Poll for real completion while this screen is open — the actual
  // signature happens on the real Jotform form (external tab); this
  // is what lets the Portal "automatically" advance without a fake
  // in-app checkbox standing in for a real e-signature.
  useEffect(() => {
    if (step === "done") return;

    pollRef.current = setInterval(async () => {
      setChecking(true);
      const result = await checkOnboardingStatus();
      setChecking(false);
      if ("error" in result) return;

      if (result.isComplete) {
        setStep("done");
      } else if (result.currentStep !== step && result.currentStep <= 3) {
        setStep(result.currentStep as 1 | 2 | 3);
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step]);

  useEffect(() => {
    if (step !== "done") return;
    const timeout = setTimeout(() => {
      router.push("/portal/dashboard");
    }, 2200);
    return () => clearTimeout(timeout);
  }, [step, router]);

  if (step === "done") {
    return (
      <div className="onb-card onb-complete">
        <p className="onb-emoji">🎉</p>
        <h1 className="onb-title">You're all set.</h1>
        <p className="onb-sub">Your Body Shaper System™ experience is ready.</p>
        <p className="onb-loading-line">Entering your portal…</p>
        <div className="onb-spinner" aria-hidden="true" />
      </div>
    );
  }

  const stepTitles: Record<1 | 2 | 3, { title: string; sub: string }> = {
    1: { title: "Complete your Client Agreement.", sub: "Review and sign your Client Agreement & Policies — this opens in a new tab." },
    2: { title: "Complete your Medical Consent.", sub: "Review and sign your Medical Consent — this opens in a new tab." },
    3: { title: "Content Release Agreement", sub: "This document is being finalized by our team — we'll notify you the moment it's ready to sign." },
  };
  const current = stepTitles[step];

  return (
    <div className="onb-card">
      <p className="onb-eyebrow">welcome to body shaper system™</p>
      <h1 className="onb-title">Hi {firstName},</h1>
      <p className="onb-sub">Before accessing your portal, let's complete your onboarding.</p>

      <div className="onb-progress">
        <span className="onb-progress-label">Step {step} of {totalSteps}</span>
        <div className="onb-progress-track">
          <div className="onb-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      <div className="onb-step-body">
        <h2 className="onb-step-title">{current.title}</h2>
        <p className="onb-step-sub">{current.sub}</p>
        {step === 3 ? (
          <a href="/portal/messages" className="onb-cta">Message Your Specialist</a>
        ) : clickedContinue ? (
          <div className="onb-cta onb-cta-processing" aria-live="polite">
            Waiting for your submission to process…
          </div>
        ) : (
          <a
            href={step === 1 ? agreementUrl : consentUrl}
            className="onb-cta"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setClickedContinue(true)}
          >
            Continue
          </a>
        )}
        {step !== 3 && (
          <p className="onb-poll-hint">
            {clickedContinue
              ? "Already submitted? This can take up to a minute — no need to submit again."
              : checking
              ? "Checking…"
              : "You'll be brought back here automatically once it's submitted."}
          </p>
        )}
        {clickedContinue && showRetry && (
          <button type="button" className="onb-retry-link" onClick={() => setClickedContinue(false)}>
            Didn't finish, or the form didn't open? Click here to try again.
          </button>
        )}
      </div>
    </div>
  );
}
