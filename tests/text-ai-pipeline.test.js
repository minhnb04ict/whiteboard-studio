process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-text-ai-'));
process.env.AGNES_API_KEY=' mock-key ';process.env.AGNES_MIN_INTERVAL_MS='0';process.env.AGNES_RETRIES='0';
const {chat,chatValidated}=await import('../src/agnes.js');
const {ensureVisualProfile}=await import('../src/visual-consistency.js');
const {workflow}=await import('../src/workflow.js');
const {save,get,uid}=await import('../src/store.js');
const {enqueue,startQueue}=await import('../src/queue.js');
const {safeError}=await import('../src/config.js');
const context=()=>({signal:new AbortController().signal,log:()=>{}});
const reply=data=>Response.json({choices:[{message:{content:JSON.stringify(data)}}]});

test('shared character/environment profile repairs schema once, caches validated result and sends text only with a bounded token budget',async()=>{
 const old=globalThis.fetch;let calls=[];
 const p={id:uid(),style:'green chalkboard',scenes:[{id:'1',text:'An đứng cạnh cây ở sân trường.',image:'exists.png'}]};save(p);
 globalThis.fetch=async(url,opts)=>{
  calls.push(JSON.parse(opts.body));assert.ok(url.endsWith('/chat/completions'));assert.equal(opts.headers.Authorization,'Bearer mock-key');
  return reply(calls.length===1?{styleGuide:'green board',characters:[{id:'boy'}]}:
   {styleGuide:'green board',characters:[{id:'boy',name:'An',appearance:'blue polo'}],environments:[{id:'yard',name:'Sân trường',appearance:'one large tree on the left, warm afternoon light'}]});
 };
 try{
  const profile=await ensureVisualProfile(p.id,context());assert.equal(calls.length,2);assert.equal(profile.environments[0].id,'yard');
  assert.ok(calls.every(b=>typeof b.messages.at(-1).content==='string'&&b.max_tokens===6000));
  assert.deepEqual(await ensureVisualProfile(p.id,context()),get(p.id).visualProfile);assert.equal(calls.length,2);
 }finally{globalThis.fetch=old;}
});

test('invalid token stops at one call; malformed JSON has only one formatting repair; failures do not leak credentials',async()=>{
 const old=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async()=>{calls++;return Response.json({error:{message:'invalid token mock-key'}},{status:401});};
  await assert.rejects(chatValidated('schema',x=>x,context()),e=>e.stopBatch&&e.status===401);assert.equal(calls,1);
  calls=0;globalThis.fetch=async()=>{calls++;return reply('not an object');};
  await assert.rejects(chat('JSON',context()),e=>e.code==='INVALID_RESPONSE');assert.equal(calls,2);
  assert.ok(!safeError(Error('Agnes Bearer mock-key')).includes('mock-key'));assert.ok(!safeError(Error('Agnes failed')).includes('Agnes'));
 }finally{globalThis.fetch=old;}
});

test('async schema validation is awaited and repaired once, preserving original constraints',async()=>{
 const old=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return reply({ok:calls>1});};
 try{const result=await chatValidated('keep facts',async data=>{if(!data.ok)throw Error('missing field');return data;},context());assert.equal(result.ok,true);assert.equal(calls,2);}
 finally{globalThis.fetch=old;}
});

test('removed image jobs make zero API calls and queued legacy generation is cancelled on startup',async()=>{
 const old=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('must not send');};
 const p={id:uid(),scenes:[],job:{id:uid(),type:'images',status:'queued',options:{},logs:[]}};save(p);
 try{
  await assert.rejects(workflow(p.id,'images',{},context()),/Đã bỏ/);assert.throws(()=>enqueue(p.id,'image'),/Đã bỏ/);
  startQueue(workflow);assert.equal(get(p.id).job.status,'cancelled');assert.equal(calls,0);
 }finally{await new Promise(setImmediate);globalThis.fetch=old;fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
});
