import test from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {pollPuter,resolvePuter,requestPuter,validatePuter} from '../src/puter-bridge.js';
test('Puter bridge isolates clients, accepts result once and rejects late results',async()=>{
 const client=crypto.randomUUID(),other=crypto.randomUUID(),ctx={signal:new AbortController().signal};pollPuter(client);
 const promise=requestPuter('original script',{client,model:'test',provider:'test'},ctx);
 const [r]=pollPuter(client);assert.equal(pollPuter(other).length,0);assert.equal(resolvePuter(other,r.id,{text:'wrong'}),false);
 assert.equal(resolvePuter(client,r.id,{text:'{"ok":true}'}),true);assert.equal(await promise,'{"ok":true}');assert.equal(resolvePuter(client,r.id,{text:'late'}),false);assert.equal(pollPuter(client).length,0);
});
test('cancel/timeout/disconnected browser remove pending work and late responses cannot commit',async()=>{
 const client=crypto.randomUUID();pollPuter(client);const controller=new AbortController();const p=requestPuter('x',{client},{signal:controller.signal});const [r]=pollPuter(client);controller.abort();await assert.rejects(p,/hủy/);assert.equal(resolvePuter(client,r.id,{text:'late'}),false);
 await assert.rejects(requestPuter('x',{client},{signal:new AbortController().signal},{timeout:15}),/thời gian/);assert.equal(pollPuter(client).length,0);
 await assert.rejects(requestPuter('x',{client:crypto.randomUUID()},{signal:new AbortController().signal}),/đóng/);
 pollPuter(client);await assert.rejects(requestPuter('x',{client},{signal:new AbortController().signal},{timeout:200,offlineMs:15}),/Mất kết nối/);
});
test('settings validation and refusal classification',async()=>{
 assert.equal(validatePuter().fallback,true);assert.throws(()=>validatePuter({fallback:'yes'}));assert.throws(()=>validatePuter({family:'unknown'}));
 const client=crypto.randomUUID();pollPuter(client);const p=requestPuter('x',{client},{signal:new AbortController().signal});const [r]=pollPuter(client);resolvePuter(client,r.id,{error:{code:'content_filter',message:'refused'}});await assert.rejects(p,e=>e.noFallback===true);
});
