"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { checkOnboardingStatus } from "./actions";

export default function OnboardingFlow({
  firstName,
  initialStep,
  agreementUrl,
  consentUrl,
}: {
  firstName: string;
  initialStep: 1 | 2;
  agreementUrl: string;
  consentUrl: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | "done">(initialStep);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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
      if (!result.success) return;

      if (result.isComplete) {
        setStep("done");
      } else if (result.currentStep === 2 && step === 1) {
        setStep(2);
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

  const isStep1 = step === 1;

  return (
    <div className="onb-card">
      <p className="onb-eyebrow">welcome to body shaper system™</p>
      <h1 className="onb-title">Hi {firstName},</h1>
      <p className="onb-sub">Before accessing your portal, let's complete your onboarding.</p>

      <div className="onb-progress">
        <span className="onb-progress-label">Step {isStep1 ? 1 : 2} of 2</span>
        <div className="onb-progress-track">
          <div className="onb-progress-fill" style={{ width: isStep1 ? "50%" : "100%" }} />
        </div>
      </div>

      <div className="onb-step-body">
        <h2 className="onb-step-title">{isStep1 ? "Complete your Client Agreement." : "Complete your Medical Consent."}</h2>
        <p className="onb-step-sub">
          {isStep1
            ? "Review and sign your Client Agreement & Policies — this opens in a new tab."
            : "Review and sign your Medical Consent — this opens in a new tab."}
        </p>
        <a href={isStep1 ? agreementUrl : consentUrl} target="_blank" rel="noopener noreferrer" className="onb-cta">
          Continue
        </a>
        <p className="onb-poll-hint">{checking ? "Checking…" : "We'll detect your signature automatically once it's submitted."}</p>
      </div>
    </div>
  );
}
