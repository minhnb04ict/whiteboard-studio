import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import net from 'node:net';
import {spawn,execFileSync} from 'node:child_process';import {setTimeout as wait} from 'node:timers/promises';
import {runMacSession} from '../scripts/macos-session.mjs';
const root=path.resolve(import.meta.dirname,'..');
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
test('Mac session serves real projects, frees the port and preserves data when reopened', {skip:process.platform==='win32'},async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wb-mac-real-'));const port=await freePort();let id;
 try{
  for(let round=0;round<2;round++){
   const controller=new AbortController();let ready;const started=new Promise(r=>ready=r);
   const session=runMacSession({root,support:temp,port,signal:controller.signal,onReady:ready});
   await started;
   const base=`http://127.0.0.1:${port}`;
   if(round===0){const r=await fetch(base+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'Dự án được giữ trên Mac.',seconds:5})});assert.ok(r.ok);id=(await r.json()).id;}
   else {const r=await fetch(base+'/api/projects/'+id);assert.ok(r.ok);assert.equal((await r.json()).scenes[0].text,'Dự án được giữ trên Mac.');}
   const denied=await fetch(base+'/api/desktop/shutdown',{method:'POST'});assert.equal(denied.status,403);
   controller.abort();await session;await assert.rejects(fetch(base+'/api/config',{signal:AbortSignal.timeout(400)}));
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('native parent EOF/STOP shuts down the owned group including orphan workers, while an unrelated process survives',{skip:process.platform==='win32'},async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wb-mac-tree-')),port=await freePort();
 const supervisors=[];
 const sentinel=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});
 const fixture=path.join(temp,'server.mjs');
 const grandCode='const fs=require("node:fs");setInterval(()=>fs.writeFileSync('+JSON.stringify(path.join(temp,'grandchild.tick'))+',String(Date.now())),25)';
 const workerCode=`const {spawn}=require('node:child_process');const fs=require('node:fs');const c=spawn(process.execPath,['-e',${JSON.stringify(grandCode)}],{stdio:'ignore'});console.log('WORKER '+process.pid+' '+c.pid);setInterval(()=>fs.writeFileSync(${JSON.stringify(path.join(temp,'worker.tick'))},String(Date.now())),25);`;
 fs.writeFileSync(fixture,`import http from 'node:http';import {run} from ${JSON.stringify(new URL('../src/process.js',import.meta.url).href)};
const worker=${JSON.stringify(workerCode)};
run(process.execPath,['-e',worker],{onLine:line=>console.log(line)}).catch(()=>{});
http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');if(req.url==='/api/desktop')res.end(JSON.stringify({app:'whiteboard-studio',owned:req.headers['x-desktop-token']===process.env.DESKTOP_SHUTDOWN_TOKEN}));else {res.end('{}');setTimeout(()=>process.exit(0),20);}}).listen(Number(process.env.PORT),'127.0.0.1');`);
 const wrapper=path.join(temp,'parent.mjs');
 fs.writeFileSync(wrapper,`import {nativeParent,runMacSession} from ${JSON.stringify(new URL('../scripts/macos-session.mjs',import.meta.url).href)};import {spawn} from 'node:child_process';const p=nativeParent();try{await p.ready;await runMacSession({root:${JSON.stringify(root)},support:${JSON.stringify(temp)},port:${port},signal:p.signal,spawnServer:(exe,args,options)=>spawn(exe,[${JSON.stringify(fixture)}],options)});}finally{p.close();}`);

 try{
  for(const mode of ['STOP','EOF']){
   const supervisor=spawn(process.execPath,[wrapper],{cwd:root,stdio:['pipe','pipe','pipe']});let output='';supervisor.stdout.on('data',b=>output+=b);supervisor.stderr.on('data',b=>output+=b);supervisors.push({child:supervisor,output:()=>output});
   await wait(50);assert.ok(!output.includes('WORKER'));supervisor.stdin.write('START\n');
   for(let i=0;i<100&&(!output.includes('DESKTOP_READY')||!output.includes('WORKER'));i++)await wait(30);
   assert.match(output,/DESKTOP_READY/);const match=output.match(/WORKER (\d+) (\d+)/);assert.ok(match,output);const ids=match.slice(1).map(Number);
   const exited=new Promise((resolve,reject)=>{supervisor.once('exit',code=>code===0?resolve():reject(Error(output)));});
   if(mode==='STOP')supervisor.stdin.write('STOP\n');else supervisor.stdin.end();
   await exited;const ticks=['worker.tick','grandchild.tick'].map(f=>{try{return fs.readFileSync(path.join(temp,f),'utf8');}catch{return '';}});await wait(180);assert.deepEqual(['worker.tick','grandchild.tick'].map(f=>{try{return fs.readFileSync(path.join(temp,f),'utf8');}catch{return '';}}),ticks,'Owned media workers are still running');assert.equal(sentinel.exitCode,null);assert.equal(sentinel.signalCode,null);process.kill(sentinel.pid,0);
  }
 }finally{for(const entry of supervisors){entry.child.stdin.destroy();if(entry.child.exitCode===null){const pid=entry.output().match(/DESKTOP_SERVER_PID (\d+)/)?.[1];if(pid)try{process.kill(-Number(pid),'SIGKILL');}catch{}entry.child.kill('SIGKILL');}}sentinel.kill('SIGKILL');fs.rmSync(temp,{recursive:true,force:true});}
});
