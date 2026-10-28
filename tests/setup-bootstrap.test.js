import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';

function fixture(t,mode='install') {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wb cài Piper '));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'scripts'));
 for(const name of ['setup-tts.mjs','python-runtime.mjs'])
  fs.copyFileSync(new URL('../scripts/'+name,import.meta.url),path.join(root,'scripts',name));
 fs.mkdirSync(path.join(root,'.venv','bin'),{recursive:true});
 fs.mkdirSync(path.join(root,'data'));fs.writeFileSync(path.join(root,'data','keep'),'project');
 const stub=path.join(root,'.venv','bin','python');
 fs.writeFileSync(stub,`#!${process.execPath}
const fs = require('node:fs'),path = require('node:path');
const root=${JSON.stringify(root)},mode=${JSON.stringify(mode)},args=process.argv.slice(2);
fs.appendFileSync(path.join(root,'calls'),JSON.stringify(args)+'\\n');
if(args.includes('-c') && args.at(-1).includes('struct.calcsize')) console.log(JSON.stringify({version:[3,12,10],bits:64,executable:process.argv[1]}));
else if(args.includes('-c')) process.exit(mode==='ready'||fs.existsSync(path.join(root,'installed'))?0:1);
else if(args.includes('pip') && args.includes('--version')) process.exit(fs.existsSync(path.join(root,'pip-ready'))?0:1);
else if(args.includes('ensurepip')) fs.writeFileSync(path.join(root,'pip-ready'),'yes');
else if(args.includes('install')) {if(mode==='fail'){console.error('simulated pip network error');process.exit(1);}fs.writeFileSync(path.join(root,'installed'),'yes');}
else if(args.includes('doctor')) console.log('{"engineReady":true,"ready":false}');
else process.exit(99);
`,{mode:0o755});
 return root;
}
function launch(root) {
 return spawnSync(process.execPath,[path.join(root,'scripts','setup-tts.mjs')],{cwd:os.tmpdir(),encoding:'utf8',env:{...process.env,PYTHON_PATH:'/old-computer/missing.exe'},timeout:15000});
}
const unix={skip:process.platform==='win32'?'POSIX executable fixture; Windows BAT requires a Windows run':false};
test('Piper setup on a clean checkout needs neither npm dependencies nor dotenv and restores missing pip',unix,t=>{
 const root=fixture(t);assert.equal(fs.existsSync(path.join(root,'node_modules')),false);
 const r=launch(root);assert.equal(r.status,0,r.stderr);
 const calls=fs.readFileSync(path.join(root,'calls'),'utf8').trim().split('\n').map(JSON.parse);
 assert.ok(calls.some(c=>c.includes('ensurepip')));
 assert.ok(calls.some(c=>c.includes('piper-tts==1.3.0')));
 assert.ok(calls.some(c=>c.includes('doctor')));
 assert.equal(fs.readFileSync(path.join(root,'data','keep'),'utf8'),'project');
});
test('existing Piper works offline without pip upgrade or reinstall and missing .env is allowed',unix,t=>{
 const root=fixture(t,'ready'),r=launch(root);assert.equal(r.status,0,r.stderr);
 const calls=fs.readFileSync(path.join(root,'calls'),'utf8').trim().split('\n').map(JSON.parse);
 assert.equal(calls.some(c=>c.includes('install')),false);
 assert.equal(calls.some(c=>c.includes('ensurepip')),false);
 assert.ok(calls.some(c=>c.includes('doctor')));
});
test('installation failure exits nonzero without claiming success or deleting user projects',unix,t=>{
 const root=fixture(t,'fail'),r=launch(root);assert.notEqual(r.status,0);
 assert.match(r.stderr,/Lenh that bai/);assert.doesNotMatch(r.stdout,/BO PIPER DA SAN SANG/);
 assert.equal(fs.readFileSync(path.join(root,'data','keep'),'utf8'),'project');
});
