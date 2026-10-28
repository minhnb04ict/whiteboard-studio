import test from 'node:test';import assert from 'node:assert/strict';import {sceneGap} from '../src/scene-gap.js';
test('gap is sampled from 1–3 seconds after completion and awaits sleep before resolving',async()=>{
 const logs=[],controller=new AbortController();let released=false,finish;
 const p=sceneGap({signal:controller.signal,log:m=>logs.push(m)},{random:(min,max)=>{assert.equal(min,1000);assert.equal(max,3001);return 2345;},sleep:async(ms,_,{signal})=>{assert.equal(ms,2345);assert.equal(signal,controller.signal);await new Promise(r=>finish=r);released=true;}});
 await Promise.resolve();assert.equal(released,false);assert.match(logs[0],/2.3 giây/);finish();assert.equal(await p,2345);
});
test('cancel during a real scene gap rejects immediately and does not continue',async()=>{
 const c=new AbortController();const p=sceneGap({signal:c.signal,log:()=>{}},{random:()=>3000});c.abort();await assert.rejects(p,/abort/i);
 await assert.rejects(sceneGap({signal:c.signal,log:()=>{}}),/hủy/);
});
