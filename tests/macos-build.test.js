import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
import {nativeArchitecture,verifyNodeArchive,copyRelocatablePython,infoPlist} from '../desktop/macos/build-helpers.mjs';
import {macSupport,prepareMacEnvironment,nativeParent} from '../scripts/macos-session.mjs';
import {bundledPythonPath} from '../src/bundled-runtime.js';
import {resolveTtsPython} from '../src/tts-runtime.js';import {PassThrough} from 'node:stream';
import {descendants} from '../src/process-tree.js';
test('per-task cancellation only selects that worker and descendants, never the session server or unrelated processes',()=>{
 const selected=descendants(20,[[40,30],[50,1],[30,20],[20,10],[10,1]]);
 assert.deepEqual(selected,[40,30,20]);assert.ok(!selected.includes(10)&&!selected.includes(50));
});
test('Mac runtime selection supports both native architectures and rejects mixed Rosetta/cross builds',()=>{
 assert.equal(nativeArchitecture('arm64','arm64').python,'aarch64');assert.equal(nativeArchitecture('x86_64','x64').swift,'x86_64');
 assert.throws(()=>nativeArchitecture('arm64','x64'));assert.throws(()=>nativeArchitecture('unknown','arm64'));
 const root='/Applications/Whiteboard Studio.app/Contents/Resources/app';
 assert.equal(resolveTtsPython({root,platform:'darwin',env:{PIPER_PYTHON_PATH:'/stale/windows/python.exe'},exists:p=>p===bundledPythonPath(root,'darwin')}),root+'/runtime/python/bin/python3.12');
 assert.equal(bundledPythonPath('/app','win32'),'/app/runtime/python/python.exe');
 assert.match(infoPlist('1.9.0'),/LSMinimumSystemVersion/);assert.throws(()=>infoPlist('<injected>'));
});
test('runtime copying rewrites internal absolute symlinks and rejects external dependencies; Node checksum is mandatory',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wb-mac-copy-'));
 try{
  const source=path.join(temp,'source'),dest=path.join(temp,'Vị trí mới','python');fs.mkdirSync(path.join(source,'bin'),{recursive:true});
  fs.writeFileSync(path.join(source,'bin','python3.12'),'test');fs.symlinkSync(path.join(source,'bin','python3.12'),path.join(source,'bin','python'));
  copyRelocatablePython(source,dest);assert.equal(fs.readlinkSync(path.join(dest,'bin','python')),'python3.12');
  fs.rmSync(source,{recursive:true});assert.equal(fs.readFileSync(path.join(dest,'bin','python'),'utf8'),'test');
  const archive=path.join(temp,'node.tar.gz');fs.writeFileSync(archive,'test');const hash=crypto.createHash('sha256').update('test').digest('hex');
  verifyNodeArchive(archive,`${hash}  node.tar.gz`,'node.tar.gz');assert.throws(()=>verifyNodeArchive(archive,'0'.repeat(64)+'  node.tar.gz','node.tar.gz'));
  fs.mkdirSync(source);fs.symlinkSync('/outside/python',path.join(source,'bad'));assert.throws(()=>copyRelocatablePython(source,path.join(temp,'bad-copy')),/ngoài runtime/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('persistent settings, projects and model paths stay outside the app and remain after preparing an updated app',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'wb-mac-settings-'));
 try{
  const root=path.join(temp,'bundle'),support=macSupport(path.join(temp,'Người dùng'));fs.mkdirSync(root);fs.writeFileSync(path.join(root,'.env.example'),'WB_MAC_TEST=template\n');
  const before=process.env.WB_MAC_TEST;const first=prepareMacEnvironment(root,support,{});assert.equal(first.WB_MAC_TEST,'template');assert.equal(process.env.WB_MAC_TEST,before);
  fs.writeFileSync(path.join(support,'.env'),'WB_MAC_TEST=user-setting\nDATA_DIR=/wrong/bundle\n');fs.writeFileSync(path.join(first.DATA_DIR,'keep.json'),'keep');
  const second=prepareMacEnvironment(root,support,{PYTHONHOME:"/stale/python",PYTHONPATH:"/other/site",DYLD_LIBRARY_PATH:"/wrong/lib"});assert.equal(second.PYTHONHOME,undefined);assert.equal(second.PYTHONPATH,undefined);assert.equal(second.DYLD_LIBRARY_PATH,undefined);assert.equal(second.WB_MAC_TEST,'user-setting');assert.equal(second.DATA_DIR,first.DATA_DIR);assert.equal(fs.readFileSync(path.join(second.DATA_DIR,'keep.json'),'utf8'),'keep');assert.equal(second.DESKTOP_SHARED_GROUP,'1');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('native parent START gate, STOP and closing the parent pipe have explicit lifecycle signals',async()=>{
 const input=new PassThrough(),parent=nativeParent(input,1000);input.write('START\n');await parent.ready;assert.equal(parent.signal.aborted,false);input.write('STOP\n');assert.equal(parent.signal.aborted,true);parent.close();
 const secondInput=new PassThrough(),second=nativeParent(secondInput,1000);secondInput.write('START\n');await second.ready;secondInput.end();await new Promise(setImmediate);assert.equal(second.signal.aborted,true);second.close();
 const timeout=nativeParent(new PassThrough(),20);try{await assert.rejects(timeout.ready,/xác nhận/);}finally{timeout.close();}
});
