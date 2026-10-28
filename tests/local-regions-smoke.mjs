import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {validateAnnotation} from '../src/domain.js';
const root=path.resolve(import.meta.dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wb-local-regions-'));
const python=process.env.PYTHON_PATH||path.join(root,process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python');
try{
 const image=path.join(tmp,'source.png');
 await sharp(Buffer.from('<svg width="800" height="600"><rect width="800" height="600" fill="#d7ebfa"/><circle cx="180" cy="180" r="80" stroke="black" stroke-width="8" fill="none"/><rect x="480" y="340" width="180" height="160" stroke="black" stroke-width="8" fill="none"/></svg>')).png().toFile(image);
 for(const [width,height] of [[1280,720],[720,1280],[960,960],[1280,960],[960,1280]]){
  const out=path.join(tmp,'regions.json'),r=spawnSync(python,['scripts/local_regions.py',image,out,String(width),String(height),'8000'],{cwd:root,encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);const annotation=validateAnnotation(JSON.parse(fs.readFileSync(out)),8000,{width,height});
  assert.ok(annotation.elements.length>=3);assert.equal(annotation.canvas.width,width);assert.equal(annotation.canvas.height,height);
  assert.ok(annotation.elements.every(e=>e.reveal.durationMs>=100&&e.reveal.startMs+e.reveal.durationMs<=8000));
 }
 console.log('PASS: real OpenCV finds separated ink groups, valid regions/timing in all five aspect ratios without API.');
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
