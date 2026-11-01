"""
Builds the Interactive Miami Map from OFFICIAL GIS boundaries (no hand-drawn shapes):
  * Miami-Dade County GIS — MunicipalityCoastal_poly (municipal limits clipped to the coastline)
  * Miami-Dade County GIS — DesignatedPlace (Census designated places, for unincorporated Kendall)
  * City of Miami GIS — Neighborhoods (official neighborhood boundaries)
Neighborhood "service zones" (brickell, downtown, wynwood · midtown …) are BSS groupings of
official City of Miami neighborhoods; municipalities keep their official limits.
Output: src/lib/miami-map-data.ts (pre-projected SVG paths — no map library at runtime).
Sources (GeoJSON, outSR=4326):
  https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/MunicipalityCoastalpoly_gdb/FeatureServer/0  -> muni.geojson
  https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/DesignatedPlace_gdb/FeatureServer/0          -> cdp.geojson
  https://services1.arcgis.com/CvuPhqcTQpZPT9qY/arcgis/rest/services/Neighborhoods/FeatureServer/0              -> miami_nbhd.geojson
  (append /query?where=1%3D1&outFields=*&outSR=4326&f=geojson)
Usage: python3 scripts/miami-map/build_map.py <dir with muni.geojson, miami_nbhd.geojson, cdp.geojson>
"""
import json, math, sys
from shapely.geometry import shape, box, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "src/lib/miami-map-data.ts"
LON0, LON1, LAT0, LAT1 = -80.47, -80.105, 25.552, 25.983
K = 1000 / ((LON1 - LON0) * math.cos(math.radians(25.7)))  # svg units per degree lon (scaled)
W = 1000
H = (LAT1 - LAT0) * K

def proj(lon, lat):
    return ((lon - LON0) * math.cos(math.radians(25.7)) * K, (LAT1 - lat) * K)

def load(name):
    return json.load(open(f"{SRC}/{name}"))["features"]

muni = load("muni.geojson"); nbhd = load("miami_nbhd.geojson"); cdp = load("cdp.geojson")
CLIP = box(LON0, LAT0, LON1, LAT1)

def geoms(features, key, names):
    names = {n.upper() for n in names}
    gs = [shape(f["geometry"]).buffer(0) for f in features if str(f["properties"].get(key, "")).strip().upper() in names]
    missing = names - {str(f["properties"].get(key, "")).strip().upper() for f in features}
    if missing:
        raise SystemExit(f"missing in {key}: {missing}")
    return unary_union(gs)

land = unary_union([shape(f["geometry"]).buffer(0) for f in muni]).intersection(CLIP)
miami_city = geoms(muni, "NAME", ["MIAMI"])

M = lambda *n: ("municipality", geoms(muni, "NAME", n))
N = lambda *n: ("neighborhood", geoms(nbhd, "LABEL", n).intersection(miami_city))
C = lambda *n: ("cdp", geoms(cdp, "NAME", n).intersection(land))

ZONES = [
    ("key-biscayne", "key biscayne", M("KEY BISCAYNE")),
    ("brickell", "brickell", N("Brickell Business District", "Brickell Residential District", "Brickell Village", "Brickell Key", "West Brickell")),
    ("downtown", "downtown", N("CBD", "Government Center", "Bicentennial Park", "Bayfront", "Omni/PAC", "Parkwest", "Riverfront", "Lummus Park", "MDCC", "Media Art Entertainment")),
    ("edgewater", "edgewater", N("Edgewater", "Old San Juan")),
    ("wynwood-midtown", "wynwood · midtown · design district", N("Wynwood Industrial District", "Midtown", "Fashion District", "Design District")),
    ("coconut-grove", "coconut grove", N("Vizcaya", "Bay Heights", "East Grove", "North Grove", "Fair Isle", "Bird Grove East", "Bird Grove West", "Grove Center", "West Grove", "South Grove Bayside", "South Grove")),
    ("coral-way-roads", "coral way · the roads", N("Roads", "Shenandoah North", "Shenandoah South", "Silver Bluff", "Coral Gate", "Douglas Park", "Parkdale South", "Miami Avenue")),
    ("little-havana", "little havana", N("East Little Havana", "Latin Quarter", "Citrus Grove", "Auburndale", "Orange Bowl", "Parkdale North", "La Pastorita")),
    ("upper-eastside", "upper eastside · morningside", N("Morningside", "Bayside", "Palm Grove", "Belle Meade", "Belle Meade West", "Shorecrest", "Palm Bay", "Legion Park", "Pelican Harbor", "Baypoint", "Magnolia Park")),
    ("little-haiti", "little haiti · little river", N("Lemon City/Little Haiti", "Little River Central", "Little River Industrial District", "Edison", "Buena Vista West", "Historic Buena Vista East", "Buena Vista Heights", "Brentwood", "Little River Gardens", "79th Street")),
    ("allapattah", "allapattah", N("Allapattah Industrial District", "Santa Clara", "Melrose", "36th Street Strip", "Civic Center", "Curtis Park")),
    ("coral-gables", "coral gables", M("CORAL GABLES")),
    ("miami-beach", "miami beach", M("MIAMI BEACH")),
    ("north-bay-village", "north bay village", M("NORTH BAY VILLAGE")),
    ("surfside-bal-harbour", "surfside · bal harbour · bay harbor", M("SURFSIDE", "BAL HARBOUR", "BAY HARBOR ISLANDS", "INDIAN CREEK VILLAGE")),
    ("sunny-isles", "sunny isles beach · golden beach", M("SUNNY ISLES BEACH", "GOLDEN BEACH")),
    ("aventura", "aventura", M("AVENTURA")),
    ("north-miami-beach", "north miami beach", M("NORTH MIAMI BEACH")),
    ("north-miami", "north miami", M("NORTH MIAMI")),
    ("miami-shores", "miami shores · biscayne park · el portal", M("MIAMI SHORES", "BISCAYNE PARK", "EL PORTAL")),
    ("miami-gardens", "miami gardens", M("MIAMI GARDENS")),
    ("opa-locka", "opa-locka", M("OPA-LOCKA")),
    ("miami-lakes", "miami lakes", M("MIAMI LAKES")),
    ("hialeah", "hialeah · hialeah gardens", M("HIALEAH", "HIALEAH GARDENS")),
    ("miami-springs", "miami springs · virginia gardens", M("MIAMI SPRINGS", "VIRGINIA GARDENS")),
    ("medley", "medley", M("MEDLEY")),
    ("doral", "doral", M("DORAL")),
    ("sweetwater", "sweetwater", M("SWEETWATER")),
    ("west-miami", "west miami", M("WEST MIAMI")),
    ("south-miami", "south miami", M("SOUTH MIAMI")),
    ("kendall", "kendall", C("Kendall", "Kendall West", "Kendale Lakes")),
    ("pinecrest", "pinecrest", M("PINECREST")),
    ("palmetto-bay", "palmetto bay", M("PALMETTO BAY")),
    ("cutler-bay", "cutler bay", M("CUTLER BAY")),
]

def path_of(g, tol):
    g = g.intersection(CLIP).simplify(tol, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else [p for p in getattr(g, "geoms", []) if isinstance(p, Polygon)]
    out = []
    for p in polys:
        if p.area < (tol * tol * 4):
            continue
        for ring in [p.exterior, *p.interiors]:
            pts = [proj(x, y) for x, y in ring.coords]
            out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts[:-1]) + "Z")
    return "".join(out)

zones = []
for zid, label, (kind, g) in ZONES:
    g = g.intersection(CLIP)
    if g.is_empty:
        raise SystemExit(f"empty zone {zid}")
    tol = 0.00006 if kind == "neighborhood" or g.area < 0.0004 else 0.00012
    minx, miny, maxx, maxy = g.bounds
    x0, y1 = proj(minx, miny); x1, y0 = proj(maxx, maxy)
    c = g.representative_point()
    cx, cy = proj(c.x, c.y)
    zones.append({
        "id": zid, "label": label, "kind": kind, "d": path_of(g, tol),
        "bbox": [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)],
        "c": [round(cx, 1), round(cy, 1)],
        "small": (x1 - x0) * (y1 - y0) < 900,
    })

selected_union = unary_union([g for _, _, (_, g) in ZONES])
other_land = land.difference(selected_union.buffer(0))
data = {
    "viewBox": [0, 0, W, round(H, 1)],
    "land": path_of(land, 0.0003),
    "other": path_of(other_land, 0.0003),
    "zones": zones,
}
src = (
    "/* AUTO-GENERATED by scripts/miami-map/build_map.py from official Miami-Dade County GIS\n"
    " * (MunicipalityCoastal_poly, DesignatedPlace) and City of Miami GIS (Neighborhoods).\n"
    " * Do not edit by hand. Neighborhood zones are BSS service zones made of official neighborhoods. */\n"
    "export type MiamiZone = { id: string; label: string; kind: \"municipality\" | \"neighborhood\" | \"cdp\"; d: string; bbox: [number, number, number, number]; c: [number, number]; small: boolean };\n"
    f"export const MIAMI_MAP = {json.dumps(data, separators=(',', ':'))} as {{ viewBox: [number, number, number, number]; land: string; other: string; zones: MiamiZone[] }};\n"
)
open(OUT, "w").write(src)
print("zones", len(zones), "bytes", len(src), "H", round(H))
for z in zones:
    print(f"{z['id']:22s} {len(z['d']):6d} small={z['small']}")
