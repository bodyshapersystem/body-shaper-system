from PIL import Image
import numpy as np, cv2
from grade import grade
OW,OH=960,1269
def cut(im,x0,y0,x1,y1): return im.crop((x0,y0,x1,y1)).resize((OW,OH),Image.LANCZOS)
def skinmatch(b,a):
  B=np.asarray(b).astype(float); A_=np.asarray(a).astype(float)
  mb=(B.mean(2)>90)&(B.mean(2)<235); ma=(A_.mean(2)>90)&(A_.mean(2)<235); lb,la=B[mb].mean(),A_[ma].mean(); t=(lb+la)/2
  f=lambda X,l: Image.fromarray(np.clip(255*((X/255)**(np.log(t/255)/np.log(l/255))),0,255).astype(np.uint8))
  return f(B,lb),f(A_,la)
def ghost(img):  # remove overlay circle line in portal screenshot (lower-left)
  bgr=cv2.cvtColor(np.asarray(img),cv2.COLOR_RGB2BGR); g=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY).astype(float)
  d=cv2.GaussianBlur(g,(0,0),4)-g; reg=np.zeros_like(g,bool); reg[int(OH*0.45):,0:int(OW*0.45)]=True
  m=((d>6)&reg&(g>70)).astype(np.uint8)*255; m=cv2.dilate(m,np.ones((5,5),np.uint8))
  return Image.fromarray(cv2.cvtColor(cv2.inpaint(bgr,m,6,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB))
def W(k,b,a):
  b,a=skinmatch(grade(b),grade(a)); b.save(f"graded/{k}-before-rect.png"); a.save(f"graded/{k}-after-rect.png")
# p2b: before = portal screenshot (black set), after = IMG_2224
b=Image.open("src2/before2.png").convert("RGB")
ac=cv2.imread("src2/before.jpg"); m=np.zeros(ac.shape[:2],np.uint8); m[990:1145,375:485]=255
a=Image.fromarray(cv2.cvtColor(cv2.inpaint(ac,m,15,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB))
bb=cut(b,111,1050,1169,2450); aa=cut(a,496,470,1544,1856)
bb,aa=skinmatch(grade(bb),grade(aa)); ghost(bb).save("graded/p2b-before-rect.png"); aa.save("graded/p2b-after-rect.png")
# p3 front / side
W("p3f",cut(Image.open("src3/fb.jpg").convert("RGB"),101,300,1386,2000),cut(Image.open("src3/fa.jpg").convert("RGB"),36,312,1745,2573))
W("p3s",cut(Image.open("src3/sb.jpg").convert("RGB"),450,600,1430,1897),cut(Image.open("src3/sa.jpg").convert("RGB"),141,501,1709,2576))
print("ok")
