"""ROI pixel equivalence plus a real dense two-scene Full HD skeleton export."""
import sys,pathlib,tempfile,time,json,weakref
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import media
import cv2,numpy as np
import stream_render as sr
from render_stream_whiteboard import RegionStreamRenderer
from PIL import Image,ImageDraw,ImageFont

rng=np.random.default_rng(201)
for radius in (0,1,4,9):
    image=rng.integers(0,256,(180,320,3),dtype=np.uint8)
    cfg=sr.Config(cap_long_edge=320,ink_reveal_radius=radius,preserve_source_background=True)
    r=RegionStreamRenderer(image,{'canvas':{'width':320,'height':180},'elements':[]},cfg,None,True)
    expected=r.drawn.copy();allowed=rng.random((180,320))>.3
    segments=[((0,0),(3,2)),((319,179),(315,177)),((0,90),(319,90)),((-5,20),(5,20)),((160,90),(160,90))]
    segments += [((int(x),int(y)),(int(x+3),int(y+2))) for x,y in rng.integers([0,0],[317,177],size=(80,2))]
    for a,b in segments:
        full=np.zeros((180,320),np.uint8)
        cv2.line(full,a,b,255,thickness=max(1,radius*2+1),lineType=cv2.LINE_AA)
        revealed=(full>0)&r.ink_pixels&allowed
        expected[revealed]=r.ink_paint[revealed]
        r._reveal_ink_segment(a,b,allowed)
    assert np.array_equal(r.drawn,expected),f'ROI changed source pixels or protection mask: radius {radius}'
print('PASS ROI is pixel-identical to the old full-frame algorithm, including edges, zero-length strokes and protected pixels.',flush=True)

# Colour reveal must remain monotonic, preserve protected pixels and finish
# with exact source colours, without recopying all previous pixels per frame.
image=rng.integers(0,256,(180,320,3),dtype=np.uint8)
r=RegionStreamRenderer(image,{'canvas':{'width':320,'height':180},'elements':[]},sr.Config(cap_long_edge=320,preserve_source_background=True),None,True)
allowed=rng.random((180,320))>.3;initial=r.drawn.astype(np.uint8);previous=np.zeros((180,320),bool)
class ColourWriter:
    def write(self,frame):
        global previous
        changed=np.any(frame!=initial,axis=2)
        assert not (changed & ~allowed).any()
        assert not (previous & ~changed).any()
        assert np.array_equal(frame[changed],image[changed])
        previous=changed
r._wash_contour(ColourWriter(),40,allowed)
assert np.array_equal(r.drawn[allowed],image[allowed])
assert np.array_equal(r.drawn[~allowed],initial[~allowed])

with tempfile.TemporaryDirectory() as t:
    r.render_to(pathlib.Path(t)/'release.mp4',100)
    reference=weakref.ref(r);del r
    assert reference() is None,'Finished renderer retained image buffers through a callback cycle'

# Assert the work area of an ordinary short stroke is small, independent of
# Full HD image area. No fragile wall-clock threshold on slower machines.
image=np.full((1080,1920,3),240,dtype=np.uint8)
r=RegionStreamRenderer(image,{'canvas':{'width':1920,'height':1080},'elements':[]},sr.Config(cap_long_edge=1920),None,True)
shapes=[];original_zeros=np.zeros
def record(shape,*args,**kwargs):
    shapes.append(shape);return original_zeros(shape,*args,**kwargs)
np.zeros=record
try:r._reveal_ink_segment((500,500),(503,502),np.ones((1080,1920),bool))
finally:np.zeros=original_zeros
assert shapes and max(h*w for h,w in shapes)<2500,shapes
del r,image

started=time.perf_counter();events=[];original_progress=media.progress
def capture(percent,message):
    events.append((percent,message));original_progress(percent,message)
media.progress=capture
with tempfile.TemporaryDirectory() as temp:
    base=pathlib.Path(temp);scenes=[]
    font=ImageFont.truetype(media.font_path(),16)
    for n,rgb in enumerate([(246,241,227),(37,75,55)]):
        im=Image.new('RGB',(1280,720),rgb);d=ImageDraw.Draw(im);ink='black' if n==0 else 'white'
        # A deliberately detailed line drawing: hundreds of small glyphs,
        # repeated diagram parts and curves, unlike a single-rectangle smoke.
        for y in range(30,690,58):
            for x in range(25,1250,110):
                d.ellipse((x,y,x+35,y+28),outline=ink,width=2)
                d.line((x+35,y+15,x+65,y+15),fill=ink,width=2)
                d.rectangle((x+65,y,x+90,y+28),outline=ink,width=2)
                d.text((x,y+31),'A B 123',font=font,fill=ink)
        im.save(base/f'{n}.png')
        ann={'canvas':{'width':1280,'height':720},'elements':[
            {'region':{'x':0,'y':0,'width':1280,'height':720},'reveal':{'startMs':100,'durationMs':3300,'protectedRegions':[]}}]}
        scenes.append({'title':f'Dense {n+1}','image':f'{n}.png','startMs':4000*n,'durationMs':4000,'annotation':ann})
    manifest={'project':{'scenes':scenes,'cues':[{'startMs':0,'endMs':8000,'text':'Các nét vẽ và con số.'}]},
              'projectDir':str(base),'output':str(base/'video.mp4'),'width':1920,'height':1080,'fps':30,
              'mode':'skeleton','subtitles':True,'hand':True}
    (base/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8')
    media.render(base/'manifest.json')
    cap=cv2.VideoCapture(str(base/'video.mp4'));count=0;first=None;second=None;last=None
    assert int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))==1920
    assert int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))==1080
    while True:
        ok,frame=cap.read()
        if not ok:break
        if count==0:first=frame.copy()
        if count==120:second=frame.copy()
        last=frame;count+=1
    cap.release();assert count==240,count
    assert np.mean(first[:20,:20])>200
    assert np.mean(second[:20,:20])<100
    assert np.std(last)>20,'Completed scene must not remain blank'
    for i in (1,2):
        scene_events=[m for _,m in events if f'Đang vẽ cảnh {i}/2' in m]
        assert len(scene_events)>=4,scene_events
        assert any('khung' in m and 'Vẽ đường nét' in m for m in scene_events)
        assert any('Tô màu' in m for m in scene_events)
    assert events[-1][0]==100
    print(json.dumps({'PASS':'Full HD dense skeleton export, both scenes complete, 240 frames/8 seconds, hand and Vietnamese subtitles, per-stage/frame progress','elapsedSeconds':round(time.perf_counter()-started,2),'progressEvents':len(events)},ensure_ascii=False),flush=True)
