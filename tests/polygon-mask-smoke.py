import sys,pathlib,tempfile
import numpy as np,cv2
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/'vendor/whiteboard/scripts'))
from render_stream_whiteboard import RegionStreamRenderer
import stream_render as sr
r=object.__new__(RegionStreamRenderer);r.out_w=128;r.out_h=72;r.sx=.1;r.sy=.1
triangle={'region':{'x':100,'y':100,'width':400,'height':400,'points':[{'x':100,'y':100},{'x':500,'y':100},{'x':100,'y':500}]},'reveal':{}}
full={'region':{'x':0,'y':0,'width':1280,'height':720},'reveal':{}}
m=r._allowed_mask(triangle,[]);assert m[15,15] and not m[45,45]
n=r._allowed_mask(full,[triangle]);assert not n[15,15] and n[45,45]
# Render a real short clip to ensure masks survive both paths and preserve the triangle boundary.
image=np.full((72,128,3),255,np.uint8);cv2.rectangle(image,(10,10),(50,50),(0,0,0),2)
ann={'canvas':{'width':1280,'height':720},'elements':[dict(triangle,reveal={'startMs':0,'durationMs':500,'protectedRegions':[]})]}
with tempfile.TemporaryDirectory() as d:
 for mode in ['grid','skeleton']:
  renderer=RegionStreamRenderer(image,ann,sr.Config(fps=10,cap_long_edge=128,grid_edge=4,ink_path_mode=mode,preserve_source_background=True),None,True)
  file=pathlib.Path(d)/(mode+'.mp4');renderer.render_to(file,1000)
  cap=cv2.VideoCapture(str(file));frames=[]
  while True:
   ok,frame=cap.read()
   if not ok:break
   frames.append(frame)
  cap.release();assert len(frames)==10
  # Corner outside the polygon must not be revealed as if selecting the whole bounding box.
  assert frames[-1][48,48].mean()>210
print('PASS: polygon mask, later-region subtraction and real grid/skeleton video frames')
