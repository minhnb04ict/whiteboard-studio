import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-clone-catalog-'));
const {vieneuVoices,cloneFolder,defaultVieneuVoice}=await import('../src/vieneu-catalog.js');const {settings,speechKey,validateSettings}=await import('../src/tts.js');
test('VieNeu catalog exposes all 25 presets before installation and accepts legacy aliases',()=>{
 assert.equal(vieneuVoices().filter(v=>v.kind==='preset').length,25);assert.ok(vieneuVoices().some(v=>v.id===defaultVieneuVoice));
 const spec=settings({text:'Xin chào',tts:{engine:'vieneu',voice:'Minh Quân Pro'}});assert.doesNotThrow(()=>validateSettings(spec));
 assert.throws(()=>cloneFolder('../../etc'));
});
test('saved clone is visible in a fresh catalog, owns a revision in speech cache and vanishes on deletion',()=>{
 const id='wb_clone_'+crypto.randomUUID(),folder=cloneFolder(id);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'metadata.json'),JSON.stringify({id,label:'Giọng của tôi',revision:'a'.repeat(64)}));fs.writeFileSync(path.join(folder,'voices_v3_turbo.json'),JSON.stringify({presets:{[id]:{speaker_emb:[1],codes:[[1]]}}}));
 assert.ok(vieneuVoices().some(v=>v.id===id&&v.kind==='clone'));
 const scene={text:'Xin chào',tts:{engine:'vieneu',voice:id}};assert.equal(settings(scene).voiceRevision,'a'.repeat(64));const before=speechKey(scene);
 fs.writeFileSync(path.join(folder,'metadata.json'),JSON.stringify({id,label:'Giọng của tôi',revision:'b'.repeat(64)}));assert.notEqual(speechKey(scene),before);
 fs.rmSync(folder,{recursive:true});assert.ok(!vieneuVoices().some(v=>v.id===id));assert.throws(()=>validateSettings(settings(scene)),/Giọng VieNeu/);
});
