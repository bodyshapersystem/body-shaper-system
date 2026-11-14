import cv2, numpy as np
R={"before":[(0,265,48,365),(588,305,644,405)],"after":[(0,250,118,428),(598,345,644,410)]}
yy,xx=np.mgrid[0:644,0:644]; ring=(np.hypot(xx-322,yy-322)>312).astype(np.uint8)*255
for tag,rects in R.items():
  f=f"graded/c5-{tag}-circle.png"; im=cv2.imread(f)
  im=cv2.inpaint(im,ring,8,cv2.INPAINT_TELEA)          # replace white outside circle with wall
  m=np.zeros((644,644),np.uint8)
  for x0,y0,x1,y1 in rects: m[y0:y1,x0:x1]=255
  m=cv2.GaussianBlur(m,(1,1),0)
  out=cv2.inpaint(im,m,25,cv2.INPAINT_TELEA)
  # soften the filled area so it reads as plain wall
  bl=cv2.GaussianBlur(out,(0,0),9); mm=cv2.GaussianBlur(m,(0,0),6)[:,:,None]/255.0
  out=(out*(1-mm)+bl*mm).astype(np.uint8)
  cv2.imwrite(f.replace(".png","-clean.png"),out)
print("ok")
