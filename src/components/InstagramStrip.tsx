import { INSTAGRAM_URL } from "@/lib/nav";
import { getInstagramFeed } from "@/lib/instagram";

const STATIC = [
  ["/images/ig1-sculpt-systems.jpg", "Sculpt Start™ & Sculpt Signature™"],
  ["/images/ig2-office-briefcase.jpg", "Body Shaper System™ — behind the scenes"],
  ["/images/ig3-glp1-reshape.jpg", "GLP-1 Reshape™ Talks"],
  ["/images/ig4-body-blueprint.jpg", "The Body Blueprint™ — Science. Strategy. Transformation."],
  ["/images/ig5-ideal-system.jpg", "What is the ideal system for you?"],
];

/** Live @bodyshapersystem posts (cached 1 h); falls back to the fixed tiles when not connected. */
export default async function InstagramStrip() {
  const feed = await getInstagramFeed(6);
  if (feed.length < 3) {
    return (
      <div className="ig-strip reveal">
        {STATIC.map(([src, alt]) => (
          <a key={src} href={INSTAGRAM_URL} className="tile">
            <img src={src} alt={alt} />
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="ig-strip ig-live reveal">
      {feed.map((p) => (
        <a key={p.id} href={p.permalink} className="tile" target="_blank" rel="noopener noreferrer" aria-label={`instagram post: ${p.caption.split("\n")[0].slice(0, 90) || "@bodyshapersystem"}`}>
          <img src={p.image} alt={p.caption.split("\n")[0].slice(0, 120)} loading="lazy" referrerPolicy="no-referrer" />
          {p.type !== "IMAGE" ? <span className={`ig-badge ${p.type === "VIDEO" ? "reel" : "carousel"}`} aria-hidden="true" /> : null}
        </a>
      ))}
    </div>
  );
}
