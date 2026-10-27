/**
 * Desktop-only panoramic hero (≥901px). The panorama is ONE finished image asset per page:
 * the original artwork is embedded pixel-for-pixel and extended sideways (see scripts/heroes/README.md).
 * The frame always shows the full height of the artwork; on narrower screens only the outer
 * extensions are trimmed, never the original photograph. Hotspots are expressed in % of the artwork,
 * so they stay aligned at every viewport size.
 */
type Hotspot = {
  href: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  external?: boolean;
};

type Props = {
  name: "home" | "systems" | "inhome";
  width: number;
  height: number;
  alt: string;
  hotspots?: Hotspot[];
};

const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const SIZES: Record<Props["name"], number[]> = {
  home: [1640, 3280, 6560],
  systems: [844, 1690, 3380],
  inhome: [844, 1690, 3380],
};

export default function DesktopPanoramaHero({ name, width, height, alt, hotspots = [] }: Props) {
  const ratio = width / height;
  const srcSet = SIZES[name].map((w) => `/images/heroes/${name}-desktop-${w}w.webp ${w}w`).join(", ");
  const largest = SIZES[name][SIZES[name].length - 1];
  return (
    <div className="hero-composed-desktop pano-hero">
      <div className="pano-hero-frame" style={{ aspectRatio: `${width} / ${height}` }}>
        <picture>
          {/* phones keep their own hero: give them a 1px placeholder so the panorama is never downloaded */}
          <source media="(max-width: 900px)" srcSet={BLANK} />
          <img
          src={`/images/heroes/${name}-desktop-${largest}w.webp`}
          srcSet={srcSet}
          sizes={`max(100vw, calc((100vh - 76px) * ${ratio.toFixed(4)}))`}
          width={width}
          height={height}
          alt={alt}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          />
        </picture>
        {hotspots.map((h) => (
          <a
            key={h.label}
            className="pano-hero-hotspot"
            href={h.href}
            aria-label={h.label}
            style={{ left: `${h.left}%`, top: `${h.top}%`, width: `${h.width}%`, height: `${h.height}%` }}
            {...(h.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          />
        ))}
      </div>
    </div>
  );
}
