"""Executed from the relocated .app during a real macOS build."""
import pathlib,sys,platform,struct,tempfile,json
root=pathlib.Path(__file__).resolve().parents[1]
assert sys.platform=='darwin'
assert platform.machine()==sys.argv[1],(platform.machine(),sys.argv[1])
assert sys.version_info[:2]==(3,12) and struct.calcsize('P')==8
assert pathlib.Path(sys.prefix).resolve()==(root/'runtime/python').resolve(),sys.prefix
import cv2,numpy,av,PIL,onnxruntime,imageio_ffmpeg
from piper import PiperVoice
from piper.phonemize_espeak import EspeakPhonemizer
phonemizer=EspeakPhonemizer()
assert phonemizer.phonemize('en-us','Hello.')
assert phonemizer.phonemize('vi','Xin chào.')
from media import ff,render
from PIL import Image,ImageDraw
with tempfile.TemporaryDirectory() as t:
    work=pathlib.Path(t);im=Image.new('RGB',(320,180),'#254b37');ImageDraw.Draw(im).rectangle((50,30,250,150),outline='white',width=3);im.save(work/'scene.png')
    ann={'canvas':{'width':1280,'height':720},'elements':[{'region':{'x':0,'y':0,'width':1280,'height':720},'reveal':{'startMs':100,'durationMs':400,'protectedRegions':[]}}]}
    project={'cues':[{'startMs':0,'endMs':1000,'text':'Xin chào.'}],'scenes':[{'title':'Mac smoke','image':'scene.png','startMs':0,'durationMs':1000,'annotation':ann}]}
    manifest={'project':project,'projectDir':str(work),'output':str(work/'test.mp4'),'width':320,'height':180,'fps':10,'mode':'skeleton','hand':False,'subtitles':True}
    (work/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8');render(work/'manifest.json')
    with av.open(str(work/'test.mp4')) as c: assert len(list(c.decode(video=0)))==10
print('PASS relocated macOS Python, native libraries, English/Vietnamese phonemizer and actual H.264 video')
