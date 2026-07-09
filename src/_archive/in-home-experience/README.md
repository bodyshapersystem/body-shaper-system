# Archived: In-Home Experience page v1 (static map)

`page.v1.tsx` used a static embedded image (`/images/service-area-map.png`)
for the Service Area section.

Replaced with an interactive custom SVG map (`src/components/ServiceAreaMap.tsx`)
with pan/zoom, clickable county regions (Miami-Dade, Broward, Palm Beach),
and a travel fee / availability / hours popup per region, per the site
owner's request for a more premium, app-like map experience without
requiring a paid Google Maps/Mapbox API key.

The old static image is still at public/images/service-area-map.png if
ever needed again.
