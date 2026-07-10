/**
 * Email Ecosystem — automation sequence structure.
 *
 * This defines the 10-email sequence shared by the Email Ecosystem
 * Architecture documentation page and, in Phase 2, the actual sending
 * logic once Resend + PostgreSQL + production triggers are connected.
 *
 * IMPORTANT: this is structure only. Nothing here sends real email.
 * There is no Resend API call, no database read/write, and no trigger
 * wiring yet — those are explicitly Phase 2 scope.
 */

export interface EmailSequenceStep {
  order: number;
  key: string;
  subject: string;
  trigger: string;
  description: string;
}

export const EMAIL_SEQUENCE: EmailSequenceStep[] = [
  {
    order: 1,
    key: "welcome",
    subject: "Welcome",
    trigger: "Blueprint completed",
    description: "Your journey starts here.",
  },
  {
    order: 2,
    key: "consultation_confirmation",
    subject: "Consultation Confirmation",
    trigger: "Consultation booked",
    description: "We've received your booking.",
  },
  {
    order: 3,
    key: "blueprint_summary",
    subject: "Blueprint Summary",
    trigger: "Body Blueprint™ generated",
    description: "Your Body Blueprint™ is ready.",
  },
  {
    order: 4,
    key: "treatment_begins",
    subject: "Treatment Begins",
    trigger: "Treatment purchased",
    description: "Let's start your transformation.",
  },
  {
    order: 5,
    key: "preparation_guide",
    subject: "Preparation Guide",
    trigger: "24h before first session",
    description: "How to prepare for your session.",
  },
  {
    order: 6,
    key: "after_care",
    subject: "After Care",
    trigger: "Session completed",
    description: "How to care for your body afterward.",
  },
  {
    order: 7,
    key: "progress_check",
    subject: "Progress Check",
    trigger: "7 days after session",
    description: "How are you feeling? Let us know.",
  },
  {
    order: 8,
    key: "progress_photos",
    subject: "Progress Photos",
    trigger: "Scheduled check-in",
    description: "Upload your progress photos.",
  },
  {
    order: 9,
    key: "body_rewards",
    subject: "Body Rewards™",
    trigger: "Reward unlocked",
    description: "Earn points. Unlock benefits.",
  },
  {
    order: 10,
    key: "future_recommendations",
    subject: "Future Recommendations",
    trigger: "Program milestone reached",
    description: "What's next for your journey.",
  },
];
