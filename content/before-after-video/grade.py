from PIL import Image, ImageOps, ImageEnhance
import numpy as np, glob, os
def grade(im):
  a=np.asarray(im).astype(np.float32)
  # partial gray-world white balance on the brighter (background) pixels
  lum=a.mean(axis=2); mask=lum>np.percentile(lum,60)
  means=a[mask].mean(axis=0); g=means.mean(); gains=np.clip(1+0.35*(g/means-1),0.94,1.06)
  a=np.clip(a*gains,0,255)
  im=Image.fromarray(a.astype(np.uint8))
  im=ImageOps.autocontrast(im,cutoff=0.6)
  im=ImageEnhance.Color(im).enhance(0.88)
  a=np.asarray(im).astype(np.float32)*np.array([1.03,1.0,0.955])
  # gentle lift of shadows (matte, editorial)
  a=a*0.94+12
  return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
if __name__=="__main__":
 for f in sorted(glob.glob("crops/*.png")):
  grade(Image.open(f).convert("RGB")).save("graded/"+os.path.basename(f))
