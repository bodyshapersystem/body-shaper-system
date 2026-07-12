# Body Shaper System™ — Client Notification™ Email System
## Complete Production Package

Status: **Design approved. Templates built. Trigger code drafted. Pending: asset
hosting, font license, and connecting this code into the live repo.**

> Saved verbatim per Emmy's direction — NOT implemented yet. The Owner
> Dashboard/Hub V1 work is being completed first. Return to this spec for
> Email System integration, Resend implementation, testing and deployment
> once the Dashboard is production-ready.
>
> Asset status per Emmy (as of saving this doc):
> - Official linear Body Shaper System logo: ready
> - Brittany Signature: approved signature font
> - Emmy's transparent PNG: already prepared
> - Blueprint Waves, icons, decorative assets: already exist in the design
>   system, should be reused
> - Anything still needing optimization/export: use placeholders temporarily,
>   document exactly which files are required — do not block on this.

---

## 1. What's in this package

| File | Purpose |
|---|---|
| `master-template.html` | The single source template. Never duplicated — every notification is this file with different content injected. |
| `01-thank-you-blueprint-received.html` ... `10-system-completed.html` | The 10 approved templates, pre-compiled with correct copy/CTA/component variant, dynamic tokens left as `{{...}}` |
| `send.ts` | Complete Resend + Prisma send service — one function per email, with idempotency |
| This document | Variable mapping, trigger docs, Resend config, testing + deployment checklists |

---

## 2. Component structure (locked, per Design System v1.0)

```
Header (official logo)
  down
Four Point Star Divider
  down
Founder photo (Email 02 ONLY - arch-cropped)
  down
Category (script accent - Brittany Signature)
  down
Headline (serif, 2 lines max, never script)
  down
Subheadline (optional, small uppercase)
  down
Four Point Star Divider
  down
Body copy (sans-serif)
  down
Feature Card (ONE of 4 approved content variants - container never changes)
  down
Primary CTA (single burgundy button, deep-links into Portal)
  down
Four Point Star Divider
  down
"Need anything?" card (same container as Feature Card, always present)
  down
Signature (script - Concierge on 9 emails, Emmy Branger on Email 02 only)
  down
Footer (identical on all 10)

Right-edge rail (all emails): Blueprint Waves texture, non-MSO clients only
Top-right accent (all emails): Blueprint Waves crop
```

### Feature Card variants (never invent a 5th)
| Variant | Used by |
|---|---|
| A - icon + title + text | 01, 02, 03, 05, 06 |
| B - 3-column date/time/location | 04, 07 |
| C - label:value pairs | 08 |
| D - stat/badge + secondary text | 09, 10 |

---

## 3. Dynamic variable master list

### Global brand tokens (fixed - from env/config, identical on every send)
```
brand.logo_url
brand.blueprint_waves_top_url
brand.blueprint_waves_side_url
brand.font_brittany_woff2_url
brand.font_brittany_woff_url
brand.icon_headset_url
brand.icon_clock_url
brand.icon_calendar_url
brand.icon_pin_url
brand.icon_chart_url
brand.icon_document_url
brand.icon_sparkle_url
brand.icon_laptop_url
brand.emmy_founder_photo_url
```

### Per-send dynamic tokens (from the triggering record)
| Email | Tokens |
|---|---|
| 01 | lead_first_name, cta_link |
| 02 | client_first_name, cta_link |
| 03 | client_first_name, cta_link |
| 04 | client_first_name, appointment_date, appointment_time, appointment_location, specialist_name, cta_link |
| 05 | client_first_name, progress_update_summary, cta_link |
| 06 | client_first_name, document_name, document_type, published_at, cta_link |
| 07 | client_first_name, appointment_date, appointment_time, appointment_location, system_name, cta_link |
| 08 | client_first_name, payment_amount, payment_date, payment_method, payment_plan, remaining_balance, cta_link |
| 09 | client_first_name, reward_name, points_balance, cta_link |
| 10 | client_first_name, sessions_completed, cta_link |

**Security rule (per source doc):** payment_method must always arrive as a
pre-masked label (e.g. "Visa •••• 4471") from the payment processor. Never
pass raw card numbers, CVC, or full processor payloads into an email token.

---

## 4. Trigger documentation

| # | Trigger event | Guard condition | Idempotency key | Sender |
|---|---|---|---|---|
| 01 | Lead submits Blueprint form | - | leadId + blueprint_received_v1 | blueprint@ |
| 02 | First payment confirmed + lead-to-client conversion | - | clientId + welcome_v1 | hello@ (Emmy Branger) |
| 03 | Portal provisioned | auth access confirmed to exist | clientId + portal_ready_v1 (distinct from 02) | concierge@ |
| 04 | 24h before first appointment | appointmentType === body_blueprint_session | appointmentId + session_tomorrow | blueprint@ |
| 05 | New progress record(s) published | debounce ~15 min window | one send per day per clientId | concierge@ |
| 06 | New document published | visibility === client (never internal) | documentId | concierge@ |
| 07 | Appointment created or confirmed | confirmation STATE change only, not every edit | appointmentId + confirmedAt timestamp | concierge@ |
| 08 | Payment reaches confirmed/succeeded | - | paymentId (one per genuinely new payment) | concierge@ |
| 09 | Reward granted | - | rewardGrantId | concierge@ |
| 10 | All sessions in Personalized System completed | - | clientSystemId | concierge@ |

---

## 5. Resend configuration

### Sender identities (final, per this doc)
| Address | Display name | Used for |
|---|---|---|
| blueprint@bodyshapersystem.com | Body Shaper System Blueprint | Emails 01, 04 |
| hello@bodyshapersystem.com | Emmy Branger \| Body Shaper System | Email 02 only |
| concierge@bodyshapersystem.com | Body Shaper System Concierge | Emails 03, 05-10 |

DNS/domain verification for all three was completed in an earlier session -
confirm it's still passing before go-live (SPF/DKIM/DMARC can silently drift
if DNS records get touched elsewhere).

RECONCILIATION NOTE (read before implementing): this sender table differs
from the SENDERS map already live in src/lib/email/resend.ts (currently:
hello@ = "Body Shaper System" for owner/admin only, never routine client
comms; concierge@ = "The Body Shaper Concierge" for the Welcome/Activation
email). This new spec moves the Welcome email (Email 02) to hello@ as "Emmy
Branger" personally, and introduces email 03 as a separate "Portal
provisioned" notification from concierge@, distinct from Welcome. Reconcile
these two designs before building - don't run both at once.

### Required environment variables
```
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
EMAIL_ASSET_LOGO_URL=
EMAIL_ASSET_WAVES_TOP_URL=
EMAIL_ASSET_WAVES_SIDE_URL=
EMAIL_ASSET_FONT_WOFF2_URL=
EMAIL_ASSET_FONT_WOFF_URL=
EMAIL_ASSET_ICON_HEADSET_URL=
EMAIL_ASSET_ICON_CLOCK_URL=
EMAIL_ASSET_ICON_CALENDAR_URL=
EMAIL_ASSET_ICON_PIN_URL=
EMAIL_ASSET_ICON_CHART_URL=
EMAIL_ASSET_ICON_DOCUMENT_URL=
EMAIL_ASSET_ICON_SPARKLE_URL=
EMAIL_ASSET_ICON_LAPTOP_URL=
EMAIL_ASSET_EMMY_PHOTO_URL=
WELCOME_GUIDE_PDF_URL=          # optional, only if attaching in Email 02
```

---

## 6. Deep-link routing table

| Email | CTA destination (route) |
|---|---|
| 01 | /blueprint/{submissionId} - no auth required, lead-stage |
| 02 | /portal/onboarding |
| 03 | /portal/dashboard |
| 04 | /portal/appointments/{appointmentId} |
| 05 | /portal/progress |
| 06 | /portal/documents/{documentId} or /portal/documents if no detail route |
| 07 | /portal/appointments/{appointmentId} |
| 08 | /portal/payments/{paymentId} |
| 09 | /portal/rewards |
| 10 | /portal/progress/timeline |

RECONCILIATION NOTE: several of these routes (/portal/onboarding,
/portal/appointments/{id}, /portal/payments/{id}, /portal/progress,
/portal/progress/timeline) don't exist in the Client Portal yet. Confirm or
build these routes as part of implementation - don't ship broken deep links.

---

## 7. Email logging schema (as proposed in this doc)

Two log tables:

```
model LeadEmailLog {
  id        String   @id @default(cuid())
  leadId    String
  emailKey  String
  sentAt    DateTime @default(now())
  lead      Lead     @relation(fields: [leadId], references: [id])

  @@unique([leadId, emailKey])
}

model ClientEmailLog {
  id        String   @id @default(cuid())
  clientId  String
  emailKey  String
  sentAt    DateTime @default(now())
  client    Client   @relation(fields: [clientId], references: [id])

  @@unique([clientId, emailKey])
}
```

The @@unique constraint is the real idempotency guarantee - send.ts's
alreadySent() check plus this DB constraint together prevent duplicate sends
even under race conditions (two webhook deliveries firing near-simultaneously).

RECONCILIATION NOTE: the live schema already has an EmailEvent model
(src/lib/email/service.ts) covering this same need - one unified log across
both Lead- and Client-stage sends, with delivery status tracking
(QUEUED/SENT/DELIVERED/FAILED), not just a sent timestamp. Decide at
implementation time whether to adopt this doc's two-table LeadEmailLog/
ClientEmailLog design instead, or extend the existing EmailEvent model with
the idempotency keys this doc calls for - don't build both.

---

## 8. Testing checklist

Rendering
- Gmail (web + iOS + Android app)
- Apple Mail (macOS + iOS)
- Outlook desktop (Windows) - confirm graceful degradation: square corners instead of arch/circles, no side rail, script falls back to italic serif
- Outlook web
- Yahoo Mail
- Dark mode rendering in Gmail/Apple Mail (cream background should not invert to something illegible)

Content
- Every {{token}} resolves - no literal {{...}} left in a sent email
- Long values don't break layout (long client names, long document names, large payment amounts)
- Founder photo displays correctly in Email 02 only
- Correct sender identity/display name per email

Trigger logic
- Each of the 10 triggers fires exactly once for its guard condition
- Email 02 and 03 both fire without duplicating each other
- Email 07 does not re-fire on every appointment edit, only on confirmation state change
- Email 05 batches multiple progress writes into one send
- Email 04 never fires for non-Blueprint-session appointments
- Email 06 never fires for internal/owner-only documents

Deliverability
- SPF/DKIM/DMARC still passing for all 3 sender domains
- Test sends land in inbox, not spam, across Gmail/Outlook/Yahoo
- Unsubscribe/compliance footer requirements checked if applicable to transactional mail in your jurisdiction

---

## 9. Deployment checklist

- All brand.* assets exported and hosted (logo, Blueprint Waves x2, icons x8, Emmy's photo)
- Brittany Signature license confirmed + .woff2/.woff files hosted
- All env vars set in Vercel (Production + Preview)
- LeadEmailLog / ClientEmailLog migrations applied (or EmailEvent extended - see reconciliation note above)
- send.ts wired into the actual trigger points (webhook handlers, server actions, cron for debounced Email 05)
- Staging test: fire each of the 10 triggers against a test lead/client, verify email + idempotency
- Resend dashboard: confirm all 3 domains show verified status
- Go-live: monitor first real sends of each type before considering this closed

---

## 10. Remaining manual steps (blocking full production readiness)

1. Host all brand.* assets and fill in the env vars above - per Emmy: logo
   ready, Brittany Signature approved, Emmy's transparent PNG ready,
   Blueprint Waves/icons already exist in the design system and should be
   reused. Anything still needing export: use placeholders, document exactly
   which files are required, don't block Dashboard work over this.
2. Confirm Brittany Signature license and supply font files (per Emmy:
   approved - confirm files are actually hosted/exported when implementation
   starts)
3. Wire send.ts functions into the real Prisma models/webhooks (model field
   names above are illustrative - match to your actual schema)
4. Decide Email 02 PDF attachment vs. Documents-only delivery for the Welcome Guide
5. Run the full testing checklist in section 8 before first real client send
