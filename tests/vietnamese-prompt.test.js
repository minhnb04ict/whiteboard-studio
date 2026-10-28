import test from 'node:test';
import assert from 'node:assert/strict';
import {vietnameseScenePrompt} from '../src/vietnamese-prompt.js';
test('Vietnamese story prompt keeps cast, source labels and reference identities without forcing a cream background',()=>{
 const p={id:'id',title:'Rùa và Thỏ',scenes:[{},{}]},profile={characters:[{id:'rabbit',name:'Thỏ',appearance:'Lông xanh'}],environments:[]};
 const text=vietnameseScenePrompt(p,profile,{text:'Thỏ nói “Xin chào”.',prompt:'Thỏ đứng trên đồi',cast:[{id:'rabbit',count:1}]},{style:'Nền tím',attachments:[{file:'ref.png',label:'Thỏ',role:'character'}],index:1,workflowNote:'Dùng ChatGPT.'});
 assert.match(text,/NHÂN VẬT XUẤT HIỆN TRONG CẢNH: Thỏ: 1/);assert.match(text,/Nền tím/);assert.match(text,/Thỏ nói “Xin chào”/);assert.match(text,/ref.png — Thỏ \(nhân vật\)/);assert.ok(!text.includes('#F6F1E3'));assert.ok(!text.includes('LOCKED'));
});
