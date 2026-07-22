// Premium editorial email templates for Body Shaper System™ — the
// ONE real, final version, rebuilt to match the approved mockup
// ("thank you." / Blueprint Received design) as closely as HTML
// email reliably allows. This exact shell is reused by every other
// email — every future template inherits this same structure.
//
// Real hosted assets used (all live on the production domain today):
//   waves texture -> blueprint-waves.png
//   founder photo -> emmy-hero.jpg (Welcome email only, per spec)
//
// HONEST SUBSTITUTIONS (documented, not silently faked):
//   - Wordmark: rendered as real text ("Body Shaper System.", serif),
//     matching the mockup exactly — not a logo image. Simpler, and
//     removes a broken-image risk entirely.
//   - Icons (clock/sparkle/headset/pin/globe): no hosted icon files
//     exist yet, and inline SVG has inconsistent email-client support.
//     Using emoji glyphs (⏱ ✦ 🎧 📍 🌐) instead — these render
//     correctly in Gmail/Apple Mail/Outlook.com/mobile Outlook; only
//     legacy Outlook desktop may render them plainly rather than
//     styled, which is a graceful degradation, not a broken image.
//   - Brittany Signature script font: no .woff2/.woff hosted yet.
//     Signature line uses italic Georgia serif — this is the exact
//     documented fallback behavior from the approved spec, not a
//     placeholder guess.
//   - The large decorative corner wave/arch graphic from the mockup's
//     bottom-right: NOT reproduced. Background-image positioning like
//     that is unreliable across email clients (especially Outlook,
//     which ignores CSS background-image entirely) and risks a
//     broken/shifted layout more than it adds polish. Kept the
//     top-of-header wave texture only, which is simple enough to be
//     reliable everywhere.

const SITE_URL = "https://www.bodyshapersystem.com";
const ASSETS = {
  wavesTop: `${SITE_URL}/images/blueprint-waves.png`,
  founderPhoto: `${SITE_URL}/images/emmy-hero.jpg`,
};

const COLORS = {
  ivory: "#F7F2EA",
  sand: "#E4D6C3",
  sandLight: "#EFE4D4",
  mocha: "#8B7362",
  burgundy: "#8B3A3F",
  rose: "#A85D5D",
  gold: "#C9A876",
  charcoal: "#3A322C",
  taupeBar: "#A8967F",
};

function rule(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:48px;height:2px;background-color:${COLORS.rose};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
    <tr>
      <td style="background-color:${COLORS.burgundy};border-radius:3px;">
        <a href="${url}" style="display:inline-block;padding:15px 34px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;color:${COLORS.ivory};text-decoration:none;font-weight:bold;text-transform:uppercase;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Left-border-accent moment — a rose vertical line, an emoji glyph,
 * and text. Matches the "Within the next 24 hours..." block in the
 * approved mockup. */
function infoMoment(icon: string, html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
    <tr>
      <td width="4" style="background-color:${COLORS.rose};font-size:0;line-height:0;">&nbsp;</td>
      <td width="16" style="font-size:0;line-height:0;">&nbsp;</td>
      <td width="34" valign="top" style="font-size:22px;padding-top:2px;">${icon}</td>
      <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
      <td valign="top" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${COLORS.charcoal};">${html}</td>
    </tr>
  </table>`;
}

/** Solid sand-background highlight box — matches "Every recommendation
 * begins with understanding." Also used to hold structured content
 * (appointment date/time, payment amount, etc.) for other emails. */
function highlightMoment(icon: string, html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sandLight};border-radius:6px;margin:0 0 20px;">
    <tr>
      <td width="24" style="font-size:0;line-height:0;">&nbsp;</td>
      <td width="30" valign="top" style="padding:22px 0;font-size:19px;">${icon}</td>
      <td width="14" style="font-size:0;line-height:0;">&nbsp;</td>
      <td valign="top" style="padding:22px 0;font-family:Georgia,serif;font-size:15px;line-height:1.5;color:${COLORS.charcoal};">${html}</td>
      <td width="24" style="font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;
}

/** Icon centered inside a thin rose-outlined circle — matches the
 * mockup's line-art icon circles (payment/concierge/clock cards). */
function iconCircle(icon: string, size = 64): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:${size}px;height:${size}px;">
    <tr><td align="center" valign="middle" style="width:${size}px;height:${size}px;border:1px solid ${COLORS.rose};border-radius:50%;font-size:${Math.round(size * 0.4)}px;">${icon}</td></tr>
  </table>`;
}

/** Rounded sand card with a circled icon on the left and content on
 * the right — matches the "payment details" / "need anything?" cards
 * in the newer approved mockups. */
function iconCard(icon: string, headingHtml: string, bodyHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sandLight};border-radius:10px;margin:0 0 20px;">
    <tr>
      <td width="26" style="font-size:0;">&nbsp;</td>
      <td width="64" valign="top" style="padding:22px 0;">${iconCircle(icon)}</td>
      <td width="18" style="font-size:0;">&nbsp;</td>
      <td valign="top" style="padding:22px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${COLORS.charcoal};">
        ${headingHtml ? `<p style="font-family:Georgia,serif;font-size:17px;color:${COLORS.rose};margin:0 0 6px;">${headingHtml}</p>` : ""}
        ${bodyHtml}
      </td>
      <td width="26" style="font-size:0;">&nbsp;</td>
    </tr>
  </table>`;
}

function needAnythingCard(): string {
  return iconCard("🎧", "need anything?", `Your <strong>Body Shaper System Concierge™</strong> is here to help.`);
}

type FeatureCard =
  | { variant: "A"; icon: string; text: string }
  | { variant: "B"; rows: { label: string; value: string }[] }
  | { variant: "C"; pairs: { label: string; value: string }[] }
  | { variant: "D"; stat: string; statLabel: string };

function renderFeatureCardInline(card: FeatureCard): string {
  if (card.variant === "A") return card.text;
  if (card.variant === "B") {
    return card.rows.map((r) => `<strong>${r.label}:</strong> ${r.value}`).join("<br />");
  }
  if (card.variant === "C") {
    return card.pairs.map((p) => `${p.label}: <strong>${p.value}</strong>`).join("<br />");
  }
  return `<span style="font-size:26px;color:${COLORS.burgundy};">${card.stat}</span><br /><span style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${COLORS.mocha};">${card.statLabel}</span>`;
}

/**
 * The single master email shell, rebuilt to match the approved
 * mockup's exact composition: centered wordmark + rule, large
 * lowercase serif headline, tracked uppercase subheadline (2 lines),
 * short rose rule, body copy, info moment, highlight moment, rose
 * rule, closing line, script-style signature, Need Anything card,
 * footer (location + website), and the 3-item tagline bar.
 */
function emailShell(params: {
  eyebrowScript?: string;
  previewText?: string;
  headline: string;
  headlineAccent?: string;
  subheadlineLines: string[];
  bodyParagraphs: string[];
  infoMomentIcon?: string;
  infoMomentHtml?: string;
  featureCard?: FeatureCard;
  featureCardIcon?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  closingText: string;
  founderPhoto?: boolean;
  signatureName?: string;
}): string {
  const {
    eyebrowScript,
    previewText,
    headline,
    headlineAccent,
    subheadlineLines,
    bodyParagraphs,
    infoMomentIcon,
    infoMomentHtml,
    featureCard,
    featureCardIcon,
    ctaLabel,
    ctaUrl,
    closingText,
    founderPhoto,
    signatureName,
  } = params;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:${COLORS.ivory};font-family:Georgia,'Times New Roman',serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${COLORS.ivory};opacity:0;">${previewText}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};padding:36px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <span style="font-family:Georgia,serif;font-size:22px;color:${COLORS.mocha};">Body Shaper System.</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:36px;height:1px;background-color:${COLORS.mocha};font-size:0;">&nbsp;</td></tr></table>
            </td>
          </tr>

          ${
            founderPhoto
              ? `<tr><td align="center" style="padding:0 40px 20px;">
                   <img src="${ASSETS.founderPhoto}" alt="Emmy Branger" width="84" height="84" style="width:84px;height:84px;border-radius:50%;object-fit:cover;display:block;" />
                 </td></tr>`
              : ""
          }

          <!-- Headline + subheadline -->
          <tr>
            <td style="padding:0 40px;">
              ${
                eyebrowScript
                  ? `<p style="font-family:Georgia,serif;font-style:italic;font-size:22px;color:${COLORS.rose};margin:0 0 6px;">${eyebrowScript}</p>`
                  : ""
              }
              <h1 style="font-family:Georgia,serif;font-size:48px;line-height:1.05;color:${COLORS.charcoal};margin:0 0 18px;font-weight:normal;">${headline}${
    headlineAccent ? `<br /><span style="font-style:italic;color:${COLORS.rose};">${headlineAccent}</span>` : ""
  }</h1>
              <p style="font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.mocha};line-height:1.6;margin:0 0 20px;">
                ${subheadlineLines.join("<br />")}
              </p>
              ${rule()}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 40px 4px;">
              ${bodyParagraphs.map((p) => `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.charcoal};margin:0 0 16px;">${p}</p>`).join("")}
            </td>
          </tr>

          ${infoMomentIcon && infoMomentHtml ? `<tr><td style="padding:8px 40px 0;">${infoMoment(infoMomentIcon, infoMomentHtml)}</td></tr>` : ""}

          ${
            featureCard
              ? `<tr><td style="padding:0 40px;">${highlightMoment(featureCardIcon ?? "✦", renderFeatureCardInline(featureCard))}</td></tr>`
              : ""
          }

          ${
            ctaLabel && ctaUrl
              ? `<tr><td align="center" style="padding:4px 40px 8px;">${button(ctaLabel, ctaUrl)}</td></tr>`
              : ""
          }

          <tr><td style="padding:8px 40px 0;">${rule()}</td></tr>

          <!-- Closing + signature -->
          <tr>
            <td style="padding:20px 40px 4px;">
              <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.charcoal};margin:0 0 14px;">${closingText}</p>
              <p style="font-family:Georgia,serif;font-style:italic;font-size:19px;color:${COLORS.burgundy};margin:0 0 24px;">— ${signatureName ?? "Body Shaper System™"}</p>
            </td>
          </tr>

          <!-- Need anything -->
          <tr><td style="padding:0 40px;">${needAnythingCard()}</td></tr>

          <!-- Footer: location + website -->
          <tr>
            <td style="padding:0 40px 28px;">
              <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.mocha};">
                📍 Miami, Florida &nbsp;&nbsp;|&nbsp;&nbsp; 🌐 <a href="${SITE_URL}" style="color:${COLORS.burgundy};text-decoration:none;">bodyshapersystem.com</a>
              </span>
            </td>
          </tr>

          <!-- Tagline bar -->
          <tr>
            <td style="background-color:${COLORS.taupeBar};padding:18px 40px;text-align:center;">
              <span style="font-family:Arial,sans-serif;font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.ivory};">
                Advanced Technology. &nbsp;|&nbsp; Personalized Strategy. &nbsp;|&nbsp; Visible Results.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildWelcomeActivationEmail(params: {
  firstName: string;
  activationUrl: string;
  welcomeGuideUrl?: string;
}): { subject: string; html: string } {
  const { firstName, activationUrl } = params;
  const name = firstName?.trim() || "beautiful"; // per direction: fallback "Hello beautiful," never a username/email
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Welcome to Body Shaper System™, ${name}`,
    html: emailShell({
      eyebrowScript: "welcome.",
      headline: "your transformation",
      headlineAccent: "officially starts today.",
      subheadlineLines: ["YOUR JOURNEY WITH", "BODY SHAPER SYSTEM™ BEGINS NOW."],
      bodyParagraphs: [
        `${greeting}, welcome — I'm so glad you're here.`,
        "Your Client Portal has been prepared for you, with your Body Blueprint™, appointments, progress, and documents all in one place.",
      ],
      infoMomentIcon: "⏱",
      infoMomentHtml: "Activate your account below to set your password and step inside your Portal.",
      featureCard: { variant: "A", icon: "✦", text: "Every transformation begins with a single step." },
      featureCardIcon: "✦",
      ctaLabel: "Activate My Client Portal",
      ctaUrl: activationUrl,
      closingText: "We can't wait to help you create the best version of you.",
      founderPhoto: true,
      signatureName: "Emmy Branger",
    }),
  };
}

export function buildBodyBlueprintCompletedEmail(params: {
  firstName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Good news, ${name} — your Body Blueprint™ is ready`,
    html: emailShell({
      eyebrowScript: "you're making progress.",
      headline: "your plan",
      headlineAccent: "is ready for you.",
      subheadlineLines: ["YOUR PERSONALIZED", "BODY BLUEPRINT™ STRATEGY."],
      bodyParagraphs: [
        `${greeting}, your Body Blueprint™ is ready — your personalized goals, recommended system, and treatment plan are now available in your Client Portal.`,
      ],
      featureCard: { variant: "A", icon: "✦", text: "Every recommendation begins with understanding." },
      featureCardIcon: "✦",
      ctaLabel: "View My Body Blueprint™",
      ctaUrl: portalUrl,
      closingText: "We can't wait to help you create the best version of you.",
    }),
  };
}

export function buildBlueprintReceivedEmail(params: { firstName: string }): { subject: string; html: string } {
  const name = params.firstName?.trim() || "beautiful";
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()}` : "Hello beautiful"; // per direction: fallback "Hello beautiful," never a username/email
  return {
    subject: `Good news, ${name} — your Body Blueprint™ is under review`,
    html: emailShell({
      headline: "under review.",
      subheadlineLines: ["YOUR BLUEPRINT IS NOW", "UNDER REVIEW."],
      bodyParagraphs: [
        `${greeting}, thank you for taking the first step toward your transformation.`,
        "Our team is now personally reviewing your Blueprint to create the most effective strategy for your body, your goals, and your lifestyle.",
      ],
      infoMomentIcon: "⏱",
      infoMomentHtml: "Within the next <strong>24 hours</strong>, one of our specialists will reach out with your personalized recommendation.",
      featureCard: { variant: "A", icon: "✦", text: "Every recommendation begins with understanding." },
      featureCardIcon: "✦",
      closingText: "We can't wait to help you create the best version of you.",
    }),
  };
}

export function buildFirstSessionCheckinEmail(params: {
  firstName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, portalUrl } = params;
  const greeting = firstName?.trim() ? firstName.trim() : "beautiful";
  return {
    subject: "🤍 How are you feeling today?",
    html: emailShell({
      eyebrowScript: "checking in.",
      previewText: "A quick check-in after your first Body Shaper System™ session.",
      headline: "how are you",
      headlineAccent: "feeling today? ✨",
      subheadlineLines: ["A CHECK-IN AFTER YOUR", "FIRST SESSION."],
      bodyParagraphs: [
        `Hi ${greeting}, I just wanted to check in and see how you're feeling after your first Body Shaper System™ session.`,
        "First of all, congratulations on taking the first step toward your goals. We're so excited to be part of your journey.",
        "Every body responds differently after treatment, so don't compare your experience to anyone else's. You may notice:<br>✨ Mild redness in the treated area<br>✨ Slight tenderness or sensitivity<br>✨ A feeling of warmth<br>✨ Mild muscle soreness (if EMS was included)",
        "Or… you may not notice anything at all. And that's completely normal. Every body responds differently, and your results will develop gradually throughout your personalized system.",
        "<strong>A few friendly reminders 🤍</strong>",
        "💧 <strong>Have you logged your water intake today?</strong><br>Hydration is one of the most important things you can do to support your body after treatment. Aim to drink the amount of water recommended during your appointment.",
        "👗 <strong>Have you been wearing your compression garment?</strong><br>If compression was recommended for your personalized system, wearing it as instructed can help support your results.",
        "🚶 <strong>Have you moved your body today?</strong><br>You don't need an intense workout. Even a short walk or light movement can help support circulation and your body's natural recovery process.",
        "<strong>Don't forget your Daily Trackers</strong><br>Your transformation doesn't only happen during your appointments. The small habits you build between sessions are just as important. Take one minute today to complete your Daily Trackers:<br>✔ Water Intake<br>✔ Steps<br>✔ Sleep<br>✔ Healthy Habits<br><br>Keeping them updated will also help you stay engaged throughout your journey inside The Body Shaper System Society™.",
        "<strong>Today's Check-In</strong> — before you go…<br>☐ I drank my water today 💧<br>☐ I wore my compression garment 👗<br>☐ I moved my body 🚶<br>☐ I completed my Daily Trackers 📱",
      ],
      ctaLabel: "Open My Portal",
      ctaUrl: portalUrl,
      closingText:
        "If you have any questions, notice anything unusual, or simply want to check in, don't hesitate to reach out. We're here to support you every step of the way. See you at your next appointment!<br><br>With love,",
      signatureName: "Emmy, Founder of Body Shaper System",
    }),
  };
}

export function buildPaymentReminderEmail(params: {
  firstName: string;
  amountLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, amountLabel, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `A quick payment reminder, ${name}`,
    html: emailShell({
      eyebrowScript: "just a reminder.",
      headline: "payment",
      headlineAccent: "due.",
      subheadlineLines: ["A BALANCE IS STILL OUTSTANDING", "ON YOUR ACCOUNT."],
      bodyParagraphs: [
        `${greeting}, this is a friendly reminder that the balance below is still outstanding. You can view or settle it anytime from your portal.`,
      ],
      featureCard: { variant: "D", stat: amountLabel, statLabel: "Amount Due" },
      featureCardIcon: "✦",
      ctaLabel: "View My Portal",
      ctaUrl: portalUrl,
      closingText: "Thank you for your trust — reach out anytime if you have questions.",
    }),
  };
}

export function buildPaymentConfirmationEmail(params: {
  firstName: string;
  amountLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, amountLabel, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Payment received, ${name}`,
    html: emailShell({
      eyebrowScript: "thank you.",
      headline: "payment",
      headlineAccent: "received.",
      subheadlineLines: ["YOUR PAYMENT HAS BEEN", "RECEIVED AND CONFIRMED."],
      bodyParagraphs: [`${greeting}, this confirms your payment below. Thank you for trusting Body Shaper System™ with your transformation.`],
      featureCard: { variant: "D", stat: amountLabel, statLabel: "Amount Confirmed" },
      featureCardIcon: "✦",
      ctaLabel: "View My Portal",
      ctaUrl: portalUrl,
      closingText: "We're honored to be part of your journey.",
    }),
  };
}

export function buildAppointmentConfirmationEmail(params: {
  firstName: string;
  sessionTitle: string;
  dateLabel: string;
  timeLabel: string;
  systemName?: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, sessionTitle, dateLabel, timeLabel, systemName, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  const rows = [
    { label: "Session", value: sessionTitle },
    { label: "Date", value: dateLabel },
    { label: "Time", value: timeLabel },
  ];
  if (systemName) rows.push({ label: "System", value: systemName });
  return {
    subject: `Your session is confirmed, ${name}`,
    html: emailShell({
      eyebrowScript: "you're all set.",
      headline: "your session",
      headlineAccent: "is confirmed.",
      subheadlineLines: ["YOUR SESSION HAS BEEN", "SCHEDULED AND CONFIRMED."],
      bodyParagraphs: [`${greeting}, your session has been scheduled. Here are the details:`],
      featureCard: { variant: "B", rows },
      featureCardIcon: "⏱",
      ctaLabel: "View My Appointments",
      ctaUrl: portalUrl,
      closingText: "Every visit is another step toward your transformation.",
    }),
  };
}

export function buildRewardUnlockedEmail(params: {
  firstName: string;
  rewardLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, rewardLabel, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `You did it, ${name} — reward unlocked!`,
    html: emailShell({
      eyebrowScript: "you did it.",
      headline: "reward",
      headlineAccent: "unlocked!",
      subheadlineLines: ["BECAUSE YOUR COMMITMENT", "DESERVES TO BE CELEBRATED."],
      bodyParagraphs: [
        `${greeting}, thank you for being part of the Body Shaper System™ experience.`,
        "As a valued client, you've earned an exclusive reward that brings you even closer to your results.",
      ],
      featureCard: { variant: "A", icon: "🎁", text: `You've unlocked <strong>${rewardLabel}</strong> as part of your transformation journey. Check your Client Portal to see your reward and how to redeem it.` },
      featureCardIcon: "🎁",
      ctaLabel: "Access My Reward",
      ctaUrl: portalUrl,
      closingText: "Every milestone matters — we're so glad to celebrate this one with you.",
    }),
  };
}

export function buildSystemCompletedEmail(params: {
  firstName: string;
  systemName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, systemName, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Congratulations, ${name} — you completed your ${systemName}!`,
    html: emailShell({
      eyebrowScript: "congratulations!",
      headline: "you did it.",
      headlineAccent: `you completed your ${systemName}!`,
      subheadlineLines: ["YOUR RESULTS ARE", "WORTH CELEBRATING."],
      bodyParagraphs: [
        `${greeting}, this is more than the end of a program — it's the beginning of your next chapter.`,
        "Your dedication, consistency, and trust in the Body Shaper System™ process made this transformation possible. We are so proud of you.",
      ],
      featureCard: { variant: "A", icon: "✨", text: "Your transformation doesn't stop here. Let's keep building on your results and elevating your next level." },
      featureCardIcon: "✨",
      ctaLabel: "View My Next Steps",
      ctaUrl: portalUrl,
      closingText: "Thank you for trusting us with your journey — we can't wait to see what's next for you.",
    }),
  };
}

export function buildSessionReminderEmail(params: {
  firstName: string;
  sessionTitle: string;
  timeLabel: string;
  locationLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, sessionTitle, timeLabel, locationLabel, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Just a reminder, ${name} — your session is tomorrow`,
    html: emailShell({
      eyebrowScript: "just a reminder.",
      headline: sessionTitle,
      headlineAccent: "is tomorrow.",
      subheadlineLines: ["WE CAN'T WAIT", "TO SEE YOU."],
      bodyParagraphs: [`${greeting}, this is a friendly reminder that your session is coming up.`],
      featureCard: {
        variant: "C",
        pairs: [
          { label: "Time", value: timeLabel },
          { label: "Location", value: locationLabel },
        ],
      },
      featureCardIcon: "📅",
      ctaLabel: "View My Appointment Details",
      ctaUrl: portalUrl,
      closingText: "If you need to make any changes, please contact your concierge as soon as possible.",
    }),
  };
}

export function buildNewDocumentAvailableEmail(params: {
  firstName: string;
  documentTitle: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, documentTitle, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `New document available, ${name}`,
    html: emailShell({
      eyebrowScript: "new update.",
      headline: "new document",
      headlineAccent: "available.",
      subheadlineLines: ["STAY INFORMED.", "STAY ON TRACK."],
      bodyParagraphs: [
        `${greeting}, a new document — <strong>${documentTitle}</strong> — has been added to your Client Portal.`,
        "Please review it at your earliest convenience.",
      ],
      featureCard: { variant: "A", icon: "📄", text: "Log in to your Client Portal to access and review the new document." },
      featureCardIcon: "📄",
      ctaLabel: "Go To My Portal",
      ctaUrl: portalUrl,
      closingText: "Thank you for being part of your transformation — we're here for you, every step of the way.",
    }),
  };
}

/**
 * Ambassador Welcome — real content, matching the approved mockup's
 * copy and 5-step onboarding journey (docs/mockups/emails/ambassador-
 * welcome.png). Deliberately NOT replicating that mockup's bespoke
 * hero-photo-background + numbered-circle-with-arrows layout: a
 * background-image-behind-text hero is unreliable across email
 * clients (Outlook ignores background-image entirely), and risks a
 * broken/shifted layout in production email. Uses the same reliable
 * master shell as every other real email instead, with the real
 * Ambassador-specific copy and journey steps as text content.
 */
export function buildAmbassadorWelcomeEmail(params: {
  firstName: string;
  activationUrl: string;
}): { subject: string; html: string } {
  const { firstName, activationUrl } = params;
  const name = firstName?.trim() || "beautiful";
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()}` : "Hello beautiful";
  return {
    subject: `Welcome, ${name} — you're now a Body Shaper System™ Ambassador`,
    html: emailShell({
      eyebrowScript: "welcome,",
      headline: name,
      headlineAccent: "you're now part of something we're building with intention.",
      subheadlineLines: ["WE'RE THRILLED TO WELCOME YOU AS A", "BODY SHAPER SYSTEM™ AMBASSADOR."],
      bodyParagraphs: [
        `${greeting}, as an Ambassador you'll enjoy your personalized experience (the same premium onboarding as every client), your real journey (guided every step while creating authentic content together), exclusive rewards, and your own Ambassador Portal.`,
      ],
      featureCard: {
        variant: "A",
        icon: "✦",
        text: "Your onboarding journey: 1) Prepare for Your Experience 2) Body Blueprint™ Assessment 3) Almost Done 4) Content Release Agreement (Ambassador-exclusive) 5) Activate Your Ambassador Portal.",
      },
      featureCardIcon: "✦",
      ctaLabel: "Begin My Ambassador Journey",
      ctaUrl: activationUrl,
      closingText: "We're excited to grow together — thank you for trusting Body Shaper System™ and for becoming part of this new chapter.",
      signatureName: "Emmy Branger",
    }),
  };
}

/**
 * Real "Welcome to The Body Shaper System Society™" email — sent on a
 * real delay (3-4 hours after the main Welcome/Portal email), not at
 * conversion time, per direction. Introduces the real Rewards program:
 * Society Points, tiers, Unlock Experiences, Secret Missions,
 * Privileges.
 */
export function buildSocietyWelcomeEmail(params: {
  firstName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, portalUrl } = params;
  const name = firstName?.trim() || "beautiful";
  return {
    subject: "Welcome to The Body Shaper System Society ✨",
    html: emailShell({
      headline: "you've unlocked more than a treatment.",
      headlineAccent: "you've unlocked a community.",
      subheadlineLines: ["THE BODY SHAPER SYSTEM", "SOCIETY™"],
      bodyParagraphs: [
        `Hi ${name},`,
        "Welcome to The Body Shaper System Society — our exclusive rewards experience created to celebrate every step of your transformation journey.",
        "Because we believe progress isn't measured only by appointments&hellip; it's built through the small habits you create every day.",
        `<img src="${SITE_URL}/images/rewards/card-key.jpg" alt="The Body Shaper System Society membership card" width="520" style="width:100%;max-width:520px;height:auto;border-radius:14px;display:block;margin:8px 0 4px;" />`,
        "<strong>Here's how it works</strong><br />As you complete treatments, stay consistent, participate in challenges, and engage with the community, you'll earn Society Points (SPoints). Your SPoints can be redeemed for exclusive experiences and premium partner rewards.",
        "<strong>Ways to earn SPoints</strong><br />✨ Complete your appointments<br />✨ Unlock Secret Missions<br />✨ Join seasonal challenges<br />✨ Celebrate your birthday<br />✨ Refer friends<br />✨ Leave a Google review<br />✨ Participate in exclusive Society events<br />&hellip;and many more opportunities throughout the year.",
        "<strong>Unlock exclusive rewards</strong><br />Your SPoints can be redeemed for experiences such as:<br />• Pilates Classes<br />• Blowouts<br />• Spray Tans<br />• Relaxing Massages<br />• Lash Extensions<br />• Wellness Experiences<br />• Beauty Treatments<br />• Exclusive Partner Rewards<br />&hellip;and new privileges added regularly.",
        "<strong>Secret Missions</strong><br />Keep an eye on your Client Portal. From time to time, you'll receive Secret Missions — simple lifestyle challenges designed to help you stay consistent while earning extra SPoints. Some missions are only available for a limited time.",
        "Every point tells a story.<br />Every workout.<br />Every appointment.<br />Every healthy habit.<br />Every milestone.<br />It's all part of your transformation.",
        "<strong>Ready to start earning?</strong><br />Log in to your Client Portal and explore everything waiting for you inside The Body Shaper System Society.",
      ],
      ctaLabel: "Open My Rewards",
      ctaUrl: portalUrl,
      closingText: "The Body Shaper System Society — transform your body. Elevate your lifestyle.",
    }),
  };
}

/**
 * Real "We Miss You" reactivation campaign email — for past/inactive
 * Beauty Box clients, using Emmy's exact provided copy. First of the
 * planned Reactivation Campaigns series.
 */
export function buildWeMissYouEmail(params: {
  firstName: string;
  blueprintUrl: string;
}): { subject: string; html: string } {
  const { firstName, blueprintUrl } = params;
  const name = firstName?.trim() || "beautiful";
  return {
    subject: "We've Missed You — and We've Changed",
    html: emailShell({
      headline: "it's been a while,",
      headlineAccent: "and we've truly missed seeing you.",
      subheadlineLines: ["BEAUTY BOX IS NOW", "BODY SHAPER SYSTEM™"],
      bodyParagraphs: [
        `Hi ${name},`,
        "If you've noticed things look a little different&hellip; you're right. Beauty Box has evolved into Body Shaper System.",
        "This isn't just a new name&mdash;it's a completely new experience.",
        "Over the past months, we've redesigned everything to create a more personalized approach to body contouring. Instead of recommending random treatments, we now build a customized system based on your body, your goals, and your progress.",
        "Because every body deserves a strategy&mdash;not a guess.",
        "<strong>Here's what's new:</strong><br />✦ Personalized Body Blueprint™ &mdash; a complete evaluation that helps us design the right plan for your body.<br />✦ Signature Body Systems &mdash; curated treatment combinations designed to deliver better, longer-lasting results.<br />✦ Progress Tracking &mdash; photos, measurements, milestones, and a clear transformation journey.<br />✦ The Body Shaper System Society™ &mdash; our new exclusive rewards program where members unlock experiences, special perks, partner benefits, wellness gifts, seasonal challenges, and much more as they progress through their journey.",
        "And yes&hellip; we still bring everything directly to your home, so your treatments remain as convenient as ever.",
        "As someone who has trusted us before, we'd love to welcome you back and show you everything we've been building.",
        "Your body may have changed.<br />Your goals may have changed.<br />Our system has changed too&mdash;and it's better than ever.",
        "Click below to schedule your personalized consultation and discover your new Body Blueprint™.",
      ],
      ctaLabel: "Discover Your Body Blueprint™",
      ctaUrl: blueprintUrl,
      closingText: "We can't wait to see you again.",
      signatureName: "Emmy Branger, Founder",
    }),
  };
}
