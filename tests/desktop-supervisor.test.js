import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import net from 'node:net';import {spawn} from 'node:child_process';import {setTimeout as wait} from 'node:timers/promises';
const root=path.resolve(import.meta.dirname,'..');
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const port=s.address().port;await new Promise(r=>s.close(r));return port;}
function exited(child){return new Promise(r=>{if(child.exitCode!==null)r(child.exitCode);else child.once('exit',r);});}
function alive(pid){try{process.kill(pid,0);return true;}catch{return false;}}
test('closing the isolated browser releases port, exits supervisor/server, preserves projects and permits reopening; unrelated process survives',{skip:process.platform==='win32'?'POSIX fixture; Windows Job/HWND test is in desktop checklist':false,timeout:20000},async()=>{
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'wb-desktop-life-')),log=path.join(data,'browser.json'),chrome=path.join(data,'fake-chrome'),port=await freePort(),base='http://127.0.0.1:'+port;
 fs.writeFileSync(chrome,`#!${process.execPath}\nrequire('fs').writeFileSync(${JSON.stringify(log)},JSON.stringify({pid:process.pid,args:process.argv.slice(2),hasToken:!!process.env.DESKTOP_SHUTDOWN_TOKEN,hasApi:!!process.env.AGNES_API_KEY}));setInterval(()=>{},1000);`,{mode:0o755});
 const sentinel=spawn(process.execPath,['-e','setInterval(()=>{},1000)']);let child,code,output='';const launch=()=>{output='';child=spawn(process.execPath,['--input-type=module','-e',`import {runDesktop,awaitParent} from './scripts/desktop-main.mjs';try{await awaitParent();await runDesktop({port:${port},chromePath:${JSON.stringify(chrome)}});}catch(e){console.error(e.message);process.exitCode=1;}`],{cwd:root,env:{...process.env,DATA_DIR:data,DESKTOP_SHUTDOWN_TOKEN:'owner-test'},stdio:['pipe','pipe','pipe']});code=exited(child);child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);};
 try{
  let projectId,firstProfile;
  for(let round=0;round<2;round++){
   fs.rmSync(log,{force:true});launch();await wait(80);assert.equal(fs.existsSync(log),false);child.stdin.write('START\n');
   for(let i=0;i<150&&!fs.existsSync(log);i++){assert.equal(child.exitCode,null,output);await wait(30);}
   assert.ok(fs.existsSync(log),output);const browser=JSON.parse(fs.readFileSync(log,'utf8')),profile=browser.args.find(x=>x.startsWith('--user-data-dir=')).slice(16);
   assert.equal(browser.hasToken,false);assert.equal(browser.hasApi,false);assert.ok(browser.args.includes('--app='+base));assert.ok(fs.existsSync(profile));
   if(round===0){firstProfile=profile;fs.writeFileSync(path.join(profile,'session-sentinel'),'kept');const created=await fetch(base+'/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Giữ dự án',kind:'text',text:'Xin chào.',seconds:4})});const p=await created.json();assert.ok(p.id);projectId=p.id;}
   else {assert.equal(profile,firstProfile);assert.equal(fs.readFileSync(path.join(profile,'session-sentinel'),'utf8'),'kept');const p=await(await fetch(base+'/api/projects/'+projectId)).json();assert.equal(p.title,'Giữ dự án');}
   const publicInfo=await(await fetch(base+'/api/desktop')).json();assert.equal(publicInfo.owned,false);assert.ok(!JSON.stringify(publicInfo).includes('owner-test'));
   const denied=await fetch(base+'/api/desktop/shutdown',{method:'POST'});assert.equal(denied.status,403);
   process.kill(browser.pid,'SIGTERM');assert.equal(await code,0,output);
   await assert.rejects(fetch(base+'/api/desktop'));assert.equal(alive(browser.pid),false);assert.equal(fs.existsSync(profile),true);assert.equal(alive(sentinel.pid),true);
  }
 }finally{child?.kill();sentinel.kill();await wait(50);fs.rmSync(data,{recursive:true,force:true});}
});
