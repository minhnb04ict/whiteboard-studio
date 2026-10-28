import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from '../src/process.js';
import {config} from '../src/config.js';
test('FFmpeg stretches 20s to 23.53s with pitch preserved, 150ms lead and 350ms tail',async()=>{
 const script=`import sys,tempfile,pathlib,wave,numpy as np
sys.path.insert(0,'scripts')
from media import compose_speech
with tempfile.TemporaryDirectory() as folder:
 p=pathlib.Path(folder);sr=48000
 a=(np.sin(2*np.pi*440*np.arange(sr*20)/sr)*5000).astype('<i2')
 with wave.open(str(p/'source.wav'),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(a.tobytes())
 s={'startMs':0,'durationMs':24030,'speech':{'file':'source.wav','durationMs':20000,'audioDurationMs':23530,'playbackRate':0.85}}
 out=compose_speech([s],p,p)
 with wave.open(str(out),'rb') as w:
  assert w.getnframes()==round(24.030*sr)
  data=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2')
 assert np.max(np.abs(data[:7200]))==0
 assert np.max(np.abs(data[-16800:]))==0
 segment=data[sr:sr*2].astype(float)
 peak=np.argmax(np.abs(np.fft.rfft(segment)))
 assert abs(peak-440)<=2,peak
 print('duration and pitch verified')`;
 const result=await run(config.python,['-c',script]);assert.match(result,/verified/);
});
