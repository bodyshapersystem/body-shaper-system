from PIL import Image, ImageDraw
import sys; sys.path.insert(0,'.')
from grade import grade
src=Image.open("src/05686cdd-image.png").convert("RGB")
for tag,(cx,cy) in (("before",(344,786)),("after",(854,1245))):
  r=322; im=src.crop((cx-r,cy-r,cx+r,cy+r))
  grade(im).save(f"graded/c5-{tag}-circle.png")
