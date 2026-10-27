"""Detect the thin wave lines that reach the left/right edge of an original artwork and measure geometry."""
import cv2, numpy as np, json, sys
from scipy.signal import find_peaks
from scipy.ndimage import median_filter

def residual(img):
    L = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg = median_filter(L, size=(25, 1))           # vertical median: removes thin near-horizontal lines
    return bg - L, L, bg

def track(r, side, y0, y1, depth=260, thr=2.0, kind='dark'):
    h, w = r.shape
    xs = list(range(0, depth)) if side == 'left' else list(range(w - 1, w - 1 - depth, -1))
    def peaks(x):
        col = r[y0:y1, x]
        p, _ = find_peaks(col, height=thr, distance=3)
        return p + y0
    lines = [[(xs[0], float(y))] for y in peaks(xs[0])]
    for x in xs[1:]:
        pk = peaks(x)
        for ln in lines:
            if ln[-1] is None: continue
            (xa, ya) = ln[-1]
            pred = ya
            if len(ln) > 8 and ln[-8] is not None:
                pred = ya + (ya - ln[-8][1]) / 7
            if len(pk) == 0: ln.append(None); continue
            j = np.argmin(np.abs(pk - pred))
            if abs(pk[j] - pred) <= 2.2:
                # sub-pixel
                yy = pk[j]; c = r[yy-1:yy+2, x]
                off = 0.5 * (c[0] - c[2]) / (c[0] - 2*c[1] + c[2] + 1e-6) if len(c) == 3 else 0
                ln.append((x, float(yy + np.clip(off, -0.5, 0.5))))
            else:
                ln.append(None)
    out = []
    for ln in lines:
        pts = [p for p in ln if p is not None]
        # keep only the contiguous run from the edge
        run = []
        for p in ln:
            if p is None: break
            run.append(p)
        if len(run) < depth * 0.6: continue
        X = np.array([abs(p[0] - xs[0]) for p in run], np.float32)   # distance inward from edge
        Y = np.array([p[1] for p in run], np.float32)
        c = np.polyfit(X, Y, 2)
        amp = float(np.median([r[int(round(p[1])), p[0]] for p in run]))
        out.append(dict(kind=kind, y_edge=float(np.polyval(c, 0)), slope_in=float(c[1]), curv=float(2 * c[0]), contrast=amp, n=len(run)))
    out.sort(key=lambda d: d['y_edge'])
    # dedupe
    ded = []
    for d in out:
        if ded and abs(d['y_edge'] - ded[-1]['y_edge']) < 2: continue
        ded.append(d)
    return ded

if __name__ == '__main__':
    f, ystart = sys.argv[1], float(sys.argv[2])
    img = cv2.imread(f); r, L, bg = residual(img); h, w = r.shape
    res = {}
    for side in ('left', 'right'):
        Ls = cv2.GaussianBlur(L, (0, 0), 3)
        gy = np.abs(np.diff(Ls, axis=0, prepend=Ls[:1]))
        gy = gy - median_filter(gy, size=(41, 1))
        feats = track(r, side, int(h * ystart), h - 5, depth=int(w * 0.1), kind='dark') + \
                track(-r, side, int(h * ystart), h - 5, depth=int(w * 0.1), thr=2.0, kind='light') + \
                track(gy * 4, side, int(h * ystart), h - 5, depth=int(w * 0.1), thr=3.0, kind='step')
        feats.sort(key=lambda d: d['y_edge'])
        ded = []
        for d in feats:
            if ded and abs(d['y_edge'] - ded[-1]['y_edge']) < 4:
                if d['kind'] == 'dark' and ded[-1]['kind'] != 'dark': ded[-1] = d
                continue
            ded.append(d)
        res[side] = ded
        print(side, len(res[side]))
        for d in res[side]: print('  %s y=%.1f slope_in=%.4f curv=%.6f c=%.1f n=%d' % (d['kind'], d['y_edge'], d['slope_in'], d['curv'], d['contrast'], d['n']))
    json.dump(res, open(f.replace('.png', '_waves.json'), 'w'), indent=1)
