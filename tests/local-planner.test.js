import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-local-plan-'));process.env.AGNES_API_KEY='';
const {localScenes,localStoryboard}=await import('../src/local-planner.js');const {save,get,uid}=await import('../src/store.js');const {workflow}=await import('../src/workflow.js');
test('local splitter preserves every source word and exact SRT gaps/duration with requested scene counts',()=>{
 const cues=[{startMs:2000,endMs:13000,text:'Thỏ chạy qua cánh đồng. Rùa bước chậm nhưng rất kiên trì.'},{startMs:16000,endMs:28000,text:'Sau đó thỏ nghỉ dưới cây. Rùa tiếp tục đi tới đích.'}];
 for(const count of [1,2,3,5,8]){
  const scenes=localScenes(cues,count);assert.equal(scenes.length,count);assert.equal(scenes.map(s=>s.text).join(' '),cues.map(c=>c.text).join(' '));assert.equal(scenes[0].startMs,0);assert.equal(scenes.at(-1).startMs+scenes.at(-1).durationMs,28000);assert.ok(scenes.every(s=>s.durationMs>=1000));
 }
 assert.throws(()=>localScenes(cues,40));
});
test('all local scene/prompt operations complete with fetch forbidden and preserve finished scenes',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('NETWORK FORBIDDEN');};
 try{
  const id=uid(),cues=[{startMs:0,endMs:30000,text:'Đầu tiên, học sinh chọn hình. Tiếp theo, các con tô màu. Cuối cùng, các con giới thiệu sản phẩm.'}];
  save({id,title:'Tạo hình',contentMode:'explain',aspectRatio:'9:16',cues,scenes:[],job:{id:uid(),options:{},logs:[]}});
  const ctx={signal:new AbortController().signal,log:()=>{}};
  await workflow(id,'sceneplan',{count:3},ctx);let p=get(id);assert.equal(p.scenes.length,3);assert.ok(p.scenes.every(s=>s.promptSource==='local'&&s.prompt.includes('9:16')));assert.equal(calls,0);
  const saved=p.scenes[1].prompt;await workflow(id,'storyboard',{sceneId:p.scenes[0].id},ctx);assert.equal(get(id).scenes[1].prompt,saved);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
test('offline prompts quote source and reuse explicit profile without inventing cast counts or knowledge labels',()=>{
 const scene={id:'s',text:'Có 3 quả táo.'},p={contentMode:'explain',scenes:[scene],externalVisual:{characters:'An: áo đỏ',style:'Nền trắng, nét xanh'}};
 const out=localStoryboard(p,scene);assert.equal(out.visualPlan.type,'counting');assert.deepEqual(out.visualPlan.labels,[]);assert.match(out.prompt,/Có 3 quả táo/);assert.equal(out.cast,undefined);assert.equal(out.profile.characters[0].name,'An');
});
