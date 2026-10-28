import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {setTimeout as wait} from 'node:timers/promises';
import {createRequester} from '../src/agnes-client.js';
import {httpAttempt} from '../src/http-attempt.js';
import {createApiClient} from '../public/api-client.js';
const options={url:'https://mock',body:{},key:'test',timeoutMs:80,maxBytes:1000,label:'Test',heartbeatMs:10};
function requester(fetch,extra={}) {return createRequester({fetch,key:'test',base:'https://mock',timeout:100,textTimeout:100,visionTimeout:100,imageTimeout:100,requestBudget:200,retries:3,imageRetries:2,interval:0,imageInterval:0,sleep:(ms,signal)=>wait(ms,null,{signal}),...extra});}
test('deadline releases queue without headers or with stalled body; heartbeats stop after completion',async()=>{
 let calls=0;const r=requester(()=>++calls===1?new Promise(()=>{}):Promise.resolve(Response.json({ok:true})));
 const first=r('/chat/completions',{}),second=r('/chat/completions',{});
 await assert.rejects(first,e=>e.code==='TIMEOUT');assert.deepEqual(await second,{ok:true});assert.equal(calls,2);
 const logs=[];
 await assert.rejects(httpAttempt({...options,fetch:async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([123]));}})),log:m=>logs.push(m)}),e=>e.code==='TIMEOUT');
 assert.ok(logs.some(m=>m.includes('đang nhận dữ liệu HTTP 200')));
 const count=logs.length;await wait(25);assert.equal(logs.length,count);
});
test('queued cancellation is immediate, sends nothing, and later work still runs',async()=>{
 let finish,calls=0;const r=requester(()=>++calls===1?new Promise(r=>finish=r):Response.json({ok:true}),{timeout:1000,textTimeout:1000,requestBudget:2000});
 const first=r('/chat/completions',{});await wait(5);
 const c=new AbortController(),second=r('/chat/completions',{},{signal:c.signal});c.abort();
 await assert.rejects(second,e=>e.code==='CANCELLED');assert.equal(calls,1);
 finish(Response.json({ok:true}));await first;await r('/chat/completions',{});assert.equal(calls,2);
});
test('active cancellation aborts transport and ignores late success',async()=>{
 let finish,aborted=false;const c=new AbortController();
 const p=httpAttempt({...options,timeoutMs:1000,signal:c.signal,fetch:async(u,o)=>{o.signal.addEventListener('abort',()=>aborted=true);return new Promise(r=>finish=r);}});
 c.abort();await assert.rejects(p,e=>e.code==='CANCELLED');assert.equal(aborted,true);finish(Response.json({late:true}));await wait(10);
});
test('invalid envelopes and oversized responses fail without reissuing requests',async()=>{
 for(const body of ['null','[]','<html>proxy error</html>']) {
  let calls=0;const r=requester(()=>{calls++;return new Response(body)});
  await assert.rejects(r('/chat/completions',{}),e=>e.code==='INVALID_RESPONSE'&&e.stopBatch);assert.equal(calls,1);
 }
 await assert.rejects(httpAttempt({...options,fetch:async()=>new Response('x'.repeat(1001))}),e=>e.code==='RESPONSE_TOO_LARGE');
});
test('image timeout has live heartbeat and never resubmits an ambiguous generation',async()=>{
 const logs=[];let calls=0;const r=requester(()=>{calls++;return new Promise(()=>{});},{heartbeatMs:10});
 await assert.rejects(r('/images/generations',{},{log:m=>logs.push(m)}),e=>e.code==='TIMEOUT'&&e.message.includes('không tự gửi lại'));
 assert.equal(calls,1);assert.ok(logs.some(m=>m.includes('đã chờ')));
});
test('overall deadline includes retry-after, ending before another excessive wait',async()=>{
 let calls=0;const r=requester(()=>{calls++;return Response.json({error:{message:'busy'}},{status:503,headers:{'retry-after':'1'}})},{requestBudget:30});
 await assert.rejects(r('/chat/completions',{}),e=>e.code==='WAIT_LIMIT');assert.equal(calls,1);
});
test('browser polling recovers from hung fetch; mutations never auto retry unreadable replies',async()=>{
 let calls=0;const api=createApiClient(()=>++calls===1?new Promise(()=>{}):Promise.resolve(Response.json({ok:true})),35);
 await assert.rejects(api('/api/projects/id'),/trạng thái/);assert.deepEqual(await api('/api/projects/id'),{ok:true});
 let sends=0;const mutation=createApiClient(async()=>{sends++;return new Response('<html>error</html>',{status:502})});
 await assert.rejects(mutation('/api/projects/id/jobs','POST',{}),/không đọc được/);assert.equal(sends,1);
});
test('real HTTP sockets with delayed headers/body abort; subsequent request succeeds',async(t)=>{
 const sockets=new Set(),server=http.createServer((req,res)=>{
  if(req.url==='/headers')return;
  if(req.url==='/body'){res.writeHead(200,{'Content-Type':'application/json'});res.write('{');return;}
  res.end('{"ok":true}');
 });server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>{for(const s of sockets)s.destroy();server.close();});
 const base='http://127.0.0.1:'+server.address().port;
 for(const endpoint of ['/headers','/body']) await assert.rejects(httpAttempt({...options,timeoutMs:200,url:base+endpoint,fetch}),e=>e.code==='TIMEOUT');
 const r=await httpAttempt({...options,timeoutMs:1000,url:base+'/ok',fetch});assert.equal(r.raw,'{"ok":true}');
});
test('HTTP-200 auth errors stop a batch and legacy retries=3 permits only one text retry',async()=>{
 const auth=requester(()=>Response.json({error:{message:'invalid token'}}));
 await assert.rejects(auth('/chat/completions',{}),e=>e.stopBatch&&e.transport);
 let calls=0,clock=100000;
 const r=requester(()=>{calls++;throw Error('ECONNRESET')},{now:()=>clock,requestBudget:10000,sleep:async ms=>{clock+=ms;}});
 await assert.rejects(r('/chat/completions',{}),e=>e.code==='NETWORK');assert.equal(calls,2);
});
test('body read interruption is reported and does not poison the requester queue',async()=>{
 let calls=0;const r=requester(()=>++calls===1?new Response(new ReadableStream({start(c){c.error(Error('socket disconnected'));}})):Response.json({ok:true}),{retries:0});
 await assert.rejects(r('/chat/completions',{}),e=>e.code==='NETWORK');assert.deepEqual(await r('/chat/completions',{}),{ok:true});
});
