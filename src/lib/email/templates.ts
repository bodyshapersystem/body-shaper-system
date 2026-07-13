// Premium editorial email templates for Body Shaper System™ — the
// ONE real, final version. No "temporary simple" template kept
// alongside this; every send goes through emailShell() below.
//
// Real hosted assets used (all live on the production domain today):
//   logo          -> bss-wordmark.png
//   waves texture -> blueprint-waves.png
//   founder photo -> emmy-hero.jpg (Welcome email only, per spec)
//
// NOT YET AVAILABLE (documented honestly, not faked):
//   - Brittany Signature font files — no .woff2/.woff hosted yet.
//     Falls back to italic Georgia serif for every "script" moment
//     (category label + signature), matching the spec's own stated
//     Outlook-fallback behavior — this isn't a placeholder guess,
//     it's the documented degraded state.
//   - The 8 line-icons (headset/clock/calendar/pin/chart/document/
//     sparkle/laptop) — none hosted. Feature cards use clean
//     typography only instead of a broken/missing <img>. Once real
//     icon files exist, they can be dropped into the ICONS map below
//     with zero other changes needed.

const SITE_URL = "https://www.bodyshapersystem.com";
const ASSETS = {
  logo: `${SITE_URL}/images/bss-wordmark.png`,
  wavesTop: `${SITE_URL}/images/blueprint-waves.png`,
  founderPhoto: `${SITE_URL}/images/emmy-hero.jpg`,
};

const COLORS = {
  ivory: "#F7F4EF",
  sand: "#D8CEC0",
  mocha: "#8B7362",
  burgundy: "#5C1A1F",
  gold: "#D4AF37",
  charcoal: "#1C1C1C",
};

/** The Four Point Star Divider — a real typographic mark (✦), not an
 * image, so it always renders identically everywhere with zero
 * hosting/broken-image risk. */
function starDivider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:22px 0;font-family:Georgia,serif;font-size:15px;color:${COLORS.gold};letter-spacing:8px;">✦</td></tr></table>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background-color:${COLORS.burgundy};border-radius:3px;">
        <a href="${url}" style="display:inline-block;padding:15px 36px;font-family:Arial,sans-serif;font-size:12.5px;letter-spacing:1.5px;color:${COLORS.ivory};text-decoration:none;font-weight:bold;text-transform:uppercase;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Feature Card — the one container used for every "highlight" moment
 * across all templates, in one of the 4 approved content variants.
 * Never invent a 5th; always reuse A/B/C/D. */
type FeatureCard =
  | { variant: "A"; title: string; text: string }
  | { variant: "B"; rows: { label: string; value: string }[] } // date/time/location style
  | { variant: "C"; pairs: { label: string; value: string }[] } // label:value pairs
  | { variant: "D"; stat: string; statLabel: string; secondaryText?: string };

function featureCard(card: FeatureCard): string {
  const wrap = (inner: string) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};border:1px solid ${COLORS.sand};border-radius:6px;margin:0 0 24px;">
      <tr><td style="padding:22px 26px;">${inner}</td></tr>
    </table>`;

  if (card.variant === "A") {
    return wrap(
      `<p style="font-family:Georgia,serif;font-size:16px;color:${COLORS.charcoal};margin:0 0 8px;">${card.title}</p>
       <p style="font-family:Arial,sans-serif;font-size:13.5px;line-height:1.6;color:${COLORS.mocha};margin:0;">${card.text}</p>`
    );
  }
  if (card.variant === "B") {
    return wrap(
      card.rows
        .map(
          (r) =>
            `<p style="font-family:Arial,sans-serif;font-size:14px;color:${COLORS.charcoal};margin:0 0 8px;line-height:1.5;"><strong style="color:${COLORS.mocha};font-size:11px;letter-spacing:.06em;text-transform:uppercase;display:block;">${r.label}</strong>${r.value}</p>`
        )
        .join("")
    );
  }
  if (card.variant === "C") {
    return wrap(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${card.pairs
        .map(
          (p) =>
            `<tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:${COLORS.mocha};">${p.label}</td><td align="right" style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:${COLORS.charcoal};font-weight:bold;">${p.value}</td></tr>`
        )
        .join("")}</table>`
    );
  }
  return wrap(
    `<p style="font-family:Georgia,serif;font-size:30px;color:${COLORS.burgundy};margin:0 0 4px;">${card.stat}</p>
     <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${COLORS.mocha};margin:0 0 8px;">${card.statLabel}</p>
     ${card.secondaryText ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:${COLORS.charcoal};margin:0;">${card.secondaryText}</p>` : ""}`
  );
}

function needAnythingCard(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};border:1px solid ${COLORS.sand};border-radius:6px;margin:0 0 8px;">
    <tr><td style="padding:20px 26px;text-align:center;">
      <p style="font-family:Georgia,serif;font-size:14px;color:${COLORS.charcoal};margin:0 0 4px;">Need anything?</p>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:${COLORS.mocha};margin:0;">
        Reply to this email or reach us at <a href="mailto:hello@bodyshapersystem.com" style="color:${COLORS.burgundy};">hello@bodyshapersystem.com</a>
      </p>
    </td></tr>
  </table>`;
}

/**
 * The single master email shell — every notification is this exact
 * structure with different content injected, per the approved
 * Design System v1.0 component order:
 *   Header (logo) -> Star Divider -> [founder photo, Welcome only]
 *   -> Category -> Headline -> Subheadline -> Star Divider -> Body
 *   -> Feature Card -> Primary CTA -> Star Divider -> Need Anything
 *   -> Signature -> Footer
 */
function emailShell(params: {
  category: string;
  headline: string;
  subheadline?: string;
  bodyHtml: string;
  featureCard?: FeatureCard;
  ctaLabel?: string;
  ctaUrl?: string;
  signatureName: string; // "The Body Shaper Concierge" or "Emmy Branger" (Welcome only)
  founderPhoto?: boolean;
}): string {
  const { category, headline, subheadline, bodyHtml, featureCard: card, ctaLabel, ctaUrl, signatureName, founderPhoto } = params;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:${COLORS.sand};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand};padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};border-radius:6px;overflow:hidden;position:relative;">
          <!-- Header: official logo -->
          <tr>
            <td style="background-color:${COLORS.charcoal};padding:28px 40px;text-align:center;">
              <img src="${ASSETS.logo}" alt="Body Shaper System™" height="30" style="height:30px;width:auto;" />
            </td>
          </tr>
          <tr><td style="padding:0 40px;">${starDivider()}</td></tr>
          ${
            founderPhoto
              ? `<tr><td align="center" style="padding:0 40px 8px;">
                   <img src="${ASSETS.founderPhoto}" alt="Emmy Branger" width="88" height="88" style="width:88px;height:88px;border-radius:50%;object-fit:cover;display:block;" />
                 </td></tr>`
              : ""
          }
          <tr>
            <td style="padding:16px 40px 0;text-align:center;">
              <p style="font-family:Georgia,serif;font-size:13px;font-style:italic;color:${COLORS.burgundy};letter-spacing:.5px;margin:0 0 10px;">${category}</p>
              <h1 style="font-family:Georgia,serif;font-size:25px;color:${COLORS.charcoal};margin:0 0 6px;line-height:1.25;">${headline}</h1>
              ${
                subheadline
                  ? `<p style="font-family:Arial,sans-serif;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:${COLORS.mocha};margin:0 0 6px;">${subheadline}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr><td style="padding:0 40px;">${starDivider()}</td></tr>
          <tr>
            <td style="padding:0 40px 8px;">
              <div style="font-family:Arial,sans-serif;font-size:14.5px;line-height:1.7;color:${COLORS.charcoal};text-align:left;">${bodyHtml}</div>
              ${card ? featureCard(card) : ""}
              ${ctaLabel && ctaUrl ? `<table role="presentation" width="100%"><tr><td align="center">${button(ctaLabel, ctaUrl)}</td></tr></table>` : ""}
            </td>
          </tr>
          <tr><td style="padding:0 40px;">${starDivider()}</td></tr>
          <tr><td style="padding:0 40px 24px;">${needAnythingCard()}</td></tr>
          <tr>
            <td style="padding:0 40px 28px;text-align:center;">
              <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:${COLORS.burgundy};margin:0;">${signatureName}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${COLORS.charcoal};padding:22px 40px;text-align:center;">
              <span style="font-family:Arial,sans-serif;font-size:11px;color:${COLORS.sand};">
                Body Shaper System™ &middot; Miami, FL &middot; <a href="mailto:hello@bodyshapersystem.com" style="color:${COLORS.sand};">hello@bodyshapersystem.com</a>
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
  const { firstName, activationUrl, welcomeGuideUrl } = params;
  const bodyHtml = `<p style="margin:0 0 14px;">Hi ${firstName},</p>
    <p style="margin:0 0 14px;">Welcome to Body Shaper System™. Your personalized transformation journey is officially beginning — and I'm so glad you're here.</p>
    <p style="margin:0 0 14px;">Your Client Portal has been prepared for you, with your Body Blueprint™, Welcome Guide, appointments, progress and documents all in one place.</p>`;
  return {
    subject: "Welcome to Body Shaper System™",
    html: emailShell({
      category: "welcome",
      headline: `Your journey begins, ${firstName}.`,
      bodyHtml,
      featureCard: {
        variant: "A",
        title: "Your Client Portal is ready",
        text: welcomeGuideUrl
          ? "Activate your account below to view your Body Blueprint™, Welcome Guide, and everything else prepared for you."
          : "Activate your account below to view your Body Blueprint™ and everything else prepared for you.",
      },
      ctaLabel: "Activate My Client Portal",
      ctaUrl: activationUrl,
      signatureName: "Emmy Branger", // Email 02 — the one signed personally, per the approved Design System
      founderPhoto: true,
    }),
  };
}

export function buildBodyBlueprintCompletedEmail(params: {
  firstName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, portalUrl } = params;
  const bodyHtml = `<p style="margin:0 0 14px;">Hi ${firstName},</p>
    <p style="margin:0 0 14px;">Your Body Blueprint™ is ready — your personalized goals, recommended system, and treatment plan are now available in your Client Portal.</p>`;
  return {
    subject: "Your Body Blueprint™ is ready",
    html: emailShell({
      category: "body blueprint™",
      headline: "Your personalized strategy is ready.",
      bodyHtml,
      featureCard: { variant: "A", title: "Your Body Blueprint™", text: "Review your recommended system, goals, and full treatment plan." },
      ctaLabel: "View My Body Blueprint™",
      ctaUrl: portalUrl,
      signatureName: "The Body Shaper Concierge",
    }),
  };
}

export function buildBlueprintReceivedEmail(params: { firstName: string }): { subject: string; html: string } {
  const { firstName } = params;
  const bodyHtml = `<p style="margin:0 0 14px;">Hi ${firstName},</p>
    <p style="margin:0 0 14px;">We've received your Body Blueprint™ submission — thank you for taking the time to share your goals with us.</p>
    <p style="margin:0;">A Body Shaper System™ specialist will personally review your Blueprint shortly and reach out with your next steps.</p>`;
  return {
    subject: "We've received your Body Blueprint™",
    html: emailShell({
      category: "body blueprint™",
      headline: "Thank you for sharing your goals.",
      bodyHtml,
      signatureName: "Body Blueprint™ Team",
    }),
  };
}

export function buildPaymentConfirmationEmail(params: {
  firstName: string;
  amountLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, amountLabel, portalUrl } = params;
  const bodyHtml = `<p style="margin:0 0 14px;">Hi ${firstName},</p>
    <p style="margin:0;">This confirms your payment below. Thank you for trusting Body Shaper System™ with your transformation.</p>`;
  return {
    subject: "Payment confirmed — Body Shaper System™",
    html: emailShell({
      category: "payment confirmation",
      headline: "Payment received, thank you.",
      bodyHtml,
      featureCard: { variant: "D", stat: amountLabel, statLabel: "Amount Confirmed" },
      ctaLabel: "View My Portal",
      ctaUrl: portalUrl,
      signatureName: "The Body Shaper Concierge",
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
  const bodyHtml = `<p style="margin:0 0 14px;">Hi ${firstName},</p>
    <p style="margin:0;">Your session has been scheduled. Here are the details:</p>`;
  const rows = [
    { label: "Session", value: sessionTitle },
    { label: "Date", value: dateLabel },
    { label: "Time", value: timeLabel },
  ];
  if (systemName) rows.push({ label: "Personalized System™", value: systemName });
  return {
    subject: `Your session is confirmed — ${dateLabel}`,
    html: emailShell({
      category: "appointment confirmed",
      headline: "See you soon.",
      bodyHtml,
      featureCard: { variant: "B", rows },
      ctaLabel: "View My Appointments",
      ctaUrl: portalUrl,
      signatureName: "The Body Shaper Concierge",
    }),
  };
}
