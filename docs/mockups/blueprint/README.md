# Body Blueprint™ — Body Composition Slide Mockups

Reference mockups for the "01 | your body composition" section of the Body Blueprint™ report — editorial dark slide with wireframe body render, body type name, description, and primary focus bullets.

## Received (5 of likely 5 body types)
- `body-type-inverted-triangle.png` — shoulders wider than hips; focus: lower body shaping, hip enhancement, overall balance, feminine contouring
- `body-type-rectangle.png` — shoulders/waist/hips aligned; focus: create curves, waist definition, full body toning, muscle definition
- `body-type-apple.png` — fat concentrated at midsection; focus: abdomen, waist contour, visceral fat reduction, skin tightening
- `body-type-pear.png` — fat stored in hips/thighs/lower body; focus: inner/outer thighs, hips & glutes, cellulite reduction
- `body-type-hourglass.png` — balanced proportions, defined waist; focus: waist definition, lower abdomen, skin firmness, overall tightening

## Hero / marketing reference
- `hero-blueprint-experience.png` — "the blueprint experience" hero banner (rose/mocha palette, "advanced technology. personalized strategy. visible results." tagline, "YOUR JOURNEY. OUR SYSTEM." CTA pill, specialist photo reviewing a body composition assessment on tablet, feature icon row: personalized strategy / advanced technology / delivered to you / visible results)

## ✅ FINAL — build exactly as shown
- `measurements-card-FINAL.png` — the "measurements" card (cream marble background, "YOUR BASELINE STARTS HERE." eyebrow, body diagram with labeled measurement points — neck, bust, waist, abdomen, hips, right/left thigh, right/left calf, left arm — plus the "all measurements are taken by your specialist..." note box and gold wave motif in the corners). **Emmy has approved this as final — implement pixel-for-pixel as shown**, not just as a style reference.

- `measurements-body-diagram-illustration.jpeg` — **the actual illustration asset to use for the editable measurements diagram.** Standalone crop of just the body diagram (no left-column text/copy), taller/portrait framing, on the same cream marble card background with the gold wave motif in the bottom-right corner. Each labeled point (neck, bust, waist, abdomen, hips, right thigh, left thigh, right calf, left calf, left arm) is where a real, editable value should be displayed/entered — this image is the visual basis for that editable field layout, not just a static illustration. Use this specific crop/version as the source when building the interactive version (values under each label should be live-bound to the client's actual measurement data, editable by the specialist).

### Full text/layout spec (for agents that cannot render the PNG directly)

**Card container:** large rounded-corner card (~24px radius), full-bleed cream/ivory marble background with subtle natural veining (light warm grey-beige, no strong color variance), soft drop shadow, sitting on an outer light-travertino/stone page background.

**Layout:** two columns within the card — left column ~40% width (text), right column ~60% width (body diagram), vertically centered.

**Left column, top to bottom:**
1. Small gold sparkle/star icon (✦) immediately followed by a thin horizontal gold rule line, both left-aligned, sitting above the headline.
2. Headline: "measurements" — large serif (Cormorant Garamond or equivalent), lowercase, dark espresso/brown ink color, no bold.
3. Short thin horizontal divider line beneath the headline (small, left-aligned, gold/tan color).
4. Eyebrow/subhead in small tracked uppercase sans-serif (Jost or equivalent), brown-grey: "YOUR BASELINE STARTS HERE."
5. Body paragraph, regular weight sans-serif, dark grey: "Professional measurements will be recorded during your first Blueprint Session™ to create accurate progress tracking and visible results."
6. A bordered rounded note box (thin gold/tan border, transparent/cream fill) containing:
   - Small circular icon with a sparkle/star glyph inside, left-aligned within the box
   - Text beside/below the icon: "All measurements are taken by your specialist using a consistent, professional method to ensure accuracy."
7. Decorative element: thin gold wavy double-line motif (same "brand wave" used elsewhere in the design system) fanning out from the bottom-left corner of the card.

**Right column — body diagram:**
- A simple, elegant line-art illustration of a standing female figure (front-facing, hair in a bun, minimal/faceless outline style, thin gold/tan stroke) centered vertically in the column.
- Measurement points are marked with small filled dots directly on the body at anatomically correct locations, each connected by a thin dashed horizontal line running out to a text label + a short underline/tick mark beneath the label. Labels alternate sides of the body:
  - **Left side labels (pointing to the body's right side / viewer's left):** neck, bust, waist, abdomen, hips, right thigh, right calf
  - **Right side labels (pointing to the body's left side / viewer's right):** left arm, left thigh, left calf
- Label typography: lowercase sans-serif, small size, dark brown-grey, each with a short underline/dash beneath it (matching a "form field" visual style — label above a thin line, as if data will be filled in under it later).
- A second thin gold wavy double-line decorative motif appears fanning from the bottom-right corner of the card, mirroring the one on the bottom-left of the left column.

**Color palette used:** cream/ivory marble background, espresso-brown headline text, muted brown-grey body text, gold/tan accent lines and icons — consistent with the rest of the Blueprint design language (Cormorant Garamond + Jost, ink/ivory/gold, target/wave motifs).

**Functional note:** the labeled measurement points (neck, bust, waist, abdomen, hips, right thigh, left thigh, right calf, left calf, left arm) should map to real fields on the Blueprint measurement model — this card is meant to either display recorded values under each label, or serve as an empty/baseline state before the first session's measurements are recorded (see card copy: "Professional measurements will be recorded during your first Blueprint Session™"). Confirm whether existing measurement fields in Prisma schema match this exact list of 10 points.

## Notes
These correspond to the `BodyType` enum / `BodyTypeSheet` owner control referenced in the Blueprint module. Visual reference only — copy and body-type logic should stay driven by real Prisma data, not hardcoded per type.
