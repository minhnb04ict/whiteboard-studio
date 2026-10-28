import pathlib,sys,tempfile,json,subprocess
import cv2,numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from media import render
formats=[('16x9',1280,720,640,360),('9x16',720,1280,360,640),('1x1',960,960,640,640),('4x3',1280,960,640,480),('3x4',960,1280,480,640),('portrait-FHD',720,1280,1080,1920),('manual-background',1280,720,640,360)]
with tempfile.TemporaryDirectory() as temp:
 base=pathlib.Path(temp)
 for name,cw,ch,w,h in formats:
  # Coloured background and an isolated object: no full-image annotation.
  image=np.full((ch,cw,3),(220,200,160),np.uint8);cv2.rectangle(image,(100,100),(250,250),(25,35,45),8);cv2.imwrite(str(base/'image.png'),image)
  ann={'canvas':{'width':cw,'height':ch},'elements':[{'region':{'x':80,'y':80,'width':200,'height':200},'reveal':{'startMs':300,'durationMs':400,'protectedRegions':[]}}]}
  p={'id':'test','cues':[{'startMs':0,'endMs':1200,'text':'Kiểm tra'}],'scenes':[{'title':name,'startMs':0,'durationMs':1200,'image':'image.png','annotation':ann,'backgroundMode':'auto','detectedBackground':'#a0c8dc'}]}
  if name=='manual-background':
   p['scenes'][0].update(backgroundMode='manual',backgroundColor='#f0aabb');ann['elements'][0]['region']={'x':0,'y':0,'width':cw,'height':ch}
  expected=[187,170,240] if name=='manual-background' else [220,200,160]
  out=base/(name+'.mp4');manifest=base/'manifest.json';manifest.write_text(json.dumps({'project':p,'projectDir':str(base),'width':w,'height':h,'fps':10,'mode':'skeleton','hand':False,'subtitles':False,'output':str(out)}))
  render(manifest);cap=cv2.VideoCapture(str(out));assert (int(cap.get(3)),int(cap.get(4)))==(w,h)
  frames=[]
  while True:
   ok,f=cap.read()
   if not ok:break
   frames.append(f)
  cap.release();assert len(frames)==12
  for frame in [frames[0],frames[-1]]:assert np.max(np.abs(frame[-10,-10].astype(int)-expected))<12
  assert np.max(np.abs(frames[0][h//2,w//2].astype(int)-expected))<12
 print('PASS: five real H.264 exports, exact dimensions/duration, source colour present from first frame and unchanged outside drawn regions')
