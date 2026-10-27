"""Panoramic desktop heroes for Body Shaper System.

The original artwork is pasted pixel-for-pixel (never resampled). Side extensions are reconstructed from it:
  * lower 'paper' zone: the outermost pixel column (lines removed) is carried outward with a vertical
    displacement field so every band / edge follows its own curve; each thin wave line is re-drawn from its
    own measured cross-section (colour, contrast, thickness) along its extrapolated path
    (same y, slope and curvature at the seam, then a smooth crest and gentle settle);
  * upper 'photo' zone: LaMa continuation right at the seam (plus mirrored fine detail for the first pixels),
    dissolving into the paper tone sampled from the artwork itself.
"""
import cv2, numpy as np, json, os, sys
from scipy.ndimage import gaussian_filter1d

ROOT = os.path.dirname(os.path.abspath(__file__))
_lama = None

def lama(img_rgb, mask):
    global _lama
    if _lama is None:
        os.environ.setdefault('LAMA_MODEL', os.path.expanduser('~/.cache/big-lama.pt'))
        from simple_lama_inpainting import SimpleLama
        _lama = SimpleLama()
    from PIL import Image
    out = _lama(Image.fromarray(img_rgb), Image.fromarray(mask))
    return np.array(out)[:img_rgb.shape[0], :img_rgb.shape[1]]

def smoothstep(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

# ------------------------------------------------------------------ curve extrapolation
def slope_fn(s0, c0, Lc, Lw):
    """slope(v) outward: slope s0 & curvature c0 at the seam, reaches 0 at Lc (crest), then settles."""
    a = c0 * Lc + 2 * s0
    def s(v):
        v = np.asarray(v, np.float64); t = np.clip(v / Lc, 0, 1)
        inner = s0 * (1 - t) ** 2 + a * t * (1 - t)
        w = np.maximum(v - Lc, 0)
        outer = -(a / Lc) * w * np.exp(-w / Lw)
        return np.where(v <= Lc, inner, outer)
    return s

def curve(y0, s0, c0, Lc, Lw, E):
    v = np.arange(E + 1, dtype=np.float64)
    sl = slope_fn(s0, c0, Lc, Lw)(v)
    Y = y0 + np.concatenate([[0], np.cumsum((sl[1:] + sl[:-1]) / 2)])
    return Y, sl

# ------------------------------------------------------------------ one side
def extend_side(img, side, E, cfg):
    """img: original BGR uint8. Returns extension (H x E x 3 float32) ordered outward->? (left side: x=0 is far edge)."""
    H, W = img.shape[:2]
    f = img.astype(np.float32)
    feats = [d for d in json.load(open(cfg['waves']))[side] if d['y_edge'] >= cfg['boundary'] - 0.5]
    for d in feats:   # outward slope / curvature
        d['s0'] = -d['slope_in']; d['c0'] = d['curv']
    lines = [d for d in feats if d['kind'] == 'dark']
    for d in feats:   # edges / highlights travel with the nearest thin line (keeps the bundle coherent)
        if d['kind'] != 'dark' and lines and not cfg.get('free_edges'):
            n = min(lines, key=lambda l: abs(l['y_edge'] - d['y_edge']))
            if abs(n['y_edge'] - d['y_edge']) < cfg.get('edge_link', 80):
                d['s0'], d['c0'] = n['s0'], n['c0']
    curves = []
    for d in feats:
        b = next(b for b in cfg['bundles'] if b['y'][0] <= d['y_edge'] <= b['y'][1])
        s0 = d['s0'] * b.get('gain', 1.0)
        # curvature: keep the measured value when it relaxes the slope toward a crest, bounded so the
        # path is monotonic up to the crest (no extra wiggles); a steepening curvature is clipped.
        lo, hi = sorted([0.0, -2 * s0 / b['Lc']])
        c0 = float(np.clip(d['c0'], lo, hi))
        Y, sl = curve(d['y_edge'], s0, c0, b['Lc'], b['Lw'], E)
        curves.append((d, Y, sl))
    # enforce ordering (no crossings): cumulative max with a minimum gap of 35% of the seam gap
    Ys = np.array([c[1] for c in curves])
    for i in range(1, len(Ys)):
        gap0 = Ys[i, 0] - Ys[i - 1, 0]
        Ys[i] = np.maximum(Ys[i], Ys[i - 1] + 0.35 * gap0)
    # ---- edge column (mean of outer 3 px), lines removed
    cols = f[:, :3] if side == 'left' else f[:, W - 3:]
    edge = cols.mean(1)                      # H x 3
    clean = edge.copy()
    profiles = []
    rows = np.arange(H)
    for (d, Y, sl) in curves:
        if d['kind'] not in ('dark', 'light'): continue
        y0 = d['y_edge']; lo, hi = int(np.floor(y0 - 5)), int(np.ceil(y0 + 5))
        a, b = lo - 2, hi + 2
        ref = np.stack([np.interp(rows[lo:hi + 1], [a, b], [edge[a, k], edge[b, k]]) for k in range(3)], 1)
        clean[lo:hi + 1] = ref
    for (d, Y, sl) in curves:
        if d['kind'] not in ('dark', 'light'): continue
        y0 = d['y_edge']; lo, hi = int(np.floor(y0 - 5)), int(np.ceil(y0 + 5))
        dy = rows[lo:hi + 1] - y0
        prof = clean[lo:hi + 1] - edge[lo:hi + 1]       # positive = darker
        profiles.append((dy, prof, np.cos(np.arctan(d['s0']))))
    clean = gaussian_filter1d(clean, 0.8, axis=0)
    # ---- displacement warp of the clean column
    y_src = np.array([c[0]['y_edge'] for c in curves])
    ext = np.zeros((H, E, 3), np.float32)
    for v in range(E):
        Yv = Ys[:, v + 1]
        src = np.interp(rows, Yv, y_src, left=np.nan, right=np.nan)
        top = np.isnan(src) & (rows < Yv[0]); bot = np.isnan(src) & (rows > Yv[-1])
        src[top] = rows[top] - (Yv[0] - y_src[0]); src[bot] = rows[bot] - (Yv[-1] - y_src[-1])
        src = np.clip(src, 0, H - 1)
        for k in range(3):
            ext[:, v, k] = np.interp(src, rows, clean[:, k])
    bgonly = ext.copy()
    # ---- redraw lines along their paths
    li = 0
    for ci, (d, Y, sl) in enumerate(curves):
        if d['kind'] not in ('dark', 'light'): continue
        dy, prof, cos0 = profiles[li]; li += 1
        for v in range(E):
            yc = Ys[ci, v + 1]; cosv = np.cos(np.arctan(sl[v + 1]))
            r0, r1 = int(yc - 8), int(yc + 9)
            rr = np.arange(max(r0, 0), min(r1, H))
            t = (rr - yc) * cosv / cos0
            for k in range(3):
                ext[rr, v, k] -= np.interp(t, dy, prof[:, k], left=0, right=0)
    boundary = Ys[0, 1:] - cfg.get('boundary_pad', 3)       # photo lives above this curve
    if side == 'left':                                       # canvas order: far edge first
        ext, boundary, Ys, bgonly = ext[:, ::-1].copy(), boundary[::-1].copy(), Ys[:, ::-1].copy(), bgonly[:, ::-1].copy()
    return ext, boundary, Ys, bgonly

def photo_fill(img, side, E, boundary, lower, cfg, bgonly=None):
    """LaMa continuation of the photo zone above `boundary`, dissolving into the paper tone."""
    H, W = img.shape[:2]
    sc = cfg.get('lama_scale', 0.5)
    K = min(W // 2, int(cfg.get('ctx', 700)))          # context columns from the original
    B = min(E, int(cfg.get('band', 700)))              # band generated by LaMa
    ctx = img[:, :K] if side == 'left' else img[:, W - K:]
    low = lower[:, E - B:] if side == 'left' else lower[:, :B]
    canvas = np.concatenate([np.clip(low, 0, 255).astype(np.uint8), ctx], 1) if side == 'left' else \
             np.concatenate([ctx, np.clip(low, 0, 255).astype(np.uint8)], 1)
    rows = np.arange(H)[:, None]
    bnd = boundary[E - B:] if side == 'left' else boundary[:B]
    upper = (rows < bnd[None, :]).astype(np.uint8)
    mask = np.zeros(canvas.shape[:2], np.uint8)
    if side == 'left': mask[:, :B] = upper * 255
    else: mask[:, K:] = upper * 255
    if cfg.get('mode') == 'smear':
        # smooth surfaces (plain wall): continue each row's own tone; no synthetic texture
        o = img.astype(np.float32)
        edgecols = o[:, :10] if side == 'left' else o[:, W - 10:]
        rowc = gaussian_filter1d(np.median(edgecols, 1), 1.0, axis=0)
        band_near = np.repeat(rowc[:, None, :], B, 1)
        dist = np.arange(B, dtype=np.float32)
        for j in range(0, B, 8):     # progressive vertical softening
            sgm = 3 + 30 * (j / B) ** 1.2
            band_near[:, j:j + 8] = gaussian_filter1d(rowc, sgm, axis=0)[:, None, :]
        big = None
    elif cfg.get('mode') == 'mirror':
        # mirrored continuation of the original edge, progressively defocused with distance
        o = img.astype(np.float32)
        strip = o[:, :B][:, ::-1] if side == 'left' else o[:, W - B:][:, ::-1]       # strip[:, j]: j px from seam... (left: reversed below)
        if side == 'left':
            strip = o[:, :B][:, ::-1]             # column j (0 = far) ... we build near->far then flip
            near = o[:, :B]                        # near[:, j] = original column j  -> mirrored ext col at distance j
        else:
            near = o[:, W - B:][:, ::-1]           # near[:, j] = original column W-1-j
        sig = [0, 1.5, 3, 6, 10, 16, 24]
        stack = [near if s_ == 0 else cv2.GaussianBlur(near, (0, 0), s_) for s_ in sig]
        dist = np.arange(B, dtype=np.float32)
        target = cfg.get('defocus', 18) * (dist / B) ** 1.2
        out = np.zeros_like(near)
        for j in range(B):
            k = np.searchsorted(sig, target[j]); k = min(max(k, 1), len(sig) - 1)
            w_ = (target[j] - sig[k - 1]) / (sig[k] - sig[k - 1]); w_ = float(np.clip(w_, 0, 1))
            out[:, j] = stack[k - 1][:, j] * (1 - w_) + stack[k][:, j] * w_
        band_near = out                            # distance-ordered
        big = None
    elif sc >= 1:   # full resolution, tiled vertically
        big = canvas.astype(np.float32).copy(); acc = np.zeros(canvas.shape[:2], np.float32); res = np.zeros_like(big)
        T, O = int(cfg.get('tile', 1024)), 224
        ys = list(range(0, max(1, H - T) + 1, T - O))
        if ys[-1] + T < H: ys.append(H - T)
        top_needed = int(np.max(bnd)) + 8
        for y0 in ys:
            if y0 >= top_needed: continue
            y1 = min(H, y0 + T)
            m = mask[y0:y1]
            if m.max() == 0: continue
            mm = cv2.dilate(m, np.ones((5, 5), np.uint8))
            out = lama(cv2.cvtColor(canvas[y0:y1], cv2.COLOR_BGR2RGB), mm)
            out = cv2.cvtColor(out, cv2.COLOR_RGB2BGR).astype(np.float32)
            wy = np.ones(y1 - y0, np.float32)
            if y0 > 0: wy[:O] = np.linspace(0, 1, O)
            if y1 < H: wy[-O:] = np.minimum(wy[-O:], np.linspace(1, 0, O))
            res[y0:y1] += out * wy[:, None, None]; acc[y0:y1] += wy[:, None]
        ok = acc > 1e-3
        big[ok] = res[ok] / acc[ok][:, None]
    else:
        small = cv2.resize(canvas, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        msmall = (cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST) > 127).astype(np.uint8) * 255
        msmall = cv2.dilate(msmall, np.ones((5, 5), np.uint8))
        out = lama(cv2.cvtColor(small, cv2.COLOR_BGR2RGB), msmall)
        out = cv2.cvtColor(out, cv2.COLOR_RGB2BGR)
        big = cv2.resize(out, (canvas.shape[1], canvas.shape[0]), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    if big is None:
        band = band_near[:, ::-1].copy() if side == 'left' else band_near.copy()
    else:
        band = big[:, :B] if side == 'left' else big[:, K:]
    # mirrored fine detail for the first pixels (keeps the seam crisp)
    m = int(cfg.get('mirror', 90))
    o = img.astype(np.float32)
    hp = o - cv2.GaussianBlur(o, (0, 0), 2.0 / sc) if sc < 1 else np.zeros_like(o)
    if side == 'left':
        wv = (1 - smoothstep(np.arange(m) / m))[None, :, None]
        band[:, B - m:] += (hp[:, :m] * wv)[:, ::-1]
    else:
        wv = (1 - smoothstep(np.arange(m) / m))[None, :, None]
        band[:, :m] += hp[:, W - m:][:, ::-1] * wv
    # dissolve into paper tone
    full = np.zeros((H, E, 3), np.float32)
    if side == 'left': full[:, E - B:] = band
    else: full[:, :B] = band
    v = (E - 1 - np.arange(E)) if side == 'left' else np.arange(E)      # distance from seam
    F = float(cfg.get('fade', 600)); F0 = float(cfg.get('fade_start', 120))
    alpha = 1 - smoothstep((v - F0) / F)
    alpha = np.where(v >= B, 0, alpha)
    paper = cfg['paper_fn'](bgonly if bgonly is not None else lower, boundary)
    # dark content washes out sooner than light content (like light bleeding from a bright room):
    lum = full.mean(2); plum = paper.mean(2) + 1e-3
    dark = np.clip(1 - lum / plum, 0, 1)
    a2 = alpha[None, :] ** (1 + cfg.get('dark_k', 2.5) * dark)
    res = paper * (1 - a2[..., None]) + full * a2[..., None]
    # composite: photo zone above boundary (soft 2px), lower zone below
    t = np.clip((np.arange(H)[:, None] - boundary[None, :] + 1.5) / 3.0, 0, 1)[..., None]
    return res * (1 - t) + lower * t

def paper_from_lower(off=25):
    def fn(lower, boundary):
        H, E = lower.shape[:2]
        idx = np.clip(np.round(boundary + off).astype(int), 0, H - 1)
        c = np.stack([np.median(lower[np.clip(idx + k, 0, H - 1), np.arange(E)], 0) if False else lower[np.clip(idx + k, 0, H - 1), np.arange(E)] for k in range(0, 60, 6)]).mean(0)
        c = gaussian_filter1d(c, 120, axis=0, mode='nearest')
        return np.broadcast_to(c[None], (H, E, 3)).copy()
    return fn

def assemble(img, x0, Wc, left, right):
    H, W = img.shape[:2]
    can = np.zeros((H, Wc, 3), np.float32)
    can[:, :x0] = left; can[:, x0 + W:] = right
    can = np.clip(np.round(can), 0, 255).astype(np.uint8)
    can[:, x0:x0 + W] = img                                  # original, pixel-for-pixel
    return can
