"""Editorial Body Blueprint block for the right side of the Home panorama (site fonts: Cormorant Garamond + Jost)."""
import skia, numpy as np, cv2, json, os
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'fonts') + '/'
def tf(name, wght=None):
    t = skia.Typeface.MakeFromFile(F + name)
    if wght is not None:
        try:
            args = skia.FontArguments(); pos = skia.FontArguments.VariationPosition
            coords = [skia.FontArguments.VariationPosition.Coordinate(skia.FourByteTag('wght'), wght)]
            args.setVariationDesignPosition(skia.FontArguments.VariationPosition(coords))
            t = t.makeClone(args)
        except Exception as e: print('var font', e)
    return t
SERIF = tf('CormorantGaramond.ttf', 500); ITAL = tf('CormorantGaramond-Italic.ttf', 500)
SANS = tf('Jost.ttf', 400); SANS_M = tf('Jost.ttf', 500)

def col(h, a=255): h = h.lstrip('#'); return skia.Color(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

def text(c, s, x, y, font, color, tracking=0.0):
    p = skia.Paint(AntiAlias=True, Color=color)
    if tracking == 0:
        c.drawString(s, x, y, font, p); return font.measureText(s)
    xx = x
    for ch in s:
        c.drawString(ch, xx, y, font, p); xx += font.measureText(ch) + tracking
    return xx - x - tracking

def render(master_path, out_path, X=3960, top=837):
    img = cv2.imread(master_path)
    H, W = img.shape[:2]
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
    surf = skia.Surface(rgba)                     # draws in place
    with surf as c:
        f_eb = skia.Font(SANS_M, 34); f_h = skia.Font(SERIF, 186); f_hi = skia.Font(ITAL, 186)
        f_p = skia.Font(SANS, 46); f_cta = skia.Font(SANS_M, 36)
        hx = X + 92
        # hairline
        lp = skia.Paint(AntiAlias=True, Color=col('#6b5240', 90), StrokeWidth=2.2)
        c.drawLine(X, top + 6, X, top + 905, lp)
        y = top + 34
        text(c, 'PERSONALIZED STRATEGY', hx, y, f_eb, col('#6b5240'), tracking=7.2)
        y += 205; text(c, 'Build Your', hx, y, f_h, col('#2b2420'))
        y += 168; w = text(c, 'Body ', hx, y, f_h, col('#2b2420'))
        text(c, 'Blueprint', hx + w, y, f_hi, col('#7b5c48'))
        y += 138
        for line in ('A customized plan based on your goals,', 'your body and our advanced technology.'):
            text(c, line, hx, y, f_p, col('#5e5047')); y += 78
        y += 112
        wcta = text(c, 'CREATE YOUR BLUEPRINT', hx, y, f_cta, col('#342923'), tracking=5.0)
        x_end = hx + max(wcta + 190, 1000)
        ap = skia.Paint(AntiAlias=True, Color=col('#342923'), StrokeWidth=2.6, Style=skia.Paint.kStroke_Style, StrokeCap=skia.Paint.kRound_Cap)
        ay = y - 13
        c.drawLine(x_end - 105, ay, x_end, ay, ap); c.drawLine(x_end - 30, ay - 20, x_end, ay, ap); c.drawLine(x_end - 30, ay + 20, x_end, ay, ap)
        up = skia.Paint(AntiAlias=True, Color=col('#67564a'), StrokeWidth=2.4)
        c.drawLine(hx, y + 38, x_end, y + 38, up)
        cta_box = (hx - 20, y - 70, x_end + 20, y + 60)
    out = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGR)
    cv2.imwrite(out_path, out)
    return dict(cta=[int(v) for v in cta_box], block=[X, top, int(x_end), top + 905])

if __name__ == '__main__':
    r = render('out/home_pano_master.png', 'out/home_pano_text.png')
    json.dump(r, open('out/home_hotspots.json', 'w')); print(r)
    im = cv2.imread('out/home_pano_text.png'); cv2.imwrite('out/home_text_prev.jpg', cv2.resize(im, (im.shape[1] * 700 // im.shape[0], 700), interpolation=cv2.INTER_AREA))
