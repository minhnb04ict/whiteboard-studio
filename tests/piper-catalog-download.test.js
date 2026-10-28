import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {config} from '../src/config.js';
test('Python downloads arbitrary catalog model including Unicode paths, verifies checksums and retains prior file on failed retries',()=>{
 const code=String.raw`import tempfile,pathlib,json,hashlib,os,importlib.util,io,urllib.request,time
with tempfile.TemporaryDirectory() as tmp:
 root=pathlib.Path(tmp);vid='pt_PT-tugão-medium';onnx=b'fixture model';cfg=b'{"num_speakers":2}';prefix='pt/pt_PT/tugão/medium/'
 meta=lambda b:{'size_bytes':len(b),'md5_digest':hashlib.md5(b).hexdigest()}
 catalog={vid:{'key':vid,'name':'tugão','language':{'code':'pt_PT','family':'pt'},'num_speakers':2,'files':{prefix+vid+'.onnx':meta(onnx),prefix+vid+'.onnx.json':meta(cfg)}}}
 c=root/'catalog.json';c.write_text(json.dumps(catalog));os.environ['PIPER_CATALOG_PATH']=str(c);os.environ['PIPER_MODELS_DIR']=str(root/'models')
 spec=importlib.util.spec_from_file_location('tts','scripts/piper_tts.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 calls=[]
 def fake(url,timeout=0):
  calls.append(url);assert 'tug%C3%A3o' in url
  return io.BytesIO(cfg if url.endswith('.json') else onnx)
 urllib.request.urlopen=fake;m.setup(vid);assert len(calls)==2
 m.setup(vid);assert len(calls)==2
 target=m.MODELS/(vid+'.onnx');target.write_bytes(b'old bad data');time.sleep=lambda n:None
 urllib.request.urlopen=lambda *a,**kw:io.BytesIO(b'corrupt')
 try:m.setup(vid);raise AssertionError('bad checksum accepted')
 except RuntimeError:pass
 assert target.read_bytes()==b'old bad data'
 assert not target.with_name(target.name+'.part').exists()
 print('PASS catalog Unicode/checksum/atomic download')
`;
 const r=spawnSync(config.python,['-c',code],{cwd:config.root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
