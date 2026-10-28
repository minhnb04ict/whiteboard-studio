import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {voices,validateCatalog,getVoice} from '../src/voice-catalog.js';
import {settings,validateSettings,speechKey} from '../src/tts.js';
import {filterVoices,uniqueSize} from '../public/voice-filters.js';
import {createDownloadManager} from '../src/voice-downloads.js';
import {setTimeout as wait} from 'node:timers/promises';

test('full official catalog, Unicode identifiers, languages, sizes and backward compatible IDs are usable',()=>{
 assert.ok(voices.length>100);assert.ok(new Set(voices.map(v=>v.language)).size>=35);
 assert.ok(getVoice('pt_PT-tugão-medium'));assert.ok(getVoice('vi_Cake-male'));
 for(const v of voices)assert.equal(validateSettings(settings({text:'Test',tts:{voice:v.id}})).voice,v.id);
 const raw=JSON.parse(fs.readFileSync(new URL('../assets/piper-voices.json',import.meta.url),'utf8'));
 assert.equal(validateCatalog(raw),raw);
 const bad=structuredClone(raw);bad[Object.keys(bad)[0]].files={'../../bad.onnx':{}};assert.throws(()=>validateCatalog(bad));
 assert.ok(uniqueSize(voices)>1e9);
});
test('search ignores accents and filters language, quality and installed state; multi speaker selection invalidates audio only when needed',()=>{
 const vi=filterVoices(voices,{query:'Viet',language:'vi'});assert.ok(vi.length>=3);assert.ok(vi.every(v=>v.language==='vi'));
 assert.ok(filterVoices(voices,{query:'lessac en_US'}).length>=1);
 assert.equal(filterVoices(voices.map(v=>({...v,installed:true})),{status:'missing'}).length,0);
 const multi=voices.find(v=>v.numSpeakers>1),base={text:'Hello',tts:{voice:multi.id,speakerId:0}};
 assert.notEqual(speechKey(base),speechKey({...base,tts:{...base.tts,speakerId:1}}));
 assert.throws(()=>validateSettings(settings({...base,tts:{...base.tts,speakerId:multi.numSpeakers}})));
});
async function idle(manager){for(let i=0;i<300;i++){if(!manager.list().some(v=>['running','queued'].includes(v.download.status)))return;await wait(5);}throw Error('queue timeout');}
test('bulk downloads deduplicate models, skip installed files, serialize work and continue after a single failure',async()=>{
 const list=[{id:'a',model:'same',sizeBytes:10},{id:'b',model:'same',sizeBytes:10},{id:'c',model:'c',sizeBytes:20},{id:'d',model:'d',sizeBytes:30}];
 const installed=new Set(['d']);let active=0,max=0;const calls=[];
 const m=createDownloadManager({getVoices:()=>list,installed:v=>installed.has(v.model),download:async(id,ctx)=>{calls.push(id);active++;max=Math.max(max,active);await wait(10);active--;if(id==='c')throw Error('mock download failure');installed.add('same');ctx.onLine('Done');}});
 const result=m.bulk(list.map(v=>v.id));assert.equal(result.queued,2);assert.equal(result.skipped,1);assert.equal(result.bytes,30);
 m.bulk(list.map(v=>v.id));await idle(m);assert.equal(max,1);assert.equal(calls.length,2);assert.equal(m.list().find(v=>v.id==='c').download.status,'error');assert.equal(m.list().find(v=>v.id==='b').installed,true);
 assert.throws(()=>m.bulk(['../bad']));
});
test('stop cancels queued/active downloads and allows immediate requeue without leaving stale queued states',async()=>{
 const list=[{id:'a',model:'a',sizeBytes:10},{id:'b',model:'b',sizeBytes:20}];let slow=true;
 const m=createDownloadManager({getVoices:()=>list,installed:()=>false,download:async(id,{signal})=>{if(slow)await wait(2000,null,{signal});}});
 m.bulk(['a','b']);await wait(10);m.stop();slow=false;
 assert.equal(m.list().find(v=>v.id==='b').download.status,'cancelled');
 m.bulk(['a','b']);await idle(m);assert.ok(m.list().every(v=>v.download.status==='done'));
});
test('disk full stops remaining downloads rather than failing every model',async()=>{
 const list=['a','b','c'].map(id=>({id,model:id,sizeBytes:10}));let calls=0;
 const m=createDownloadManager({getVoices:()=>list,installed:()=>false,download:async()=>{calls++;throw Error('ENOSPC: No space left on device');}});
 m.bulk(['a','b','c']);await idle(m);assert.equal(calls,1);assert.deepEqual(m.list().map(v=>v.download.status),['error','cancelled','cancelled']);
});
