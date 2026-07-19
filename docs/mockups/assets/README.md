# Brand Assets

## `logo-wordmark-favicon-source.png` / `favicon-google-web-source.png`
(Same source image, saved under two names for clarity.)

Source artwork for the "body shaper system™" wordmark, confirmed by Emmy to be used **as the favicon for the website (shown in browser tabs and in Google search results)** — dark espresso serif wordmark ("body / shaper / system™") on cream background, with the brand's circular/compass line-art overlay (dashed circle, crosshair, sparkle accent) and the gold wave motif in the top-right/bottom-right corners. Tagline beneath: "ADVANCED BODY TECHNOLOGY. PERSONALIZED FOR YOUR BODY. DELIVERED TO YOU."

**Implementation note:** favicons render very small (16×16 to 32×32px in browser tabs; Google search results typically show a favicon around 16–32px too, sometimes up to 48px in some surfaces). The full wordmark + tagline will not be legible at that size. Whoever implements this should crop/derive a simplified square mark from this source — most likely just the "bss" monogram/initials or a tight crop on part of the wordmark — rather than shrinking the entire image as-is. Generate the standard favicon set from that simplified mark:
- `favicon.ico` (multi-size: 16x16, 32x32, 48x48)
- `favicon-32.png` (32×32)
- `icon-512.png` (512×512, for PWA/manifest and Google's larger icon surfaces)

## Existing production favicon files (for reference/comparison)
As of this commit, the repo already has:
- `public/favicon.ico`
- `public/favicon-32.png`
- `public/icon-512.png`

Replace these using a simplified mark derived from the source art above, not the full wordmark image directly.

## `emmy-headshot.jpeg`
Founder photo used in the welcome email template (see `../emails/README.md`).
