import math, subprocess, os, sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1350,30
GOLD=(200,161,90); CREAM=(246,243,238); CHAMP=(227,207,168)
CFG=dict(pair="c5", zone="abdomen", benefits="firmeza · tono · contorno",
  system="sculpt start™", tech="exilis", sessions=6, minutes=45, freq="1×", freq_lbl="POR SEMANA",
  extras="a domicilio · sin cirugía · sin tiempo de recuperación",
  hook=["lo que 6 sesiones","le hicieron","a este abdomen"], dm="SCULPT",
  zone_pts=[(170,350),(134,338),(206,338)],               # silhouette coords (navel, flanks)
  photo_tags=[((-0.58,0.10),"contorno","L"),((0.61,0.10),"cintura","R"),((0.07,0.30),"firmeza","L")],
  out="bb-abdomen.mp4")
if os.environ.get("CFG"): CFG.update(json.load(open(os.environ["CFG"])))
THEMES={"wine":dict(bg="burgundy-marble.jpg",waves=True,gold=(200,161,90),cream=(246,243,238),champ=(227,207,168),shadow=(40,8,16),spark=(246,243,238)),
 "green":dict(bg="bgs/green-marble.png",waves=False,gold=(214,178,104),cream=(248,244,234),champ=(232,216,180),shadow=(20,32,18),spark=(250,246,236)),
 "bronze":dict(bg="bgs/bronze-silk.png",waves=False,gold=(222,184,120),cream=(248,240,226),champ=(232,210,176),shadow=(30,18,10),spark=(255,246,226),duo_dark=(40,26,14)),
 "cream":dict(bg="bgs/cream-marble.png",waves=False,gold=(150,112,52),cream=(58,40,30),champ=(96,74,54),shadow=(250,244,232),spark=(255,250,238),duo_dark=(110,80,50),duo_lite=(246,234,210)),
 "sand":dict(bg="bgs/sand-marble.png",waves=False,gold=(122,84,36),cream=(52,34,24),champ=(86,62,42),shadow=(235,222,200),spark=(255,246,226))}
TH=THEMES[CFG.get("theme","wine")]; GOLD,CREAM,CHAMP=TH["gold"],TH["cream"],TH["champ"]; SPARK=TH["spark"]
CFG.setdefault("stats",[[CFG["sessions"],"","SESIONES"],[CFG["minutes"],"","MIN · SESIÓN"],[None,CFG["freq"],CFG["freq_lbl"]]])
CFG.setdefault("caption",f"{CFG['tech']}  ·  {CFG['sessions']} sesiones  ·  {CFG['minutes']} min")
if "hookl" in CFG: pass
HOOK=5.0; SKIP=0.3
def font(p,s,v=None):
  f=ImageFont.truetype(p,s)
  if v: f.set_variation_by_name(v)
  return f
SER=lambda s,v=b"Medium": font("CormorantGaramond.ttf",s,v)
SERI=lambda s: font("CormorantGaramond-Italic.ttf",s,b"Italic")
SAN=lambda s,v=b"Light": font("Jost.ttf",s,v)
def ease(t): t=max(0,min(1,t)); return t*t*(3-2*t)
def eob(t):  # ease-out-back (pop)
  t=max(0,min(1,t)); c=1.7; return 1+(c+1)*(t-1)**3+c*(t-1)**2
def seg(t,a,b): return (t-a)/(b-a)
def win(t,a,b,c,d): return ease(seg(t,a,b))*(1-ease(seg(t,c,d)))

_b=Image.open(TH["bg"]).convert("RGB")
if _b.width/_b.height>W/H:
  _s=H/_b.height; _b=_b.resize((int(_b.width*_s)+1,H),Image.LANCZOS); _x=int((_b.width-W)*CFG.get("bgx",0.5)); bg=_b.crop((_x,0,_x+W,H))
else: bg=_b.resize((W,H))
base=bg.copy().convert("RGBA")
if TH["waves"]:
  waves=Image.open("waves.png").convert("RGBA"); waves=waves.resize((int(waves.width*H/waves.height),H))
  waves.putalpha(waves.split()[3].point(lambda v:int(v*0.7))); base.alpha_composite(waves,(W-waves.width+60,0))

s=Image.open("silo.png").convert("L"); S=3
s=s.resize((s.width*S,s.height*S),Image.LANCZOS)
alpha=s.point(lambda v:max(0,min(255,int((235-v)*2.4)))).filter(ImageFilter.GaussianBlur(0.6))
silo=Image.new("RGBA",s.size,GOLD+(0,)); silo.putalpha(alpha); SW,SH=silo.size
ZX,ZY=CFG["zone_pts"][0][0]*S,CFG["zone_pts"][0][1]*S

# real logo, recolored cream
lg=Image.open("logo.png").convert("RGBA"); LOGO=Image.new("RGBA",lg.size,CREAM+(0,)); LOGO.putalpha(lg.split()[3])
LOGO=LOGO.resize((int(lg.width*0.62),int(lg.height*0.62)),Image.LANCZOS)

R=360; PCX,PCY=W//2,600; D=2*R
RECT=CFG.get("shape","circle") in ("rect","square")
if RECT: CW_,CH_=((620,820) if CFG.get("shape")=="rect" else (CFG.get("square",720),)*2); PCY=612
else: CW_,CH_=D,D
def load(tag,pair=None):
  suf="rect" if RECT else "circle-clean"
  im=Image.open(f"graded/{pair or CFG['pair']}-{tag}-{suf}.png").convert("RGB").resize((CW_,CH_),Image.LANCZOS)
  patch=base.crop((PCX-CW_//2,PCY-CH_//2,PCX-CW_//2+CW_,PCY-CH_//2+CH_)).convert("RGB")
  F=CFG.get("fade",0.34); x=np.clip((F-np.linspace(0,1,CH_))/max(F*0.5,1e-3),0,1); g=(x*x*(3-2*x))[:,None]*np.ones((1,CW_))
  return Image.composite(patch,im,Image.fromarray((g*255).astype(np.uint8)))
cmask=Image.new("L",(CW_,CH_),0)
if RECT: ImageDraw.Draw(cmask).rounded_rectangle((0,0,CW_-1,CH_-1),radius=34,fill=255)
else: ImageDraw.Draw(cmask).ellipse((0,0,D-1,D-1),fill=255)
PLEN=5.6
PAIRS=[dict(p) for p in CFG.get("pairs",[{"pair":CFG["pair"],"tags":CFG["photo_tags"],"label":""}])]
for P in PAIRS: P["imgs"]=(load("before",P["pair"]),load("after",P["pair"]))
BODY=11.4+len(PAIRS)*PLEN+3.0; DUR=HOOK+BODY-SKIP; N=int(DUR*FPS)
PHOTO_SILO=CFG.get("silo")=="photo"
if PHOTO_SILO:
  PS_W,PS_H=CW_,CH_
  DUO=PAIRS[0]["imgs"][0].resize((PS_W,PS_H)).convert("RGBA"); DUOM=cmask.copy()   # foto real, colores naturales

class Dr:
  def __init__(s,im): s.im=im; s.m=ImageDraw.Draw(Image.new("L",(1,1)))
  def textlength(s,txt,font): return s.m.textlength(txt,font=font)
  def _go(s,fn,fill):
    a=fill[3] if len(fill)>3 else 255
    if a<=1: return
    L=Image.new("RGBA",s.im.size,(0,0,0,0)); fn(ImageDraw.Draw(L),tuple(fill[:3])+(255,))
    if a<255: L.putalpha(L.split()[3].point(lambda v:v*a//255))
    s.im.alpha_composite(L)
  def text(s,xy,txt,font,fill): s._go(lambda g,c:g.text(xy,txt,font=font,fill=c),fill)
  def line(s,pts,fill,width=1): s._go(lambda g,c:g.line(pts,fill=c,width=width),fill)
def tc(d,y,txt,f,fill,cx=W/2):
  w=d.textlength(txt,font=f); d.text((cx-w/2,y),txt,font=f,fill=fill)
def A(x,a): return int(max(0,min(1,a))*x)

K=2
def star(g,x,y,r,col,a):
  if a<=0.02: return
  c=col+(A(255,a),); w=max(1,int(r*0.18))
  g.polygon([(x,y-r),(x+w,y-w),(x+r,y),(x+w,y+w),(x,y+r),(x-w,y+w),(x-r,y),(x-w,y-w)],fill=c)
def marker(g,glow,x,y,t,t0,a=1.0,scale=1.0):
  """sparkling gold zone marker: pop-in dot, two ripples, twinkling stars"""
  p=t-t0
  if p<=0 or a<=0.01: return
  pop=eob(p/0.45)*scale
  gd=ImageDraw.Draw(glow); gr=46*scale*(0.85+0.15*math.sin(t*5))
  gd.ellipse((x-gr,y-gr,x+gr,y+gr),fill=GOLD+(A(120,a),))
  X,Y=x*K,y*K
  for k in range(2):  # ripples
    q=((p*0.8+k*0.5)%1.0); rr=(14+62*q)*scale*K
    g.ellipse((X-rr,Y-rr,X+rr,Y+rr),outline=CHAMP+(A(220*(1-q),a),),width=2*K)
  r0=11*pop*K; g.ellipse((X-r0,Y-r0,X+r0,Y+r0),fill=SPARK+(A(255,a),))
  r1=17*pop*K; g.ellipse((X-r1,Y-r1,X+r1,Y+r1),outline=GOLD+(A(255,a),),width=2*K)
  for k in range(4):
    ang=k*1.7+t0*3; dist=(34+10*math.sin(t*3+k))*scale*K
    tw=max(0,math.sin(t*4.2+k*1.9+t0))
    star(g,X+dist*math.cos(ang),Y+dist*math.sin(ang),(9+6*tw)*scale*K,CHAMP,a*tw)

def hud_rings(g,cx,cy,r,a,t,spin=1.0):
  cx,cy,r=cx*K,cy*K,r*K
  g.ellipse((cx-r,cy-r,cx+r,cy+r),outline=GOLD+(A(230,a),),width=2*K)
  r2=r+22*K; rot=t*40*spin
  for k in range(4): st=rot+k*90; g.arc((cx-r2,cy-r2,cx+r2,cy+r2),st,st+52,fill=GOLD+(A(215,a),),width=2*K)
  r3=r+44*K
  for k in range(3): st=-t*22*spin+k*120; g.arc((cx-r3,cy-r3,cx+r3,cy+r3),st,st+18,fill=CHAMP+(A(180,a),),width=K)
  for k in range(72):
    ang=math.radians(k*5+t*8); L=(10 if k%6==0 else 5)*K
    g.line((cx+(r+6*K)*math.cos(ang),cy+(r+6*K)*math.sin(ang),cx+(r+6*K+L)*math.cos(ang),cy+(r+6*K+L)*math.sin(ang)),fill=GOLD+(A(140,a),),width=K)

def layers(): return Image.new("RGBA",(W*K,H*K),(0,0,0,0)), Image.new("RGBA",(W,H),(0,0,0,0))
def flush(im,hud,glow):
  im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22))); im.alpha_composite(hud.resize((W,H),Image.BILINEAR))

def body_frame(t):
  im=base.copy(); hud,glow=layers(); g=ImageDraw.Draw(hud)
  # silhouette
  sil_a=ease(seg(t,0,0.35))*(1-0.85*ease(seg(t,4.0,4.6)))*(1-ease(seg(t,10.0,10.6)))
  zt=ease(seg(t,1.9,3.3))
  if PHOTO_SILO:
    zx,zy=CFG["photo_zone"][0]; sc=1+0.55*zt; pw,ph=int(PS_W*sc),int(PS_H*sc)
    cx=W/2-zx*PS_W/2*sc*zt; cy=H*0.47-zy*PS_H/2*sc*zt
    if sil_a>0.01:
      c=DUO.resize((pw,ph),Image.LANCZOS); c.putalpha(DUOM.resize((pw,ph)).point(lambda v:int(v*sil_a)))
      im.alpha_composite(c,(int(cx-pw/2),int(cy-ph/2)))
      g.rounded_rectangle(((cx-pw/2-8)*K,(cy-ph/2-8)*K,(cx+pw/2+8)*K,(cy+ph/2+8)*K),radius=40*K,outline=GOLD+(A(230,sil_a),),width=2*K)
    sa=win(t,0.4,0.6,1.3,1.6)
    if sa>0.01:
      y=cy-ph/2+ph*(0.04+0.92*seg(t,0.4,1.5)); gd=ImageDraw.Draw(glow)
      gd.rectangle((cx-pw/2,y-14,cx+pw/2,y+14),fill=GOLD+(A(110,sa),))
      g.line(((cx-pw/2)*K,y*K,(cx+pw/2)*K,y*K),fill=CHAMP+(A(230,sa),),width=2*K)
    ma=win(t,1.2,1.3,4.0,4.5)
    for k,(px,py) in enumerate(CFG["photo_zone"]):
      marker(g,glow,cx+px*pw/2,cy+py*ph/2,t,1.2+k*0.18,ma,scale=1.0+0.25*zt if k==0 else 0.8+0.1*zt)
    cyb=cy-ph/2+ph*0.08
  else:
    zt=ease(seg(t,1.9,3.3)); zoom=1+1.35*zt; sc=(1080/SH)*zoom
    fx=SW/2+(ZX-SW/2)*zt; fy=SH*0.5+(ZY-SH*0.5)*zt
    ox=W/2-fx*sc; oy=H*0.47-fy*sc
    if sil_a>0.01:
      ss=silo.resize((int(SW*sc),int(SH*sc)),Image.LANCZOS)
      ss.putalpha(ss.split()[3].point(lambda v:int(v*sil_a))); im.alpha_composite(ss,(int(ox),int(oy)))
    sa=win(t,0.4,0.6,1.3,1.6)
    if sa>0.01:
      y=oy+SH*sc*(0.04+0.92*seg(t,0.4,1.5)); gd=ImageDraw.Draw(glow)
      gd.rectangle((W*0.22,y-14,W*0.78,y+14),fill=GOLD+(A(110,sa),))
      g.line((W*0.18*K,y*K,W*0.82*K,y*K),fill=CHAMP+(A(230,sa),),width=2*K)
    # sparkling zone markers (move with zoom)
    ma=win(t,1.2,1.3,4.0,4.5)
    for k,(px,py) in enumerate(CFG["zone_pts"]):
      marker(g,glow,ox+px*S*sc,oy+py*S*sc,t,1.2+k*0.18,ma,scale=1.0+0.25*zt if k==0 else 0.8+0.1*zt)
    cyb=oy+510*sc-14
  d=Dr(im); flush(im,hud,glow)
  a1=win(t,0.3,0.8,2.6,3.1)
  if a1>0.01:  # anchored on the silhouette's collarbone
    f=SAN(30,b"Regular"); txt="BODY BLUEPRINT™"
    sh=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh); w=sd.textlength(txt,font=f)
    sd.text(((W-w)/2,cyb),txt,font=f,fill=TH['shadow']+(A(200,a1),)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
    tc(d,cyb,txt,f,CREAM+(A(255,a1),))
  a2=win(t,2.7,3.2,4.0,4.4)
  tc(d,1045,CFG["zone"],SER(96),CREAM+(A(255,a2),)); tc(d,1160,CFG["benefits"],SAN(34),CHAMP+(A(255,a2),))
  # ---------- protocol ----------
  pa=win(t,4.4,4.8,10.0,10.5)
  if pa>0.01:
    hud,glow=layers(); g=ImageDraw.Draw(hud)
    tc(d,200,CFG["system"],SER(84),CREAM+(A(255,pa),)); tc(d,305,"EL PROTOCOLO",SAN(26,b"Regular"),GOLD+(A(255,pa),))
    stats=[tuple(x)+(4.7+0.5*k,) for k,x in enumerate(CFG["stats"])]
    for k,(num,txt,lbl,t0) in enumerate(stats):
      cx=W/2+(k-1)*320; q=ease(seg(t,t0,t0+0.6))*pa
      if q<=0.01: continue
      val=txt if num is None else str(max(1,round(num*ease(seg(t,t0,t0+0.7)))))
      y=430+30*(1-eob(seg(t,t0,t0+0.5)))
      tc(d,y,val,SAN(130,b"ExtraLight"),CREAM+(A(255,q),),cx)
      tc(d,y+170,lbl,SAN(24,b"Regular"),GOLD+(A(255,q),),cx)
      if k<2: d.line((cx+160,470,cx+160,620),fill=GOLD+(A(120,q),),width=1)
    # 6-week timeline
    ta=ease(seg(t,6.2,6.5))*pa; x0,x1,ty=170,910,800
    if ta>0.01:
      n=CFG["sessions"]; fill=ease(seg(t,6.4,8.4))
      g.line((x0*K,ty*K,x1*K,ty*K),fill=GOLD+(A(90,ta),),width=2*K)
      g.line((x0*K,ty*K,(x0+(x1-x0)*fill)*K,ty*K),fill=CHAMP+(A(255,ta),),width=3*K)
      for k in range(n):
        x=x0+(x1-x0)*k/(n-1); reached=fill*(n-1)>=k-0.001
        r=9*K
        if reached:
          tr=6.4+2.0*k/(n-1); marker(g,glow,x,ty,t,tr,ta,scale=0.55)
        else: g.ellipse((x*K-r,ty*K-r,x*K+r,ty*K+r),outline=GOLD+(A(200,ta),),width=2*K)
        tc(d,ty+40,f"SEM {k+1}",SAN(27,b"Regular"),CHAMP+(A(220,ta),),x)
    ex=CFG["extras"].split(" · ")
    for j,w in enumerate(ex): tc(d,925+j*52,w,SAN(36,b"Regular") if j==0 else SAN(34),(GOLD if j==0 else CHAMP)+(A(255,ease(seg(t,8.4+j*0.35,8.8+j*0.35))*pa),))
    flush(im,hud,glow)
  ya=win(t,10.40,10.80,11.30,11.60)
  tc(d,560,"y esto es",SERI(96),CREAM+(A(255,ya),)); tc(d,670,"lo que pasa",SERI(96),CREAM+(A(255,ya),))
  # ---------- photo sections ----------
  for si,P in enumerate(PAIRS):
    T0=11.4+si*PLEN; last=(si==len(PAIRS)-1)
    fin_a,fin_b=T0+5.2,T0+5.6
    pha=win(t,T0,T0+0.6,fin_a,fin_b) if not (si>0) else win(t,T0,T0+0.4,fin_a,fin_b)
    if pha<=0.01: continue
    bef,aft=P["imgs"]
    hud,glow=layers(); g=ImageDraw.Draw(hud)
    card=bef.copy(); rev=ease(seg(t,T0+1.6,T0+3.0)) if t>=T0+1.6 else 0
    if rev>0:
      m=Image.new("L",(CW_,CH_),0); ImageDraw.Draw(m).pieslice((-2*CH_,-2*CH_,CW_+2*CH_,CH_+2*CH_),-90,-90+360*rev,fill=255)
      card=Image.composite(aft,card,m)
    sc2=0.92+0.08*ease(seg(t,T0,T0+0.6)); dw,dh=int(CW_*sc2),int(CH_*sc2)
    c=card.resize((dw,dh),Image.LANCZOS).convert("RGBA"); c.putalpha(cmask.resize((dw,dh)).point(lambda v:int(v*pha)))
    im.alpha_composite(c,(PCX-dw//2,PCY-dh//2))
    bx0,by0,bx1,by1=(PCX-dw/2-8)*K,(PCY-dh/2-8)*K,(PCX+dw/2+8)*K,(PCY+dh/2+8)*K
    if RECT: g.rounded_rectangle((bx0,by0,bx1,by1),radius=40*K,outline=GOLD+(A(255,pha),),width=2*K)
    else: g.ellipse((bx0,by0,bx1,by1),outline=GOLD+(A(255,pha),),width=2*K)
    if 0<rev<1:
      a2=math.radians(-90+360*rev); R2=(min(CW_,CH_)/2 if not RECT else CW_/2)*K
      for k in range(14):
        aa=math.degrees(a2)-k*2.2
        g.pieslice((PCX*K-R2,PCY*K-R2,PCX*K+R2,PCY*K+R2),aa-2.2,aa,fill=GOLD+(int(60*(1-k/14)),))
      g.line((PCX*K,PCY*K,PCX*K+R2*math.cos(a2),PCY*K+R2*math.sin(a2)),fill=CHAMP+(255,),width=3*K)
    tags=[]
    for k,((rx,ry),lbl,side) in enumerate(P["tags"]):
      t0=T0+3.3+k*0.35; q=win(t,t0,t0+0.4,T0+5.0,T0+5.4)
      if q<=0.01: continue
      mx,my=PCX+rx*CW_/2,PCY+ry*CH_/2; marker(g,glow,mx,my,t,t0,q,scale=0.7)
      ex=PCX+(CW_/2+30)*(-1 if side=="L" else 1); lx=mx+(ex-mx)*ease(seg(t,t0+0.1,t0+0.5))
      g.line((mx*K,my*K,lx*K,my*K),fill=CHAMP+(A(230,q),),width=2*K)
      tags.append((lbl,side,ex,my,q))
    flush(im,hud,glow)
    for (lbl,side,ex,my,q) in tags:
      f=SERI(44); w=d.textlength(lbl,font=f)
      x=ex+12 if side=="R" else ex-12-w
      x=min(max(x,18),W-18-w); d.text((x,my-30),lbl,font=f,fill=CREAM+(A(255,q),))
    lb=win(t,T0+0.4,T0+0.9,T0+1.6,T0+2.0); la=win(t,T0+2.9,T0+3.4,fin_a,fin_b)
    sub=P.get("label","")
    tc(d,92,("antes"+(" · "+sub if sub else "")),SERI(70),CREAM+(A(255,lb),)); tc(d,92,("después"+(" · "+sub if sub else "")),SERI(70),CREAM+(A(255,la),))
    EE=11.4+len(PAIRS)*PLEN; cap=win(t,12.0,12.6,EE-0.4,EE)
    CY0=int(PCY+CH_/2+46) if RECT else 1010
    tc(d,CY0,CFG["system"],SER(84),CREAM+(A(255,cap),))
    tc(d,CY0+105,CFG["caption"].upper(),SAN(28,b"Regular"),GOLD+(A(255,cap),))
    tc(d,CY0+175,"resultados reales · sin retoque · resultados varían",SAN(24),CHAMP+(A(230,win(t,T0+3.2,T0+3.6,fin_a,fin_b)),))
  # ---------- CTA ----------
  E=11.4+len(PAIRS)*PLEN
  e=ease(seg(t,E,E+0.6))
  if e>0.01:
    L=LOGO.copy(); L.putalpha(L.split()[3].point(lambda v:int(v*e))); im.alpha_composite(L,((W-L.width)//2,int(250-20*e)))
    c1=ease(seg(t,E+0.6,E+1.1)); c2=ease(seg(t,E+1.0,E+1.5))
    tc(d,640,"tu cuerpo, con un plan.",SERI(66),CREAM+(A(255,c1),))
    tc(d,735,"AGENDA TU BODY BLUEPRINT™",SAN(36,b"Regular"),GOLD+(A(255,c1),))
    wl=540*c1; d.line((W/2-wl/2,792,W/2+wl/2,792),fill=GOLD+(A(255,c1),),width=2)
    tc(d,840,"link en bio",SAN(32),CHAMP+(A(255,c2),))
    tc(d,890,f"o escríbenos “{CFG['dm']}” por DM",SAN(32),CHAMP+(A(255,c2),))
    by=985+10*math.sin(t*6); ax=W/2
    for pts in (((ax,by-30),(ax,by+10)),((ax-14,by-4),(ax,by+12)),((ax+14,by-4),(ax,by+12))):
      d.line(pts,fill=GOLD+(A(255,c2),),width=2)
  return im.convert("RGB")

# ---------- hook ----------
HOOKL=[tuple(x) for x in CFG.get("hookl",[("lo que","small"),("6 sesiones","big"),("le hicieron a este abdomen","mid")])]
HFN={"small":SERI(84),"big":SER(176,b"SemiBold"),"mid":SER(74,b"Medium")}
HY={"small":440,"big":520,"mid":745}
SLAM=1.05; HT=[]; HTL=[]
_t=0.35
for li,(ln,kind) in enumerate(HOOKL):
  if kind=="big": HTL.append([SLAM]*len(ln)); _t=SLAM+0.75; continue
  row=[]
  for ch in ln: row.append(_t); HT.append(_t); _t+=0.06
  HTL.append(row); _t+=0.2
MIRA=_t+0.15
def hook_rings(g,glow,t):
  cx,cy=W/2,H/2; K2=K
  draw=ease(seg(t,0,0.7)); br=6*math.sin(t*2.4)
  last=max([x for x in HT if x<=t],default=-9); kick=math.exp(-(t-last)*9) if t>=last else 0
  r=330+br+10*kick
  X,Y=cx*K2,cy*K2; RR=r*K2
  # main ring draws itself on, then breathes; brightens with each keystroke
  g.arc((X-RR,Y-RR,X+RR,Y+RR),-90,-90+360*draw,fill=GOLD+(A(255,0.55+0.45*kick),),width=2*K2)
  # inner thin ring counter-rotating dashes
  ri=(r-26)*K2
  for k in range(12):
    st=-t*30+k*30; g.arc((X-ri,Y-ri,X+ri,Y+ri),st,st+14*draw,fill=CHAMP+(A(170,draw),),width=K2)
  # outer rotating arcs
  r2=(r+24)*K2
  for k in range(4): st=t*48+k*90; g.arc((X-r2,Y-r2,X+r2,Y+r2),st,st+50*draw,fill=GOLD+(A(220,draw),),width=2*K2)
  r3=(r+50)*K2
  for k in range(3): st=-t*26+k*120; g.arc((X-r3,Y-r3,X+r3,Y+r3),st,st+22*draw,fill=CHAMP+(A(170,draw),),width=K2)
  # ticks
  for k in range(72):
    ang=math.radians(k*5+t*12); L=(12 if k%6==0 else 6)*K2
    if k/72>draw: continue
    g.line((X+(RR+6*K2)*math.cos(ang),Y+(RR+6*K2)*math.sin(ang),X+(RR+6*K2+L)*math.cos(ang),Y+(RR+6*K2+L)*math.sin(ang)),fill=GOLD+(A(150,1),),width=K2)
  # keystroke ripple
  if kick>0.02:
    q=1-kick; rr=(r+q*70)*K2; g.ellipse((X-rr,Y-rr,X+rr,Y+rr),outline=CHAMP+(A(200,kick),),width=2*K2)
  # orbiting sparkles with soft glow
  gd=ImageDraw.Draw(glow)
  for k,(orb,spd,ph) in enumerate(((r+24,1.4,0),(r+50,-0.9,2.1),(r-26,1.9,4.0))):
    ang=t*spd+ph; x=cx+orb*math.cos(ang); y=cy+orb*math.sin(ang)
    gd.ellipse((x-22,y-22,x+22,y+22),fill=GOLD+(A(160,draw),))
    star(g,x*K2,y*K2,(14+6*math.sin(t*6+k))*K2,SPARK,draw)
    g.ellipse((x*K2-4*K2,y*K2-4*K2,x*K2+4*K2,y*K2+4*K2),fill=SPARK+(A(255,draw),))
  # drifting dust sparkles
  for k in range(14):
    a0=k*2.399; rad=r*(0.4+0.75*((k*0.37)%1)); ang=a0+t*0.25*(1 if k%2 else -1)
    x=cx+rad*math.cos(ang); y=cy+rad*math.sin(ang); tw=max(0,math.sin(t*3.3+k*1.7))
    star(g,x*K2,y*K2,(5+5*tw)*K2,CHAMP,0.8*tw*draw)
def hook_frame(t):
  im=base.copy(); h=Image.new("RGBA",(W*K,H*K),(0,0,0,0)); gl=Image.new("RGBA",(W,H),(0,0,0,0))
  hook_rings(ImageDraw.Draw(h),gl,t)
  im.alpha_composite(gl.filter(ImageFilter.GaussianBlur(14))); im.alpha_composite(h.resize((W,H),Image.BILINEAR)); d=Dr(im)
  for li,(ln,kind) in enumerate(HOOKL):
    f=HFN[kind]; y=HY[kind]; w=d.textlength(ln,font=f); x=(W-w)/2
    if kind=="big":
      p=seg(t,SLAM,SLAM+0.35)
      if p<=0: continue
      sc_=1.7-0.7*eob(p); a_=ease(p*2.5)
      parts=ln.split(" ",1)
      if parts[0][:1].isdigit() and len(parts)==2:
        fn=SAN(150,b"Regular"); wn=d.textlength(parts[0]+" ",font=fn); wr=d.textlength(parts[1],font=f); w=wn+wr
        L=Image.new("RGBA",(int(w)+80,260),(0,0,0,0)); ld=ImageDraw.Draw(L)
        ld.text((40,36),parts[0]+" ",font=fn,fill=GOLD+(255,)); ld.text((40+wn,10),parts[1],font=f,fill=GOLD+(255,))
      else:
        L=Image.new("RGBA",(int(w)+80,260),(0,0,0,0)); ld=ImageDraw.Draw(L); ld.text((40,10),ln,font=f,fill=GOLD+(255,))
      # shimmer sweep across the gold word
      q=seg(t,SLAM+0.35,SLAM+1.1)
      if 0<q<1:
        sw=Image.new("L",L.size,0); sd=ImageDraw.Draw(sw); cx=-120+q*(L.width+240)
        sd.polygon([(cx-40,0),(cx+30,0),(cx-10,L.height),(cx-80,L.height)],fill=255); sw=sw.filter(ImageFilter.GaussianBlur(14))
        hi=Image.new("RGBA",L.size,CREAM+(0,)); hi.putalpha(Image.fromarray((np.asarray(sw).astype(int)*np.asarray(L.split()[3]).astype(int)//255).astype(np.uint8)))
        L.alpha_composite(hi)
      glow=L.copy(); glow.putalpha(glow.split()[3].point(lambda v:int(v*0.55))); glow=glow.filter(ImageFilter.GaussianBlur(16))
      L2=Image.new("RGBA",L.size,(0,0,0,0)); L2.alpha_composite(glow); L2.alpha_composite(L)
      L2=L2.resize((int(L2.width*sc_),int(L2.height*sc_)),Image.LANCZOS); L2.putalpha(L2.split()[3].point(lambda v:int(v*a_)))
      im.alpha_composite(L2,(int(W/2-L2.width/2),int(y+130-L2.height/2)))
      continue
    times=HTL[li]; n=sum(1 for x in times if x<=t); show=ln[:n]
    if show: d.text((x,y),show,font=f,fill=CREAM)
    if 0<n<len(ln): cx=x+d.textlength(show,font=f)+5; d.line((cx,y+16,cx,y+f.size),fill=GOLD,width=3)
  m=ease(seg(t,MIRA,MIRA+0.4))
  if m>0.01:
    f=SAN(36,b"Regular"); txt="MIRA EL ANTES Y DESPUÉS"; yy=870+12*(1-m)
    tc(d,yy,txt,f,CREAM+(A(255,m),))
    wl=d.textlength(txt,font=f)*ease(seg(t,MIRA+0.2,MIRA+0.7)); d.line((W/2-wl/2,yy+56,W/2+wl/2,yy+56),fill=GOLD+(A(255,m),),width=2)
    by=yy+92+8*math.sin(t*7); ax=W/2
    for pts in (((ax,by-20),(ax,by+8)),((ax-11,by-3),(ax,by+9)),((ax+11,by-3),(ax,by+9))): d.line(pts,fill=GOLD+(A(255,m),),width=2)
  return im
def frame(i):
  t=i/FPS
  if t<HOOK-0.35: return hook_frame(t).convert("RGB")
  if t<HOOK:
    p=ease(seg(t,HOOK-0.35,HOOK)); a=hook_frame(t); s2=1+0.25*p
    a=a.resize((int(W*s2),int(H*s2)),Image.LANCZOS); ox=(a.width-W)//2; oy=(a.height-H)//2
    a=a.crop((ox,oy,ox+W,oy+H)).convert("RGB")
    out=Image.blend(a,body_frame(SKIP),p)
    return Image.blend(out,Image.new("RGB",(W,H),CHAMP),0.18*math.sin(math.pi*p))
  return body_frame(t-HOOK+SKIP)
json.dump({"reveals":[11.4+i*PLEN for i in range(len(PAIRS))],"cta":11.4+len(PAIRS)*PLEN,"hook":HOOK,"skip":SKIP,"typing":HT,"slam":SLAM,"mira":MIRA,"dur":DUR},open("timing.json","w"))
if __name__=="__main__":
  only=[float(x) for x in sys.argv[1:]]
  if only:
    for tt in only: frame(int(tt*FPS)).save(f"frames/h{tt:05.2f}.jpg",quality=85)
    sys.exit()
  p=subprocess.Popen(["ffmpeg","-y","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-i","music-B.wav",
    "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",CFG["out"]],
    stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
  for i in range(N): p.stdin.write(frame(i).tobytes())
  p.stdin.close(); p.wait(); print("ok")
