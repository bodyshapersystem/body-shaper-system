import numpy as np, wave, json
TM=json.load(open('timing.json')); HOOKT=TM['hook']; OFF=TM['hook']-TM['skip']; DUR=TM['dur']
SR=44100; n=int(SR*DUR); t=np.arange(n)/SR; rng=np.random.default_rng(11)
mus=np.zeros((n,2)); fx=np.zeros((n,2))
def nf(m): return 440*2**((m-69)/12)
def put(buf,sig,start,pan=0.5,g=1.0):
  i=int(start*SR); L=min(len(sig),n-i)
  if L<=0 or i<0: return
  buf[i:i+L,0]+=sig[:L]*g*(1-pan); buf[i:i+L,1]+=sig[:L]*g*pan
T=lambda d: np.arange(int(d*SR))/SR
B=lambda x: x+OFF
def lp(x,k): return np.convolve(x,np.ones(k)/k,'same')
import sys
STYLE=sys.argv[1] if len(sys.argv)>1 else "A"
def kickS(at,g,f0=45,f1=70,dec=10):
  tt=T(0.4); kf=f0+f1*np.exp(-tt*35); put(mus,np.sin(2*np.pi*np.cumsum(kf)/SR)*np.exp(-tt*dec),at,0.5,g)
def hat(at,g,dec=60,pan=0.62):
  tt=T(0.08); nz=rng.standard_normal(len(tt)); put(mus,(nz-lp(nz,3))*np.exp(-tt*dec),at,pan,g)
def snap(at,g):
  tt=T(0.2); nz=rng.standard_normal(len(tt)); put(mus,(nz-lp(nz,5))*np.exp(-tt*28),at,0.5,g)
def piano(m,d,g,st,pan=0.5):
  tt=T(d); f=nf(m); env=np.exp(-tt*2.2)*np.minimum(1,tt/0.004)
  s=sum(np.sin(2*np.pi*f*h*tt)*np.exp(-tt*h*0.8)/h**1.3 for h in (1,2,3,4,5))
  put(mus,s*env,st,pan,g)
def strings(ms,d,g,st):
  tt=T(d); env=np.minimum(1,tt/1.2)*np.minimum(1,(d-tt)/0.8)
  s=sum(sum(np.sin(2*np.pi*nf(m)*(1+dt)*tt+ph) for dt,ph in ((-0.003,0),(0.0,1),(0.003,2))) for m in ms)
  put(mus,lp(s,6)*env,st,0.5,g)
start=OFF; BODY=DUR-OFF
if STYLE=="A":   # cinematic luxury: piano + strings, swell at reveal
  BPM=84; beat=60/BPM; bar=beat*4
  prog=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; bass=[45,41,36,43]
  for b in range(int(BODY/bar)+1):
    t0=start+b*bar; ch=prog[b%4]
    strings([m+12 for m in ch]+[bass[b%4]],bar+0.8,0.018,t0)
    arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+24,ch[2]+12,ch[1]+12,ch[0]+24,ch[2]+12]
    for e,m in enumerate(arp): piano(m,1.4,0.05,t0+e*beat/2,0.3+0.4*(e%2))
    piano(bass[b%4],3,0.09,t0)
    for q in range(4):
      if q in (0,2) and b>0: kickS(t0+q*beat,0.22,40,40,6)
  tt=T(1.6); put(mus,lp(rng.standard_normal(len(tt)),60)*(tt/1.6)**3*0.25,B(12.8))
elif STYLE=="B": # deep house elegant
  BPM=120; beat=60/BPM; bar=beat*4
  prog=[[57,60,64,67,71],[53,57,60,64,67],[50,53,57,60,64],[52,55,59,62,64]]; bass=[33,29,26,28]
  for b in range(int(BODY/bar)+1):
    t0=start+b*bar; ch=prog[b%4]
    for q in range(4):
      kickS(t0+q*beat,0.30); hat(t0+q*beat+beat/2,0.05)
      if q in (1,3): snap(t0+q*beat,0.06)
    for hit in (beat*0.5,beat*1.75,beat*3.0):
      tt=T(0.35); s=sum(np.sin(2*np.pi*nf(m)*tt)+0.3*np.sign(np.sin(2*np.pi*nf(m)*tt)) for m in ch)
      put(mus,lp(s,14)*np.exp(-tt*9),t0+hit,0.5,0.03)
    for hit,ln in ((0,0.4),(beat*1.5,0.3),(beat*2.5,0.4)):
      tt=T(ln); put(mus,np.sin(2*np.pi*nf(bass[b%4])*tt)*np.minimum(1,tt/0.01)*np.exp(-tt*3),t0+hit,0.5,0.22)
else:            # modern half-time pop: 808 + snaps + pluck
  BPM=140; beat=60/BPM; bar=beat*4
  prog=[[61,64,68],[59,63,66],[57,61,64],[56,59,63]]; bass=[37,35,33,32]
  for b in range(int(BODY/bar)+1):
    t0=start+b*bar; ch=prog[b%4]
    tt=T(bar*0.9); f=nf(bass[b%4])*(1+0.5*np.exp(-tt*25))
    put(mus,np.tanh(2*np.sin(2*np.pi*np.cumsum(f)/SR))*np.exp(-tt*1.2),t0,0.5,0.20)
    snap(t0+beat*2,0.10)
    for e in range(8): hat(t0+e*beat/2,0.03 if e%2 else 0.045,80)
    if b%2: [hat(t0+beat*3.5+j*beat/8,0.025,90) for j in range(4)]
    mel=[ch[2]+12,ch[1]+12,ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24,ch[2]+12,ch[1]+12]
    for e,m in enumerate(mel):
      tt=T(0.5); fq=nf(m); s=(np.sin(2*np.pi*fq*tt)+0.5*np.sin(2*np.pi*2*fq*tt))*np.exp(-tt*8)
      put(mus,s,t0+e*beat/2,0.3+0.4*(e%2),0.04)
    strings([m+12 for m in ch],bar,0.010,t0)
tt=T(HOOKT); pad=sum(np.sin(2*np.pi*nf(m)*tt) for m in (50,57,62,66))
put(mus,lp(pad,20)*np.minimum(1,tt/0.4)*0.05,0)
# ===== FX (lower)
for x in TM['typing']:
  tt=T(0.04); s=rng.standard_normal(len(tt))*np.exp(-tt*180)+0.5*np.sin(2*np.pi*(1800+rng.uniform(-300,300))*tt)*np.exp(-tt*250)
  put(fx,s*0.10,x,rng.uniform(0.35,0.65))
tt=T(0.7); put(fx,lp(rng.standard_normal(len(tt)),12)*np.sin(np.pi*tt/0.7)**2*0.4,HOOKT-0.5)
tt=T(0.9); f=40+80*np.exp(-tt*20); put(fx,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*5)*0.45,HOOKT-0.02)
tt=T(1.0); f=38+90*np.exp(-tt*18); put(fx,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*4)*0.6,TM['slam'])
for mm in (88,95):
  tt=T(1.2); put(fx,np.sin(2*np.pi*nf(mm)*tt)*np.exp(-tt*3)*0.08,TM['slam']+0.35)
tt=T(0.5); put(fx,np.sin(2*np.pi*nf(84)*tt)*np.exp(-tt*6)*0.07,TM['mira'])
def bell(m,d,dec,g,pan,st):
  tt=T(d); f=nf(m); put(fx,(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*f*3.01*tt))*np.exp(-tt*dec)*g,st+OFF,pan)
B=lambda s: s+OFF
tt=T(1.1); put(fx,np.sin(2*np.pi*np.cumsum(500+700*tt)/SR)*np.sin(np.pi*tt/1.1)*0.025,B(0.4))
for k in range(3):
  for m in (86,93): bell(m,0.8,6,0.05,0.3+0.2*k,1.2+k*0.18)
for t0 in (4.7,5.2,5.7):
  bell(81,0.6,7,0.06,0.5,t0)
  for j in range(6): tt=T(0.02); put(fx,rng.standard_normal(len(tt))*np.exp(-tt*300)*0.04,B(t0+j*0.1))
for k in range(6): bell(78+[0,2,4,7,9,12][k],0.7,6,0.05,0.2+0.12*k,6.4+2.0*k/5)
tt=T(1.0); put(fx,lp(rng.standard_normal(len(tt)),40)*(tt/1.0)**2*0.3,B(10.4))
tt=T(1.0); f=40+80*np.exp(-tt*20); put(fx,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*4)*0.4,B(11.4))
tt=T(1.4); put(fx,lp(rng.standard_normal(len(tt)),30)*(tt/1.4)**2*0.22,B(13.0))
for m in (81,85,88,93): bell(m,3,1.6,0.05,0.5,14.4)
for k in range(3):
  for m in (88,95): bell(m,0.8,6,0.04,0.3+0.2*k,14.7+k*0.35)
for m,dt in ((78,0),(85,0.12)): bell(m,1.5,2,0.06,0.5,18.0+dt)
# duck music during "y esto es lo que pasa"
duck=np.ones(n); a,b=int(B(10.3)*SR),int(B(11.5)*SR); duck[a:b]=0.45
mus*=duck[:,None]
mix=mus*1.0+fx*0.3          # effects ~6 dB lower
IL=int(1.6*SR); irt=np.arange(IL)/SR
for c in range(2):
  ir=rng.standard_normal(IL)*np.exp(-irt*3.5); ir[0]=0
  mix[:,c]+=np.fft.irfft(np.fft.rfft(mix[:,c],2*n)*np.fft.rfft(ir,2*n))[:n]*0.010
mix*=(np.minimum(1,t/0.05)*np.minimum(1,(DUR-t)/1.5))[:,None]
mix=np.tanh(mix*1.4); mix/=np.abs(mix).max()/0.88
with wave.open(f"music-{STYLE}.wav","wb") as w:
  w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print("ok")
