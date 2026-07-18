# Client Portal — Rewards™ ("The Body Shaper Society™") Mockups

Reference mockups for the Rewards tab, branded "Rewards — The Body Shaper System Society™".

## 🟢 MASTER DESIGN REFERENCE — `MASTER-DESIGN-REFERENCE.png`

**This is the single source of truth for the visual design of the entire Rewards module**, per Emmy (confirmed as of this update). It supersedes every other mockup in this folder and its subfolders (`v3-society/`, `v4-editorial-hero/`, and the earlier explorations below) — those remain only as historical/exploratory context, not as build references.

Use `MASTER-DESIGN-REFERENCE.png` to define the shared visual language across all four Rewards tabs:
- Rewards Overview
- Unlock Experiences
- Secret Missions
- Privileges

Match consistently across every tab:
- premium editorial aesthetic
- materials (brushed black metal card, brass key, marble surfaces, silk/satin fabric, olive branch)
- spacing
- typography (serif headline + sans label/eyebrow, gold accent italics)
- card hierarchy (dark hero card → stat cards → progress card → detail cards)
- photography style (warm, moody, editorial still-life)
- textures
- shadows
- luxury feeling

**Do not recreate the visual design differently per page.** Every Rewards screen should feel like it belongs to the same collection — the goal is an exclusive private members' club feeling, not a standard dashboard. This governs visual design only — it does not imply any change to existing functionality or layout structure already built (see `src/app/(portal)/portal/(protected)/rewards/` in the main repo, which already has `overview/` and `privileges/` pages in progress).

Confirmed nav/tab set from this reference: **Overview / Unlock Experiences / Secret Missions / Privileges** (bottom nav on mobile). Terminology: **"PTS"** (points), tiers include at least "standard member".

---

## Historical / exploratory mockups (context only, not build references)

### `v4-editorial-hero/`
Hero imagery exploration using the same black-metal-card + brass-key visual language as the master reference above — likely an earlier pass at the same direction. Worth a quick diff against the master reference for reusable photography assets, but treat the master reference as final for layout/hierarchy.

### `v3-society/`
Earlier 4-tab "premium members club" concept + written spec (burgundy leather card design, different photography direction). Superseded by the master reference for visual design, though `v3-society/SPEC.md` may still hold useful *content/functional* notes (tab purposes, what each tab should contain) — just not the visual direction.

### v1/v2 (loose files in this folder: `overview.png`, `overview-v2-full.png`, `secret-missions.png`, `unlock-experiences.png`)
Earliest concepts using "Body Credits™ (BC)" terminology and a Bronze/Silver/Gold/Platinum/Society Elite tier ladder. Superseded — kept for historical reference only.

## Notes
Visual reference only. For any new Rewards screen work, start from `MASTER-DESIGN-REFERENCE.png` and the real component code in `src/app/(portal)/portal/(protected)/rewards/`, not from the superseded folders above.
