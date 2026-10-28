import test from 'node:test';
import assert from 'node:assert/strict';
import {run} from '../src/process.js';
test('a hung media child is terminated and reports timeout instead of showing its last progress line as the error',async()=>{
 await assert.rejects(run(process.execPath,['-e',"console.log('PROGRESS rendering scene');setInterval(()=>{},1000)"],{timeout:120}),/quá giới hạn 1 giây/);
});
test('cancellation remains distinct from a render time limit',async()=>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),100);
 try{await assert.rejects(run(process.execPath,['-e','setInterval(()=>{},1000)'],{signal:controller.signal,timeout:5000}),/Đã hủy/);}
 finally{clearTimeout(timer);}
});
