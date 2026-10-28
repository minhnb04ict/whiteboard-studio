import test from 'node:test';import assert from 'node:assert/strict';
import {formats,canvasOf,reframeAnnotation} from '../public/formats.js';import {fallbackAnnotation,validateAnnotation} from '../src/domain.js';import {parseScript} from '../src/project-script.js';import {settings,speechKey} from '../src/tts.js';import {videoFilename} from '../src/video-filename.js';
test('five formats validate freehand annotations without reverting to 16:9',()=>{
 for(const [aspectRatio,f] of Object.entries(formats)){
  const a=fallbackAnnotation({durationMs:3000},canvasOf({aspectRatio}));assert.deepEqual(validateAnnotation(a,3000,canvasOf({aspectRatio})).canvas,{width:f.width,height:f.height});
  a.elements[0].region={x:0,y:0,width:f.width,height:f.height,points:[{x:0,y:0},{x:f.width,y:0},{x:0,y:f.height}]};assert.equal(validateAnnotation(a,3000).elements[0].region.points.length,3);
 }
});
test('reframe uses original image placement, preserves original coordinates on round trip and clamps cropped regions',()=>{
 const a=fallbackAnnotation({durationMs:3000});a.elements.push({...a.elements[0],region:{x:100,y:100,width:300,height:200},reveal:{startMs:2600,durationMs:100,protectedRegions:[]}});
 const vertical=reframeAnnotation(a,{width:1280,height:720},formats['9:16'],'contain');assert.equal(vertical.elements[0].region.height,1280);
 const back=reframeAnnotation(vertical,{width:1280,height:720},formats['16:9']);assert.ok(Math.abs(back.elements[1].region.x-100)<2);
 const crop=reframeAnnotation(a,{width:1280,height:720},formats['9:16'],'cover','east');assert.ok(crop.elements.every(e=>e.region.x+e.region.width<=720));
});
test('script apply keeps SRT timestamps and clean narration, rejects empty text and invalid duration',()=>{
 const p=parseScript({kind:'srt',text:'1\n00:00:01,000 --> 00:00:03,000\nXin chào.'});assert.equal(p.cues[0].startMs,1000);assert.equal(p.text,'Xin chào.');assert.throws(()=>parseScript({text:''}));assert.throws(()=>parseScript({text:'Xin chào',seconds:-1}));
});
test('voice engine/backend/model participate in cache identity without invalidating legacy Piper caches',()=>{
 const p={text:'Xin chào',tts:{voice:'vi_VN-vais1000-medium'}};assert.equal(settings(p).engine,undefined);
 const v={text:'Xin chào',tts:{engine:'vieneu',backend:'onnx',voice:'Minh Quân Pro'}};assert.equal(settings(v).model,'v3turbo@3.8.3');assert.notEqual(speechKey(p),speechKey(v));assert.notEqual(speechKey(v),speechKey({...v,tts:{...v.tts,backend:'cuda'}}));
 assert.equal(videoFilename({title:'Rùa và Thỏ',aspectRatio:'9:16'},{height:1920}),'Video_Rua_va_Tho_9x16_1080x1920.mp4');
});
