# Desktop panoramic heroes

`public/images/heroes/*-desktop-*w.webp` are finished single-image heroes for desktop (≥901px).
Each one embeds the original artwork **pixel-for-pixel** (`home-hero.webp`, `systems-hero-banner.webp`,
`inhome-hero-banner.webp` are never resampled, retouched or cropped) and adds reconstructed side extensions.

Pipeline (Python 3, OpenCV, SciPy, skia-python; LaMa only for photographic edges):

1. `waves.py <original.png> <y-start>` — detects every thin wave line, highlight and tonal edge that reaches
   the left/right edge of the artwork and measures its position, slope and curvature at the edge.
2. `make.py home systems inhome` — builds each panorama:
   - lower paper zone: the outermost pixel column (lines removed) is carried outward along each feature's curve;
     every line is redrawn from its own measured cross-section (colour, contrast, thickness) on a path that keeps the
     seam's y / slope / curvature, crests smoothly and settles — no generic SVG waves;
   - upper zone: plain walls continue row-by-row (`mode='smear'`); photographic edges (window, palms, chair, bed)
     continue with LaMa right at the seam and dissolve into the paper tone sampled from the artwork.
3. `text_home.py` — sets the Body Blueprint block (Cormorant Garamond + Jost) on the Home panorama.
4. Export WebP q94 at 1×, ½, ¼ width. Lossless masters are kept outside the repo.

Hotspot positions (% of the artwork) live in the page components that render `DesktopPanoramaHero`.
Mobile heroes are not affected: phones receive a 1px placeholder instead of the panorama.
