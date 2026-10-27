import cv2, numpy as np, sys, json, time
from build import *
CFG = {
 'home': dict(src='home-hero.png', AR=2.2, xfrac=0.20, L=dict(boundary=2134, bundles=[dict(y=(2000, 2600), Lc=900, Lw=700)], mode='smear', band=900, fade=700),
              R=dict(boundary=2640, bundles=[dict(y=(2600, 2982), Lc=3000, Lw=1500)], band=420, fade=380)),
 'systems': dict(src='systems-hero-banner.png', AR=2.2, xfrac=None,
              L=dict(boundary=1045, boundary_pad=-2, bundles=[dict(y=(1000, 1250), Lc=700, Lw=500), dict(y=(1300, 1536), Lc=700, Lw=500)], band=520, fade=480, dark_k=1.2),
              R=dict(boundary=946, bundles=[dict(y=(900, 1250), Lc=700, Lw=500), dict(y=(1300, 1536), Lc=700, Lw=500)], mode='smear', band=500, fade=420)),
 'inhome': dict(src='inhome-hero-banner.png', AR=2.2, xfrac=None,
              L=dict(boundary=885, bundles=[dict(y=(850, 1250), Lc=700, Lw=500), dict(y=(1300, 1536), Lc=700, Lw=500)], mode='smear', band=500, fade=420),
              R=dict(boundary=994, bundles=[dict(y=(950, 1250), Lc=700, Lw=500), dict(y=(1300, 1536), Lc=700, Lw=500)], band=230, fade=210)),
}
def run(name):
    c = CFG[name]; img = cv2.imread(c['src']); H, W = img.shape[:2]
    Wc = int(round(H * c['AR'])); Wc += Wc % 2
    x0 = int(round(Wc * c['xfrac'])) if c['xfrac'] is not None else (Wc - W) // 2
    EL, ER = x0, Wc - x0 - W
    parts = {}
    for side, E in (('left', EL), ('right', ER)):
        k = dict(c['L' if side == 'left' else 'R'])
        k.setdefault('ctx', min(640, W // 2)); k.setdefault('fade_start', 0); k.setdefault('lama_scale', 1); k.setdefault('mirror', 0)
        k['waves'] = c['src'].replace('.png', '_waves.json'); k['paper_fn'] = paper_from_lower(int(H * 0.01))
        lower, bnd, Ys, bg = extend_side(img, side, E, k)
        parts[side] = photo_fill(img, side, E, bnd, lower, k, bg)
    can = assemble(img, x0, Wc, parts['left'], parts['right'])
    cv2.imwrite(f'out/{name}_pano_master.png', can)
    json.dump(dict(W=Wc, H=H, x0=x0, w=W), open(f'out/{name}_geom.json', 'w'))
    cv2.imwrite(f'out/{name}_prev.jpg', cv2.resize(can, (Wc * 700 // H, 700), interpolation=cv2.INTER_AREA))
    print(name, Wc, H, x0)
for n in sys.argv[1:]: t = time.time(); run(n); print(time.time() - t)
