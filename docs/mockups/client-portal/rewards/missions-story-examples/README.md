# Secret Missions — Story/Mission Card Background Images

Reference imagery to use as background photos for Secret Mission cards in the Rewards module (e.g. the "how it works" example thumbnails and individual mission card backgrounds seen in `../secret-missions.png` / `../v3-society/secret-missions.png` / `MASTER-DESIGN-REFERENCE.png` mission cards).

## Received
- `coffee-mission-story-example.png` — mock Instagram Story screenshot: `@bodyshapersystem_mia` account, Miami skyline/palm tree sunset photo, hand holding a coffee cup printed "focus / fuel / elevate", caption "coffee in hand, goals in mind." tagged `@bodyshapersystem_mia`, with a "COFFEE MISSION +20 Society Points" sticker overlay. This is an example of what a completed "coffee mission" story post should look like — usable as the reference photo behind the Coffee Mission card, or as onboarding/example imagery showing clients what to post.
- `curious-mission-phone-marketing.png` — marketing slide (numbered "06") showing a phone mockup of an Instagram DM/story reply flow: "I just unlocked something... can't tell you yet" with a "Curious??" quick-reply button, "@bodyshapersystem" account, "Send message" bar. Tagline: "become a client. unlock your access." This is a marketing/acquisition asset (drives non-clients to inquire), not a Rewards-module UI screen — likely for external social content rather than backing a card inside the app.

## Notes
- `coffee-mission-story-example.png` fits directly as mission card background/example imagery within the app (Secret Missions tab, "how it works" example section).
- `curious-mission-phone-marketing.png` is external marketing material (Instagram ad/story template) — confirm with Emmy whether this is meant to live in-app somewhere or is purely for her social content calendar, since it doesn't show any Rewards/Client Portal UI.
- There's already a `mission_images` Prisma migration in the codebase (`prisma/migrations/.../migration.sql`) — check that schema before wiring these up, since image storage for missions may already be modeled.
