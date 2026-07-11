// Email templates for Body Shaper System™.
//
// Table-based layout with inline CSS throughout — this is required
// for reliable rendering across email clients (Gmail, Outlook, Apple
// Mail all strip <style> blocks or mis-render flexbox/grid). Brand
// colors match the site's design system.
//
// NOTE: these are NEW templates built for this automated flow — they
// are not the same as the 10 previously-approved marketing email
// templates from the lead-nurture sequence. Review before wide use.

const COLORS = {
  ivory: "#F7F4EF",
  sand: "#D8CEC0",
  mocha: "#8B7362",
  burgundy: "#5C1A1F",
  gold: "#D4AF37",
  charcoal: "#1C1C1C",
};

function emailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:${COLORS.sand};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.sand};padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:${COLORS.ivory};border-radius:4px;overflow:hidden;">
          <tr>
            <td style="background-color:${COLORS.burgundy};padding:32px 40px;text-align:center;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:1px;color:${COLORS.ivory};">body shaper system&trade;</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${COLORS.sand};text-align:center;">
              <span style="font-family:Arial,sans-serif;font-size:12px;color:${COLORS.mocha};">
                Need help? <a href="mailto:hello@bodyshapersystem.com" style="color:${COLORS.mocha};">hello@bodyshapersystem.com</a>
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

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:${COLORS.burgundy};border-radius:3px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;color:${COLORS.ivory};text-decoration:none;font-weight:bold;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function buildWelcomeActivationEmail(params: {
  firstName: string;
  activationUrl: string;
  welcomeGuideUrl?: string;
}): { subject: string; html: string } {
  const { firstName, activationUrl, welcomeGuideUrl } = params;

  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${COLORS.charcoal};margin:0 0 20px;">
      Hi ${firstName},
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.charcoal};margin:0 0 16px;">
      Welcome to Body Shaper System&trade;. Your personalized transformation journey is officially beginning.
    </p>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.charcoal};margin:0 0 8px;">
      Your Client Portal has been prepared for you. Inside, you'll be able to access:
    </p>
    <ul style="font-family:Arial,sans-serif;font-size:14px;line-height:1.9;color:${COLORS.charcoal};margin:0 0 8px;padding-left:20px;">
      <li>Your Body Blueprint&trade;</li>
      <li>Your Welcome Guide</li>
      <li>Your appointments</li>
      <li>Your measurements and progress</li>
      <li>Your documents</li>
      <li>Your messages</li>
      <li>Your Body Rewards&trade;</li>
    </ul>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.charcoal};margin:16px 0 0;">
      Use the button below to securely create your password and activate your account.
    </p>
    ${button("ACTIVATE MY CLIENT PORTAL", activationUrl)}
    ${
      welcomeGuideUrl
        ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:${COLORS.mocha};margin:24px 0 0;">Your Welcome Guide is ready.</p>${button(
            "VIEW MY WELCOME GUIDE",
            welcomeGuideUrl
          )}`
        : ""
    }
  `;

  return {
    subject: "Welcome to Body Shaper System™",
    html: emailShell(body),
  };
}

export function buildBodyBlueprintCompletedEmail(params: {
  firstName: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, portalUrl } = params;
  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${COLORS.charcoal};margin:0 0 20px;">
      Hi ${firstName},
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.charcoal};margin:0 0 16px;">
      Your Body Blueprint&trade; is ready — your personalized goals, recommended system, and treatment plan
      are now available in your Client Portal.
    </p>
    ${button("VIEW MY BODY BLUEPRINT™", portalUrl)}
  `;
  return { subject: "Your Body Blueprint™ is ready", html: emailShell(body) };
}

export function buildPaymentConfirmationEmail(params: {
  firstName: string;
  amountLabel: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const { firstName, amountLabel, portalUrl } = params;
  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${COLORS.charcoal};margin:0 0 20px;">
      Hi ${firstName},
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.charcoal};margin:0 0 16px;">
      This confirms your payment of <strong>${amountLabel}</strong>. Thank you for trusting Body Shaper System&trade;
      with your transformation.
    </p>
    ${button("VIEW MY PORTAL", portalUrl)}
  `;
  return { subject: "Payment confirmed — Body Shaper System™", html: emailShell(body) };
}
