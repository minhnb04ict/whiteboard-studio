"""Regression: many short freehand regions must finish inside the scene frame budget."""
import pathlib,sys,tempfile
import cv2,numpy as np
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]/'vendor/whiteboard/scripts'))
from render_stream_whiteboard import RegionStreamRenderer
import stream_render as sr
image=np.full((180,320,3),255,np.uint8);elements=[]
for i in range(20):
 x=5+(i%10)*31;y=10+(i//10)*85
 cv2.rectangle(image,(x+5,y+5),(x+20,y+50),(20,40,180),-1)
 points=[{'x':x,'y':y},{'x':x+25,'y':y+2},{'x':x+27,'y':y+60},{'x':x+1,'y':y+62}]
 elements.append({'region':{'x':x,'y':y,'width':27,'height':62,'points':points},'reveal':{'startMs':100+i*150,'durationMs':150}})
ann={'canvas':{'width':320,'height':180},'elements':elements}
with tempfile.TemporaryDirectory() as d:
 for mode in ['grid','skeleton']:
  renderer=RegionStreamRenderer(image,ann,sr.Config(fps=30,cap_long_edge=320,grid_edge=10,ink_path_mode=mode,preserve_source_background=True),None,True)
  target=pathlib.Path(d)/(mode+'.mp4');renderer.render_to(target,3600)
  cap=cv2.VideoCapture(str(target));frames=[]
  while True:
   ok,f=cap.read()
   if not ok:break
   frames.append(f)
  cap.release()
  assert len(frames)==108,(mode,'frame drift',len(frames))
  # The exporter consumes exactly 108 frames. All regions, including the last, must be visible by then.
  for i in range(20):
   x=5+(i%10)*31;y=10+(i//10)*85
   assert frames[-1][y+25,x+12].mean()<150,(mode,'missing region',i+1)
 # Two dense freehand outlines at a larger canvas; verify phase order and
 # translated skeleton coordinates, not just the eventual final rectangle.
 image=np.full((540,960,3),255,np.uint8)
 cv2.rectangle(image,(190,190),(290,350),(20,30,160),-1)
 cv2.rectangle(image,(670,190),(770,350),(160,30,20),-1)
 regions=[]
 for i,cx in enumerate([240,720]):
  pts=[{'x':round(cx+140*np.cos(t)),'y':round(270+210*np.sin(t))} for t in np.linspace(0,2*np.pi,128,endpoint=False)]
  regions.append({'region':{'x':cx-140,'y':60,'width':280,'height':420,'points':pts},'reveal':{'startMs':100+i*1000,'durationMs':1000}})
 for mode in ['grid','skeleton']:
  r=RegionStreamRenderer(image,{'canvas':{'width':960,'height':540},'elements':regions},sr.Config(fps=20,cap_long_edge=960,grid_edge=10,ink_path_mode=mode,preserve_source_background=True),None,True)
  file=pathlib.Path(d)/('two-'+mode+'.mp4');r.render_to(file,2600)
  c=cv2.VideoCapture(str(file));frames=[]
  while True:
   ok,f=c.read()
   if not ok:break
   frames.append(f)
  c.release();assert len(frames)==52
  assert frames[23][270,240].mean()<150 and frames[23][270,720].mean()>220
  assert frames[-1][270,240].mean()<150 and frames[-1][270,720].mean()<150
 # A later full rectangle used to subtract all earlier polygons, leaving
 # the first slots blank. It must now reveal only the remaining background.
 regions.append({'region':{'x':0,'y':0,'width':960,'height':540},'reveal':{'startMs':2100,'durationMs':1000}})
 regions.append({'region':{'x':0,'y':0,'width':960,'height':540},'reveal':{'startMs':3100,'durationMs':1000}})
 for mode in ['grid','skeleton']:
  r=RegionStreamRenderer(image,{'canvas':{'width':960,'height':540},'elements':regions},sr.Config(fps=20,cap_long_edge=960,grid_edge=10,ink_path_mode=mode,preserve_source_background=True),None,True)
  file=pathlib.Path(d)/('overlap-'+mode+'.mp4');r.render_to(file,4600)
  c=cv2.VideoCapture(str(file));frames=[]
  while True:
   ok,f=c.read()
   if not ok:break
   frames.append(f)
  c.release();assert len(frames)==92
  # Empty duplicate slot gets redistributed, so first useful region finishes
  # at ~1.43 s and the second at ~2.77 s.
  assert frames[29][270,240].mean()<150 and frames[29][270,720].mean()>220
  assert frames[-1][270,240].mean()<150 and frames[-1][270,720].mean()<150
  assert np.max(np.abs(frames[59][240:300,210:270].astype(int)-frames[29][240:300,210:270].astype(int)))<20
 # The same container must work first, between, or after the two polygons.
 import copy
 cv2.rectangle(image,(440,40),(510,90),(40,120,30),-1)
 for mode in ['grid','skeleton']:
  reference=None
  for placement in [0,1,2]:
   inner=copy.deepcopy(regions[:2]);outer=copy.deepcopy(regions[2]);inner.insert(placement,outer)
   for i,e in enumerate(inner):e['reveal']={'startMs':100+i*1000,'durationMs':1000}
   r=RegionStreamRenderer(image,{'canvas':{'width':960,'height':540},'elements':inner},sr.Config(fps=20,cap_long_edge=960,grid_edge=10,ink_path_mode=mode,preserve_source_background=True),None,True)
   file=pathlib.Path(d)/f'container-{mode}-{placement}.mp4';r.render_to(file,3600)
   c=cv2.VideoCapture(str(file));frames=[]
   while True:
    ok,f=c.read()
    if not ok:break
    frames.append(f)
   c.release();assert len(frames)==72
   assert frames[23][270,240].mean()<150 and frames[23][270,720].mean()>220
   assert frames[43][65,470].mean()>220 and frames[-1][65,470].mean()<150
   if reference is None:reference=frames
   else:assert all(np.array_equal(a,b) for a,b in zip(reference,frames)),(mode,placement)
print('PASS: overlap, duplicate, exact duration; enclosing region first/middle/last yields identical video in grid and skeleton.')
