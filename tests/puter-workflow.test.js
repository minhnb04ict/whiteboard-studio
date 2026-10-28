import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-puter-test-'));process.env.AGNES_API_KEY='mock';process.env.AGNES_MIN_INTERVAL_MS='0';process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';process.env.AGNES_RETRIES='0';
const {workflow}=await import('../src/workflow.js'),{get,save,uid}=await import('../src/store.js'),{pollPuter,resolvePuter}=await import('../src/puter-bridge.js');
function project(){const p={id:uid(),title:'Offline fallback',planningEngine:'puter',scenes:[1,2].map((n)=>({id:String(n),title:'Cảnh '+n,text:'Lời kể '+n,startMs:(n-1)*5000,durationMs:5000,prompt:''})),cues:[{startMs:0,endMs:5000,text:'Lời kể 1'},{startMs:5000,endMs:10000,text:'Lời kể 2'}],visualProfile:{styleGuide:'Nét đen',characters:[],environments:[]},job:{id:uid(),options:{},logs:[]}};save(p);return p;}
const context=()=>({signal:new AbortController().signal,log:()=>{}});
function bridge(handler){const client=crypto.randomUUID(),seen=new Set();pollPuter(client);const timer=setInterval(()=>{for(const r of pollPuter(client)){if(seen.has(r.id))continue;seen.add(r.id);resolvePuter(client,r.id,handler(r));}},5);return {ai:{client,model:'test-gemini',provider:'test',fallback:true},close:()=>clearInterval(timer),seen};}
const answer={title:'Minh họa',prompt:'Minh họa tiếng Việt',cast:[]};
test('Puter batch uses sequential single-scene path, saves results and never calls Agnes',async()=>{
 const p=project(),original=globalThis.fetch;let n=0;globalThis.fetch=async()=>{throw Error('Agnes forbidden');};const b=bridge(()=>{n++;return {text:JSON.stringify(answer)};});
 try{const result=await workflow(p.id,'storyboard',{engine:'puter',ai:b.ai},context());assert.equal(result.failed,0);assert.equal(n,2);assert.ok(get(p.id).scenes.every(s=>s.promptSource==='puter'));}finally{b.close();globalThis.fetch=original;}
});
test('Puter quota failure falls back to Agnes once per scene, without retrying failed Puter for every scene',async()=>{
 const p=project(),original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({choices:[{message:{content:JSON.stringify(answer)}}]});};const b=bridge(()=>({error:{code:'insufficient_funds',message:'quota'}}));
 try{await workflow(p.id,'storyboard',{engine:'puter',ai:b.ai},context());assert.equal(b.seen.size,1);assert.equal(calls,2);assert.ok(get(p.id).scenes.every(s=>s.promptSource==='agnes'));}finally{b.close();globalThis.fetch=original;}
});
test('both services unavailable yields local prompts; explicit cancellation has no fallback and no scene mutation',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('offline');};const p=project();const b=bridge(()=>({error:{code:'insufficient_funds',message:'quota'}}));
 try{await workflow(p.id,'storyboard',{engine:'puter',ai:b.ai},context());assert.ok(get(p.id).scenes.every(s=>s.promptSource==='local'));}finally{b.close();globalThis.fetch=original;}
 const cancelled=project(),client=crypto.randomUUID(),controller=new AbortController();pollPuter(client);const job=workflow(cancelled.id,'storyboard',{single:true,sceneId:'1',engine:'puter',ai:{client,model:'test',fallback:true}},{signal:controller.signal,log:()=>{}});controller.abort();await assert.rejects(job,/hủy/);assert.equal(get(cancelled.id).scenes[0].prompt,'');assert.equal(pollPuter(client).length,0);
});
test('strict mode never calls fallback; model refusal never switches providers',async()=>{
 for(const [code,fallback] of [['insufficient_funds',false],['content_filter',true]]){
  const p=project(),b=bridge(()=>({error:{code,message:'failed'}})),original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Forbidden');};
  try{await assert.rejects(workflow(p.id,'storyboard',{single:true,sceneId:'1',engine:'puter',ai:{...b.ai,fallback}},context()));assert.equal(calls,0);assert.equal(get(p.id).scenes[0].prompt,'');}finally{b.close();globalThis.fetch=original;}
 }
});
test('Puter scene plan completes prompts under the originally chosen engine after committing exact ranges',async()=>{
 const p=project(),b=bridge(r=>r.prompt.startsWith('Chia toàn bộ')?{text:JSON.stringify({ranges:[{start:1,end:1,title:'Một'},{start:2,end:2,title:'Hai'}]})}:{text:JSON.stringify(answer)}),original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('No Agnes');};
 try{await workflow(p.id,'sceneplan',{count:2,engine:'puter',ai:b.ai},context());const result=get(p.id);assert.equal(result.scenes.length,2);assert.equal(result.scenes.map(s=>s.text).join(' '),'Lời kể 1 Lời kể 2');assert.ok(result.scenes.every(s=>s.promptSource==='puter'));}finally{b.close();globalThis.fetch=original;}
});
