import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {config} from '../src/config.js';
import {run} from '../src/process.js';
test('media progress handles cp1252 Windows-style pipes and accented scene names',()=>{
 const r=spawnSync(config.python,['-c',"import sys;sys.path.insert(0,'scripts');import media;media.progress(20,'Đang vẽ cảnh: Trường học — cây xanh');print('Lỗi tiếng Việt',file=sys.stderr)"],{cwd:config.root,env:{...process.env,PYTHONUTF8:'0',PYTHONIOENCODING:'cp1252'},encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);const d=JSON.parse(r.stdout.trim().slice(9));assert.equal(d.message,'Đang vẽ cảnh: Trường học — cây xanh');assert.match(r.stderr,/Lỗi tiếng Việt/);
});
test('Node decodes UTF-8 characters split across pipe chunks',async()=>{
 const lines=[];
 const result=await run(process.execPath,['-e',"const b=Buffer.from('Đang vẽ cảnh cây xanh\\n');process.stdout.write(b.subarray(0,1));setTimeout(()=>process.stdout.write(b.subarray(1)),40)"],{onLine:l=>lines.push(l)});
 assert.equal(lines[0],'Đang vẽ cảnh cây xanh');assert.equal(result,'Đang vẽ cảnh cây xanh\n');
});
