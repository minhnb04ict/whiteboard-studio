import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
process.env.DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'wb-catalog-refresh-'));
const {refreshCatalog,voices,catalogPath}=await import('../src/voice-catalog.js');
test('catalog refresh preserves legacy choices, writes a shared Python/Node cache atomically, and survives offline/invalid updates',async()=>{
 const old=globalThis.fetch,initial=voices.length;
 const raw=JSON.parse(fs.readFileSync(new URL('../assets/piper-voices.json',import.meta.url),'utf8'));
 const source=structuredClone(raw['en_US-amy-low']),id='en_US-testnew-low';source.key=id;source.name='testnew';source.files=Object.fromEntries(Object.entries(source.files).map(([k,v])=>[k.replaceAll('amy','testnew'),v]));
 try {
  globalThis.fetch=async()=>Response.json({[id]:source});const result=await refreshCatalog();assert.equal(result.count,initial+1);assert.equal(voices.length,initial+1);assert.ok(voices.some(v=>v.id==='vi_Cake-male'));
  const cached=JSON.parse(fs.readFileSync(catalogPath,'utf8'));assert.ok(cached[id]);assert.ok(cached['en_US-amy-low']);assert.equal(fs.existsSync(catalogPath+'.tmp'),false);
  globalThis.fetch=async()=>new Response('offline',{status:503});await assert.rejects(refreshCatalog());assert.equal(voices.length,initial+1);
  globalThis.fetch=async()=>Response.json({bad:{key:'../escape'}});await assert.rejects(refreshCatalog());assert.ok(JSON.parse(fs.readFileSync(catalogPath,'utf8'))[id]);
 }finally{globalThis.fetch=old;fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
});
