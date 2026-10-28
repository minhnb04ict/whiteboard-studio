import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawn,spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {setTimeout as wait} from 'node:timers/promises';
if(process.platform==='win32'){console.log('SKIP: POSIX executable stub test; use the Python adapter tests on Windows.');process.exit(0);}
const root=path.resolve(import.meta.dirname,'..'),data=fs.mkdtempSync(path.join(os.tmpdir(),'wb210-api-')),home=path.join(data,'vieneu'),python=process.env.PYTHON_PATH||path.join(root,'.venv/bin/python'),base='http://127.0.0.1:3210';
fs.mkdirSync(path.join(home,'env/bin'),{recursive:true});fs.writeFileSync(path.join(home,'ready.json'),JSON.stringify({version:'3.8.3',backends:{onnx:true},voices:[{id:'Minh Quân Pro',label:'Minh Quân Pro'}]}));
const stub=`#!${python}
import sys,types,runpy,pathlib,json,numpy as np
class Fake:
 def __init__(self,**kwargs):self.voices={'Minh Quân Pro':{'speaker_emb':[0.0]*192,'codes':[[1]*5]*16}}
 def list_preset_voices(self):return [(v,v) for v in self.voices]
 def _load_repo_voices(self,folder):self.voices.update(json.loads((pathlib.Path(folder)/'voices_v3_turbo.json').read_text())['presets'])
 def add_voice(self,name,ref_audio,**kwargs):
  import soundfile as sf
  a,sr=sf.read(ref_audio);assert len(a)>=sr*3
  self.voices[name]={'speaker_emb':[.1]*192,'codes':[[2]*5]*16}
 def save_voices(self,file):pathlib.Path(file).write_text(json.dumps({'presets':self.voices}))
 def infer(self,text,voice,**kwargs):
  assert voice in self.voices,voice
  return (.1*np.sin(np.arange(24000)*2*np.pi*440/48000)).astype('float32')
sys.modules['vieneu']=types.SimpleNamespace(Vieneu=Fake)
sys.argv=['scripts/vieneu_worker.py'];runpy.run_path(sys.argv[0],run_name='__main__')
`;fs.writeFileSync(path.join(home,'env/bin/python'),stub,{mode:0o755});
const ref=path.join(data,'reference.wav');const make=spawnSync(python,['-c',`import wave,numpy as np;w=wave.open(${JSON.stringify(ref)},'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes((np.sin(np.arange(48000*4)*.1)*3000).astype('<i2').tobytes());w.close()`]);assert.equal(make.status,0);
const proc=spawn(process.execPath,['src/server.js'],{cwd:root,env:{...process.env,DATA_DIR:data,PORT:'3210',PYTHON_PATH:python,AGNES_API_KEY:'',AGNES_BASE_URL:'http://127.0.0.1:1'},stdio:['ignore','pipe','pipe']});let logs='';proc.stdout.on('data',b=>logs+=b);proc.stderr.on('data',b=>logs+=b);
async function call(u,method='GET',body){const form=body instanceof FormData,r=await fetch(base+u,{method,headers:form?{}:{'Content-Type':'application/json'},body:form?body:body?JSON.stringify(body):undefined});const d=await r.json();assert.ok(r.ok,JSON.stringify(d));return d;}
async function doneVoice(expected='done'){for(let i=0;i<200;i++){const j=await call('/api/vieneu/voice-job');if(j.status!=='running'){assert.equal(j.status,expected,j.message);return j;}await wait(50);}throw Error('voice job hung');}
async function doneProject(id){for(let i=0;i<200;i++){const p=await call('/api/projects/'+id);if(!['running','queued'].includes(p.job?.status)){assert.equal(p.job.status,'done',p.job.message);return p;}await wait(50);}throw Error('project job hung');}
try{
 for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await wait(50);}
 let p=await call('/api/projects','POST',{title:'Thỏ và Rùa'});p=await call(`/api/projects/${p.id}/script`,'PUT',{text:'Thỏ chạy qua cánh đồng. Rùa bước chậm nhưng kiên trì. Thỏ nghỉ dưới cây. Rùa đi tới đích.',seconds:24,apply:true});
 await call(`/api/projects/${p.id}/jobs`,'POST',{type:'sceneplan',options:{count:3}});p=await doneProject(p.id);assert.equal(p.scenes.length,3);assert.ok(p.scenes.every(s=>s.promptSource==='local'));console.log('local scene plan + prompts with unreachable API: pass');
 const bad=new FormData();bad.append('file',new Blob(['invalid media']),'bad.wav');bad.append('name','Mẫu lỗi');bad.append('backend','onnx');await call('/api/vieneu/clone','POST',bad);await doneVoice('error');assert.equal((await call('/api/vieneu')).voices.filter(v=>v.kind==='clone').length,0);
 const cancel=new FormData();cancel.append('file',new Blob([fs.readFileSync(ref)]),'voice.wav');cancel.append('name','Mẫu hủy');cancel.append('backend','onnx');await call('/api/vieneu/clone','POST',cancel);await call('/api/vieneu/voice-job/cancel','POST',{});await doneVoice('cancelled');assert.equal((await call('/api/vieneu')).voices.filter(v=>v.kind==='clone').length,0);assert.deepEqual(fs.readdirSync(path.join(home,'clones')),[]);
 const form=new FormData();form.append('file',new Blob([fs.readFileSync(ref)]),'voice.wav');form.append('name','Giọng thử của tôi');form.append('backend','onnx');await call('/api/vieneu/clone','POST',form);const j=await doneVoice();const id=j.voiceId;
 let status=await call('/api/vieneu');assert.equal(status.voices.filter(v=>v.kind==='preset').length,25);assert.ok(status.voices.some(v=>v.id===id&&v.kind==='clone'));
 assert.equal((await fetch(base+`/api/vieneu/voices/${id}/sample`)).status,200);
 p=await call(`/api/projects/${p.id}/voice-settings`,'PUT',{voiceOnly:true,tts:{engine:'vieneu',backend:'onnx',voice:id}});assert.ok(p.scenes.every(s=>s.tts.voice===id));
 await call(`/api/projects/${p.id}/jobs`,'POST',{type:'speech',options:{sceneId:p.scenes[0].id}});p=await doneProject(p.id);assert.equal(p.scenes[0].speech.engine,'vieneu');assert.ok(p.scenes[0].speech.durationMs>0);
 const blocked=await fetch(base+`/api/vieneu/voices/${id}`,{method:'DELETE'});assert.equal(blocked.status,400);
 await call(`/api/vieneu/voices/${id}/preview`,'POST',{backend:'onnx',text:'Xin chào.'});const preview=await doneVoice();assert.equal((await fetch(base+'/api/vieneu/previews/'+preview.previewId)).status,200);
 await call(`/api/projects/${p.id}/voice-settings`,'PUT',{voiceOnly:true,tts:{engine:'vieneu',backend:'onnx',voice:'Minh Quân Pro'}});await call(`/api/vieneu/voices/${id}`,'DELETE');assert.ok(!(await call('/api/vieneu')).voices.some(v=>v.id===id));
 console.log('PASS: 25 VieNeu presets, real reference conversion, invalid sample/cancel cleanup, mock-SDK clone/enrol/persist/sample, apply cloned voice, speech synthesis+FFmpeg, preview, deletion guard and removal.');
}finally{proc.kill();await wait(200);fs.rmSync(data,{recursive:true,force:true});if(logs.includes('Error'))console.log(logs);}
