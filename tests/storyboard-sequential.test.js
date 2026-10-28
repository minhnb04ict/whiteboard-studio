import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {setTimeout as wait} from 'node:timers/promises';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-sequential-'));process.env.AGNES_API_KEY='mock';process.env.AGNES_MIN_INTERVAL_MS='0';process.env.AGNES_RETRIES='0';process.env.AGNES_SCENE_DELAY_MIN_MS='30';process.env.AGNES_SCENE_DELAY_MAX_MS='30';
const {workflow}=await import('../src/workflow.js');const {save,get,uid}=await import('../src/store.js');
test('missing scene proposals await the entire previous response, persist it, pause, then call the identical single-scene path',async()=>{
 const id=uid(),calls=[],ends=[],logs=[];let active=0,max=0;const original=globalThis.fetch;
 save({id,planningEngine:'agnes',title:'Test',style:'Nét đen',visualProfile:{styleGuide:'Nét đen',characters:[]},scenes:[1,2,3].map(n=>({id:String(n),text:'scene '+n,prompt:'',title:'Cảnh '+n}))});
 globalThis.fetch=async(url,options)=>{
  const prompt=JSON.parse(options.body).messages.at(-1).content;
  assert.match(prompt,/Chỉ thiết kế MỘT ảnh/);const n=Number(prompt.match(/CẢNH HIỆN TẠI: scene (\d)/)[1]);
  if(n>1){assert.ok(get(id).scenes[n-2].prompt);assert.ok(Date.now()-ends[n-2]>=25);}
  calls.push(n);active++;max=Math.max(max,active);await wait(20);
  const payload=JSON.stringify({choices:[{message:{content:JSON.stringify({title:'Cảnh '+n,prompt:'Minh họa '+n,cast:[]})}}]});
  return new Response(new ReadableStream({async start(controller){await wait(20);controller.enqueue(new TextEncoder().encode(payload));active--;ends.push(Date.now());controller.close();}}),{headers:{'Content-Type':'application/json'}});
 };
 try{const result=await workflow(id,'storyboard',{}, {signal:new AbortController().signal,log:m=>logs.push(m)});assert.equal(result.failed,0);assert.deepEqual(calls,[1,2,3]);assert.equal(max,1);assert.ok(get(id).scenes.every(s=>s.tasks.storyboard.status==='done'));assert.ok(logs.some(m=>m.includes('riêng cảnh 3/3')));}
 finally{globalThis.fetch=original;fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
});
