# Body Shaper System™ — Next.js Website

Production-ready Next.js 15 (App Router) + TypeScript + Tailwind CSS assembly of the full Body Shaper System™ site: the public marketing site (9 pages) and the private Client Access member area (login, onboarding, dashboard, settings).

## Stack

- **Next.js 15** (App Router, static rendering where possible)
- **React 19**
- **TypeScript**
- **Tailwind CSS** (design tokens + custom component CSS ported 1:1 from the original design system — colors, type, spacing, buttons, cards, etc.)
- Metadata API for per-page SEO, `sitemap.ts`, `robots.ts`

## Project structure

```
src/
  app/
    layout.tsx              Root layout, global metadata, imports globals.css
    globals.css              Design tokens + all component styles
    sitemap.ts / robots.ts   SEO
    (site)/                  Public marketing site — has Header/Footer/WhatsApp float
      layout.tsx
      page.tsx                     Home
      body-blueprint/page.tsx
      systems/page.tsx
      in-home-experience/page.tsx
      transformations/
        page.tsx                   (server, metadata)
        TransformationsClient.tsx  (client, filter pills)
      about/page.tsx
      tech-talks/
        page.tsx                   (server, metadata)
        TechTalksClient.tsx        (client: tabs, sub-tabs, search, filters, 14 articles)
      reviews/page.tsx
      faq/
        page.tsx
        FaqClient.tsx              (client: search + accordion)
    (client)/                 Private Client Access area — NO public nav/footer, noindex
      layout.tsx
      client-access/page.tsx        Login
      client-welcome/page.tsx       5-step onboarding wizard
      client-dashboard/page.tsx     Member dashboard (8 cards + "coming soon" placeholders)
      client-settings/page.tsx      Profile & communication preferences
  components/
    Header.tsx, Footer.tsx, WhatsAppFloat.tsx, RevealObserver.tsx, DashboardSidebar.tsx
  lib/
    nav.ts                    Nav items + shared constants (WhatsApp, Instagram, Jotform URL)
public/
  images/                     All real photography used across the site
```

Route groups `(site)` and `(client)` don't add path segments — `/`, `/systems`, `/client-dashboard`, etc. are the real URLs.

## Notes on what's real vs. placeholder

- Real photography is wired in for all pages that had it (Blueprint, Systems, About, In-Home Experience, Tech Talks technology photos).
- Anything still marked `(Insert Photo)` / `(Insert Video)` in the original build is preserved as-is — these are intentional placeholders, not bugs.
- "Build My Blueprint™" primary CTAs link to the real Jotform lead form: `https://form.jotform.com/beautyboxmia/lets-build-your-blueprint`. WhatsApp CTAs link to `https://wa.me/17379755112`. Update both in `src/lib/nav.ts` if these ever change.
- The Client Access area (`/client-access`, `/client-welcome`, `/client-dashboard`, `/client-settings`) is functional as a front-end demo (client-side state + `localStorage` for the Blueprint Rewards™ unlock), but has **no real backend/auth** — "Sign In" simply routes to the welcome flow. Wire up real auth + data before sharing this area with clients. It's already excluded from the sitemap and set to `noindex` via `robots.ts` / route metadata.

## Run locally

Requires Node.js 18.18+ (Node 20/22 recommended).

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # lint
```

## Deploy to Vercel

**Option A — via GitHub (recommended)**

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Body Shaper System — Next.js site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Vercel auto-detects Next.js — no config needed. Click **Deploy**.
4. Once deployed, add your custom domain (e.g. `bodyshapersystem.com`) under Project → Settings → Domains, and point your DNS (e.g. from Namecheap) to Vercel as instructed there.

**Option B — via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel        # deploy a preview
vercel --prod # deploy to production
```

No environment variables are required for the current build.

## Updating content

- Site-wide nav links and constants: `src/lib/nav.ts`
- Design tokens (colors, fonts) and every component style: `src/app/globals.css` (search by class name, e.g. `.dash-card`, `.tech-deep`, `.filter-pill`)
- Tailwind is configured (`tailwind.config.ts`) and available for any new component you build — the existing pages primarily use the ported custom CSS classes to stay pixel-faithful to the original design.
