"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getGoalCopy } from "@/lib/peptide-goal-copy";

export default function PeptideWelcomeScreen({
  peptideName,
  goalCategory,
  customGoal,
  currentSystemName,
  onReviewProtocol,
}: {
  peptideName: string;
  goalCategory: string | null;
  customGoal: string | null;
  currentSystemName: string | null;
  onReviewProtocol: () => void;
}) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState(0);
  const { focusLine, body } = getGoalCopy(goalCategory, customGoal);

  const CONNECT_STEPS = ["protocol connected.", "blueprint connected.", "trackers connected.", "your system is learning you. ✦"];

  function handleBegin() {
    setConnecting(true);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= CONNECT_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => router.refresh(), 900);
      }
    }, 700);
  }

  if (connecting) {
    return (
      <div className="dtj-welcome-connect">
        {CONNECT_STEPS.slice(0, step).map((line, i) => (
          <p key={i} className={i === step - 1 ? "dtj-connect-line dtj-connect-line-active" : "dtj-connect-line"}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="dtj-welcome">
      <p className="dtj-welcome-eyebrow">Welcome to your new journey. ✦</p>

      <p className="dtj-welcome-body">
        You've added <strong>{peptideName}</strong> to your Body Shaper System journey.
      </p>

      <p className="dtj-welcome-body">
        This new chapter has a focus: <em>{focusLine}</em>.
      </p>

      <p className="dtj-welcome-body">
        And now we're not just going to log your protocol — we're going to understand how your body responds as you move forward.
      </p>

      <p className="dtj-welcome-body">
        From today, we'll connect your Peptide Journey™, Daily Trackers™ and Body Blueprint™ to follow changes in body
        composition, habits, measurements, symptoms, progress, and how your body feels along the way.
      </p>

      <div className="dtj-welcome-goal-card">
        <p className="dtj-mini-label">your focus</p>
        <p className="dtj-welcome-goal-title">{focusLine}</p>
        <p className="dtj-welcome-goal-body">{body}</p>
      </div>

      {currentSystemName && (
        <p className="dtj-welcome-body">
          Your current system: <strong>{currentSystemName}</strong>
          <br />
          Your peptide journey will now become another signal we use to understand your progress.
        </p>
      )}

      <p className="dtj-welcome-body">
        Our goal isn't simply to log what you do.
        <br />
        It's to help you understand what's changing, what's working, and what your body may need next.
      </p>

      <p className="dtj-welcome-tagline">
        Your peptide is part of the journey.
        <br />
        Your body is the whole story.
      </p>

      <p className="dtj-welcome-body">Together, we'll track it, understand it and optimize what comes next. 🤎</p>

      <p className="dtj-welcome-signoff">
        Here with you as your body changes, evolves, and transforms.
        <br />
        With love,
        <br />
        <em>Emmy Branger</em>
        <br />
        Founder, Body Shaper System
      </p>

      <p className="dtj-welcome-motto">advanced technology. personalized strategy. visible results.</p>

      <button type="button" className="dtj-welcome-cta" onClick={handleBegin}>
        BEGIN MY JOURNEY →
      </button>
      <button type="button" className="dtj-welcome-secondary" onClick={onReviewProtocol}>
        Review my protocol
      </button>

      <p className="dtj-welcome-disclaimer">
        Your peptide protocol remains between you and your prescribing provider. Body Shaper System does not
        prescribe, modify or recommend peptide dosage. We use the information you choose to track to help
        personalize your body-optimization journey.
      </p>
    </div>
  );
}
