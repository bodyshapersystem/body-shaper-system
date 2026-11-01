# Client Proposals™ — master blueprint

Private, tokenised proposal pages at `/p/<token>`, built from one master template
(`src/components/proposals/ProposalExperience.tsx` + `proposal.css`). Only the data changes.

## Modules
01 welcome (burgundy) · 02 goals + official body diagram (sand) · 03 recommended systems (sand) ·
04 program details & payment (burgundy) · 05 technology + learn-more modals (olive) ·
06 how your blueprint works (sand) · 07 founder (burgundy, bio editable in Hub) ·
08 real results (olive) · 09 FAQ (sand) · 10 seasonal offer (burgundy, toggle per proposal + campaign in Hub) · closing.
English and Spanish (`language` per proposal).

## Hub
`/hub/proposals` (list) · `/hub/proposals/new` · `/hub/proposals/[id]` (builder + link, WhatsApp, activity,
checkouts, 2nd-installment link) · `/hub/proposals/[id]/preview` · `/hub/proposals/settings` (founder bio, campaign).
Permission: `payments.manage`.

## Payments (existing Stripe integration)
* Amounts are recomputed on the server from the stored proposal (`priceProgram`), never taken from the browser.
* Pay in full = total − saving (default $100). Pay in 2 = total split in two one-off Checkout Sessions:
  installment 1 at booking (explicit consent checkbox, stored with timestamp and text), installment 2 generated
  from the Hub once the real program start date is set (due Week 2 = start + 7 days).
* No subscriptions, no `setup_future_usage`, no saved cards.
* Webhook branch `flowType: client_proposal` (idempotent, re-checks `amount_total`) records Payments
  (FULL_PAYMENT, or INSTALLMENT 1/2 PAID + 2/2 PENDING with due date).
* 333 promo reuses `/api/holiday-333/checkout` (same product/prices/terms) with an optional `proposalToken`.
* Gate: with a LIVE key, proposal checkouts stay disabled until `PROPOSALS_LIVE_PAYMENTS=true`.

## Security
256-bit tokens · 404 for inactive/expired/unknown · `noindex` meta + `X-Robots-Tag` + robots.txt ·
`Referrer-Policy: no-referrer` · `Cache-Control: private, no-store` · internal notes and client ids never sent
to the page · RLS enabled (no policies) on the new tables.

## Database
Migration: `prisma/migrations/00000000000066_client_proposals/migration.sql` (new tables only; must be applied
to Supabase before the Hub pages work).

## Asset library — `public/proposal-assets/`
| path | source | status |
|---|---|---|
| brand/backgrounds/burgundy-marble/burgundy-marble-original.png | original attachment, byte-identical | approved |
| brand/backgrounds/sand-marble/sand-marble-gold-waves-original.png | original attachment, byte-identical | approved |
| brand/backgrounds/olive-marble/olive-marble-gold-waves-original.png | original attachment, byte-identical | approved |
| brand/waves/* | branding kit sheets | approved |
| brand/logos/bss-wordmark-3line.png | site wordmark (logo is typeset in Cormorant Garamond) | approved |
| brand/icons/icon-kit-original.png + line-*.png | official icon kit; line-* are alpha masks cut from it | approved |
| technologies/exilis-ultra/exilis-ultra-session.webp | real session photo (site) | approved |
| technologies/endospheres/endospheres-roller-emmy.jpeg | real photo (site) | approved |
| technologies/ems/emszero-applicator-emmy.jpeg | real photo (site) | approved |
| founder/portrait/* | original founder photos | approved |
| founder/welcome-video/ | — | **pending: original hands video** |
| campaigns/333-holiday-ritual/gift-box-satin-ribbon.png | approved campaign image | approved |
| blueprint/body-diagram/body-diagram-official.jpg | official diagram | approved |
| results | `/images/transformations/case1-5` (already published) | approved |
