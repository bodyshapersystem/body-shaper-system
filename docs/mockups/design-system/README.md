# Design System — Brand Colors & Background Textures

Reference sheets for the color palette and material/texture library to use across the whole BSS Hub (Dashboard, Blueprint, Rewards, and beyond) — NOT page-specific mockups. Use these as the source for card backgrounds, section backgrounds, and accent surfaces site-wide.

## `brand-elements-colors.png`
**Solid brand colors** ("colores sólidos de la marca"):
| Name | Hex |
|---|---|
| Cream | `#F4F1ED` |
| Sand | `#E6DED4` |
| Taupe | `#C9B8A8` |
| Mocha | `#A18A78` |
| Espresso | `#6E5B4D` |
| Sage | `#7C8A73` |
| Rose | `#D7B2B0` |
| Graphite | `#2B2B2B` |
| Gold | `#C8A15A` |

Note: these are card/background-fill swatches only — used for card and section backgrounds, not a replacement of the site's core brand palette (Ivory #F7F4EF, Mocha #8B7362, Olive #6D7A64, Gold #D4AF37, etc.). Both palettes coexist: the original brand palette for site-wide brand elements, this sheet for card/surface backgrounds specifically.

Also includes **"fondos piedra con waves"** — 9 stone/marble background swatches (cream, sand, taupe, espresso, marble-cream, sage, rose-marble, black-marble, sand) each with the signature thin gold/white wave line-art overlay.

## `background-textures.png`
Broader **material texture library** ("Piedra. Vidrio. Metal. Estética premium."):
- Stone/glass: piedra marfil, travertino gris, piedra gris, vidrio acanalado, vidrio humo
- Metal: plata cepillado, grafito, dorado cepillado, rose cepillado, oro texturizado, piedra verde oliva
- Fabric/marble: lino arena, mármol taupe, mármol burgundy, mármol verde bosque, piedra negra, cuarzo rosa

## `rewards-card-backgrounds.png`
A **curated subset specifically for Rewards card surfaces**: piedra clara, travertino, piedra taupe, vidrio estriado, vidrio bronce, metal dorado cepillado, metal champagne, metal bronce oscuro, oro texturizado, piedra mate. This is the material set that should back the different card types in the Rewards module (points card, stat cards, progress card, etc.) per the `MASTER-DESIGN-REFERENCE.png` card hierarchy.

## `textures-burgundy-olive-tint.png` / `textures-gold-cream-tint.png`
Two more 15-tile texture sheets in the same stone/glass/metal/textured-paint pattern as `background-textures.png` and `rewards-card-backgrounds.png`, but recolored:
- **burgundy-olive-tint**: same marble/glass/brushed-metal/textured-paint tiles rendered in burgundy and olive-green tones (for accent/seasonal card variants)
- **gold-cream-tint**: same tile set rendered in warm gold/cream/bronze tones (stone, ribbed glass, smoke-glass-with-leaf-shadow, brushed gold, brushed silver, brushed bronze, gold leaf, light stone)

These are color variants of the same underlying texture pattern — use them for card backgrounds that need a burgundy/olive or gold/cream accent instead of the neutral/rewards defaults above.

## `brand-colors-swatches-clean.png`
Same 9 solid brand colors + 9 stone-with-waves backgrounds as `brand-elements-colors.png`, without the header/label text — a clean crop, useful for pulling swatches directly without cropping out text.


## Notes
These are texture/color references only, meant to be sourced as background-fill assets or CSS/gradient references — not layout mockups. Cross-check against `../client-portal/rewards/MASTER-DESIGN-REFERENCE.png` when applying the rewards-specific subset.
