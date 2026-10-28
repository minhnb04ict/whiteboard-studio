process.env.AGNES_SCENE_DELAY_MIN_MS='0';process.env.AGNES_SCENE_DELAY_MAX_MS='0';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-transport-'));
process.env.AGNES_API_KEY='mock';process.env.AGNES_RETRIES='3';
process.env.AGNES_MIN_INTERVAL_MS='0';process.env.AGNES_IMAGE_INTERVAL_MS='0';
process.env.AGNES_TEXT_TIMEOUT_MS='60';process.env.AGNES_VISION_TIMEOUT_MS='60';
const {workflow}=await import('../src/workflow.js');
const {save,get,uid,dir}=await import('../src/store.js');
const {parseSrt}=await import('../src/domain.js');
const ctx=()=>({signal:new AbortController().signal,log:()=>{}});
const profile={styleGuide:'sketch',characters:[]};
const scene=n=>({id:String(n),title:'Scene '+n,text:'scene '+n,prompt:'',cast:[],startMs:(n-1)*4000,durationMs:4000,tasks:{storyboard:{status:'queued'}}});
test('timeout is not semantic retry; batch stops safely and resumes unfinished scenes',async()=>{
 const old=globalThis.fetch;
 try {
  let calls=0;
  globalThis.fetch=()=>{calls++;return new Promise(()=>{});};
  const cues=parseSrt(fs.readFileSync(new URL('./fixtures/subtitles/atitn.srt',import.meta.url),'utf8'));
  const planned={id:uid(),cues,scenes:[scene(1)]};planned.planningEngine="agnes";save(planned);
  await assert.rejects(workflow(planned.id,'sceneplan',{count:2,ai:{fallback:false}},ctx()),e=>e.code==='TIMEOUT');
  assert.equal(calls,1,'No semantic retry after transport timeout');
  assert.equal(get(planned.id).scenes[0].title,'Scene 1');

  const p={id:uid(),visualProfile:profile,style:'sketch',scenes:[1,2,3].map(scene)};p.planningEngine="agnes";save(p);
  calls=0;
  const ok=()=>Response.json({choices:[{message:{content:JSON.stringify({title:'Saved',prompt:'one tree',cast:[]})}}]});
  globalThis.fetch=()=>++calls===2?new Promise(()=>{}):ok();
  const stopped=await workflow(p.id,'storyboard',{sceneIds:['1','2','3'],ai:{fallback:false}},ctx());
  assert.equal(stopped.stopped,true);assert.equal(calls,2,'Does not call next scene during outage');
  assert.deepEqual(get(p.id).scenes.map(s=>s.tasks.storyboard.status),['done','error','queued']);
  calls=0;globalThis.fetch=()=>{calls++;return ok();};
  const resumed=await workflow(p.id,'storyboard',{sceneIds:['1','2','3'],ai:{fallback:false}},ctx());
  assert.equal(resumed.failed,0);assert.equal(calls,2,'Completed scene is kept');

 } finally {globalThis.fetch=old;fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
});
