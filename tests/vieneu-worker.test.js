import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-vieneu-worker-'));
const {withVieneuWorker,vieneuHome,vieneuPython}=await import('../src/vieneu-runtime.js');
test('VieNeu worker serial protocol reuses one process and aborts an in-flight request without affecting other work',{skip:process.platform==='win32'},async()=>{
 const python=process.env.PYTHON_PATH;if(!python||!fs.existsSync(python))return;
 const executable=vieneuPython();fs.mkdirSync(path.dirname(executable),{recursive:true});
 const code=`#!${python}
import sys,json,time,os
for line in sys.stdin:
 spec=json.loads(line)
 if spec.get('slow'):time.sleep(5)
 print('RESULT '+json.dumps({'id':spec['id'],'pid':os.getpid(),'durationMs':500}),flush=True)
`;
 fs.writeFileSync(executable,code,{mode:0o755});
 const c=new AbortController();await withVieneuWorker({signal:c.signal,log:()=>{}},async request=>{
  const first=await request({text:'Một'}),second=await request({text:'Hai'});assert.equal(first.pid,second.pid);assert.equal(second.id,2);
 });
 const abort=new AbortController(),start=Date.now();
 await assert.rejects(withVieneuWorker({signal:abort.signal,log:()=>{}},async request=>{setTimeout(()=>abort.abort(),50);return request({slow:true});}),/hủy/);
 assert.ok(Date.now()-start<1500);fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});
});
