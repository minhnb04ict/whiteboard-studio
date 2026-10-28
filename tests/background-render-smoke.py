"""Real MP4 regression: source background, dark chalk, per-scene canvas and padding."""
import sys, pathlib, tempfile, json
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from media import render, normalize
import stream_render as sr
from render_stream_whiteboard import RegionStreamRenderer
from source_background import background_rgb
from PIL import Image, ImageDraw
import numpy as np
import cv2

with tempfile.TemporaryDirectory() as tmp:
    base = pathlib.Path(tmp)
    colours = [(37,75,55), (255,255,255), (25,105,190), (242,177,200), (246,241,227)]
    scenes = []
    for i, rgb in enumerate(colours):
        im = Image.new('RGB', (320,180), rgb)
        d = ImageDraw.Draw(im)
        ink = 'white' if i in (0,2) else 'black'
        d.rectangle((80,40,240,140), outline=ink, width=4)
        # Nearby background tones must remain exact, not be snapped to canvas.
        d.rectangle((20,20,40,30), fill=tuple(min(255,v+3) for v in rgb))
        im.save(base/f'{i}.png')
        image = np.asarray(im)[:,:,::-1].copy()
        ann = {'canvas':{'width':320,'height':180}, 'elements':[
            {'region':{'x':0,'y':0,'width':320,'height':180},
             'reveal':{'startMs':200,'durationMs':600,'protectedRegions':[]}}]}
        for mode in ('grid','skeleton'):
            cfg = sr.Config(fps=10, cap_long_edge=320, preserve_source_background=True,
                            match_bg=True, ink_path_mode=mode)
            renderer = RegionStreamRenderer(image,ann,cfg,None,True)
            assert tuple(renderer.canvas_bgr) == rgb[::-1]
            assert np.array_equal(renderer.color_img,image), 'source pixels changed'
            assert np.all(renderer.drawn[0,0] == rgb[::-1])
            assert renderer.ink_pixels[40:45,90:230].any(), 'chalk outline not detected'
            renderer._reveal_ink_segment((80,40),(240,40),np.ones((180,320),dtype=bool))
            assert np.array_equal(renderer.drawn[40,150],image[40,150]), 'ink hue changed'
        scenes.append({'title':f'Colour {i}','image':f'{i}.png','startMs':i*1200,
                       'durationMs':1200,'annotation':ann})
    # Python fallback normalization, non-16:9 and RGBA.
    for rgb in colours:
        Image.new('RGBA',(80,160),(*rgb,255)).save(base/'portrait.png')
        normalize(base/'portrait.png',base/'normalized.png')
        normalized = Image.open(base/'normalized.png')
        assert normalized.size == (1280,720)
        assert normalized.getpixel((0,0)) == rgb
    m = {'project':{'scenes':scenes,'cues':[{'startMs':0,'endMs':6000,'text':''}]},
         'projectDir':str(base),'output':str(base/'video.mp4'), 'width':320,'height':180,
         'fps':10,'mode':'grid','hand':False,'subtitles':False}
    (base/'manifest.json').write_text(json.dumps(m),encoding='utf-8')
    render(base/'manifest.json')
    cap = cv2.VideoCapture(str(base/'video.mp4')); frames=[]
    while True:
        ok,frame=cap.read()
        if not ok:break
        frames.append(frame)
    cap.release()
    assert len(frames)==60, len(frames)
    for i,rgb in enumerate(colours):
        for offset in (0,5,11):
            pixel=np.median(frames[i*12+offset][:15,:15],axis=(0,1))[::-1]
            assert np.max(np.abs(pixel-np.array(rgb)))<12,(i,offset,pixel,rgb)
        # Completed centre still contains the intended light/dark outline.
        line=frames[i*12+11][40:43,100:200].mean()
        assert line>180 if i in (0,2) else line<80,(i,line)
    print('PASS: real H.264, 5 distinct scene backgrounds, opening/middle/final colours, white chalk, grid/skeleton source pixels, portrait/RGBA padding.')
