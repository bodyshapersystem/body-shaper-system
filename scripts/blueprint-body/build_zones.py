"""
Anatomical, selectable SVG zones for the interactive Body Blueprint silhouette.
Source art: Emmy's official Session Area Map mannequin (public/images/session-area-map/{front,back}.png).
1) The body silhouette is extracted from the line art (flood fill of the background).
2) Coarse zone polygons are painted into a label map and CLIPPED to that silhouette, so every
   zone follows the real anatomical contour of the illustration (no rectangles, no overlap).
3) Each label is vectorised (cv2.findContours) into an SVG path in the image's own coordinates.
Output: src/lib/blueprint-body-zones.ts
"""
import cv2, json, numpy as np

W, H = 420, 780

def silhouette(path, cx):
    g = cv2.cvtColor(cv2.imread(path), cv2.COLOR_BGR2GRAY)
    lines = cv2.dilate((g < 200).astype(np.uint8) * 255, np.ones((3, 3), np.uint8), 1)
    ff = lines.copy(); mask = np.zeros((H + 2, W + 2), np.uint8)
    seeds = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (5, 400), (W - 5, 400)]
    for s in seeds:
        if ff[s[1], s[0]] == 0:
            cv2.floodFill(ff, mask, s, 128)
    body = (ff != 128).astype(np.uint8)
    # the gap between the legs is open at the bottom edge of the art; fill it on a thicker copy of
    # the line art so it cannot leak through the tiny opening at the crotch into the torso
    thick = cv2.dilate((g < 200).astype(np.uint8) * 255, np.ones((7, 7), np.uint8), 1)
    gap = thick.copy(); gm = np.zeros((H + 2, W + 2), np.uint8)
    cv2.floodFill(gap, gm, (cx, H - 1), 128)
    body[gap == 128] = 0
    return cv2.morphologyEx(body, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

def mirror(poly, cx):
    return [(2 * cx - x, y) for x, y in poly]

def front_zones(cx=168):
    armL = [(0, 150), (112, 150), (106, 268), (96, 520), (0, 560)]
    return [  # painted in order: later entries win
        ("Face", [(100, 0), (240, 0), (240, 106), (100, 106)]),
        ("Chin / Jawline", [(100, 104), (240, 104), (240, 142), (100, 142)]),
        ("Arms", armL), ("Arms", mirror(armL, cx)),
        ("Abdomen", [(112, 276), (224, 276), (224, 402), (112, 402)]),
        ("Waist", [(60, 284), (122, 284), (122, 376), (60, 376)]), ("Waist", mirror([(60, 284), (122, 284), (122, 376), (60, 376)], cx)),
        ("Hips", [(40, 376), (124, 386), (124, 452), (40, 452)]), ("Hips", mirror([(40, 376), (124, 386), (124, 452), (40, 452)], cx)),
        ("Outer Thighs", [(40, 452), (128, 452), (128, 610), (40, 610)]), ("Outer Thighs", mirror([(40, 452), (128, 452), (128, 610), (40, 610)], cx)),
        ("Inner Thighs", [(128, 440), (cx, 440), (cx, 610), (128, 610)]), ("Inner Thighs", mirror([(128, 440), (cx, 440), (cx, 610), (128, 610)], cx)),
        ("Knees", [(40, 610), (2 * cx - 40, 610), (2 * cx - 40, 668), (40, 668)]),
    ]

def back_zones(cx=200):
    armL = [(0, 150), (142, 150), (136, 268), (126, 520), (0, 560)]
    return [
        ("Arms", armL), ("Arms", mirror(armL, cx)),
        ("Back", [(140, 160), (260, 160), (260, 364), (140, 364)]),
        ("Flanks", [(90, 296), (150, 296), (150, 384), (90, 384)]), ("Flanks", mirror([(90, 296), (150, 296), (150, 384), (90, 384)], cx)),
        ("Glutes", [(142, 364), (258, 364), (258, 480), (142, 480)]),
        ("Hips", [(70, 384), (142, 384), (142, 470), (70, 470)]), ("Hips", mirror([(70, 384), (142, 384), (142, 470), (70, 470)], cx)),
        ("Outer Thighs", [(70, 470), (160, 480), (160, 610), (70, 610)]), ("Outer Thighs", mirror([(70, 470), (160, 480), (160, 610), (70, 610)], cx)),
        ("Inner Thighs", [(160, 480), (cx, 480), (cx, 610), (160, 610)]), ("Inner Thighs", mirror([(160, 480), (cx, 480), (cx, 610), (160, 610)], cx)),
        ("Knees", [(70, 610), (2 * cx - 70, 610), (2 * cx - 70, 668), (70, 668)]),
    ]

def build(side, zones, cx):
    body = silhouette(f"public/images/session-area-map/{side}.png", cx)
    names = sorted({n for n, _ in zones})
    label = np.zeros((H, W), np.int32)
    for n, poly in zones:
        cv2.fillPoly(label, [np.array(poly, np.int32)], names.index(n) + 1)
    label[body == 0] = 0
    # Forearms are separated from the torso only by the background gap below the armpit:
    # take the connected pieces of the silhouette below armpit level that lie at the far left /
    # right and assign them to "Arms" last, so torso zones can never spill onto the arms.
    lower = body.copy(); lower[:268] = 0
    n, cc = cv2.connectedComponents(lower, connectivity=4)
    arm_id = names.index("Arms") + 1
    for probe_x in (cx - 120, cx + 120):
        lab = cc[420, probe_x] if 0 <= probe_x < W else 0
        if lab:
            label[cc == lab] = arm_id
    out = []
    for i, n in enumerate(names):
        m = (label == i + 1).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        d = ""
        for c in cs:
            if cv2.contourArea(c) < 40:
                continue
            c = cv2.approxPolyDP(c, 1.2, True)
            d += "M" + "L".join(f"{p[0][0]},{p[0][1]}" for p in c) + "Z"
        out.append({"area": n, "d": d})
    cs, _ = cv2.findContours(body, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    big = max(cs, key=cv2.contourArea)
    outline = "M" + "L".join(f"{p[0][0]},{p[0][1]}" for p in cv2.approxPolyDP(big, 1.0, True)) + "Z"
    return {"zones": out, "outline": outline}

data = {"width": W, "height": H, "front": build("front", front_zones(), 168), "back": build("back", back_zones(), 200)}
ts = ("/* AUTO-GENERATED by scripts/blueprint-body/build_zones.py from the official Session Area Map\n"
      " * mannequin. Zones are clipped to the real silhouette of the illustration. Do not edit by hand. */\n"
      "export type BodyZone = { area: string; d: string };\n"
      f"export const BODY_ZONES = {json.dumps(data, separators=(',', ':'))} as {{ width: number; height: number; front: {{ zones: BodyZone[]; outline: string }}; back: {{ zones: BodyZone[]; outline: string }} }};\n")
open("src/lib/blueprint-body-zones.ts", "w").write(ts)
print(len(ts), [z["area"] for z in data["front"]["zones"]], [z["area"] for z in data["back"]["zones"]])
