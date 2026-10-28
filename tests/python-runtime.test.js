import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {supported,choosePython,candidates,localPath,backupVenv} from '../scripts/python-runtime.mjs';
test('installer accepts only Python 3.12 x64 and skips 3.15/32-bit',()=>{
 assert.equal(supported({version:[3,15,0],bits:64}),false);
 assert.equal(supported({version:[3,12,10],bits:32}),false);
 const choice=choosePython([['bad',[]],['py',['-3.12']]],cmd=>cmd==='bad'?{version:[3,15,0],bits:64}:{version:[3,12,10],bits:64});
 assert.equal(choice.cmd,'py');assert.equal(choosePython([['bad',[]]],()=>null),null);
 assert.deepEqual(candidates('win32',{})[0],['py',['-3.12']]);
});
test('old environment backed up without touching data or env',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wb-setup-'));fs.mkdirSync(path.join(root,'.venv'));fs.writeFileSync(path.join(root,'.venv','old'),'old');fs.mkdirSync(path.join(root,'data'));fs.writeFileSync(path.join(root,'data','project.json'),'keep');fs.writeFileSync(path.join(root,'.env'),'keep');
 const backup=backupVenv(root);assert.ok(fs.existsSync(path.join(backup,'old')));assert.ok(!fs.existsSync(path.join(root,'.venv')));assert.equal(fs.readFileSync(path.join(root,'data','project.json'),'utf8'),'keep');assert.equal(fs.readFileSync(path.join(root,'.env'),'utf8'),'keep');assert.ok(localPath(root,'win32').endsWith('Scripts/python.exe'));fs.rmSync(root,{recursive:true,force:true});
});
