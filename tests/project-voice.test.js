import test from 'node:test';
import assert from 'node:assert/strict';
import {applyProjectVoice} from '../src/project-voice.js';
import {speechKey} from '../src/tts.js';
import {voices} from '../src/voice-catalog.js';
test('project voice changes all scenes, preserves per-scene pace/text and permits later overrides',()=>{
 const voice=voices[0].id,other=voices.find(v=>v.id!==voice&&v.numSpeakers===1).id;
 const p={scenes:[{text:'Xin chào',narration:'Lời đọc riêng',tts:{voice:other,speed:0.7,pauseMs:200,style:'calm'}},{text:'Tạm biệt',tts:{voice:other,speed:1.2,pauseMs:900,style:'neutral'}}]};
 p.scenes.forEach(s=>s.speech={file:'old.wav',key:speechKey(s)});
 applyProjectVoice(p,{voice},{voiceOnly:true,installed:id=>id===voice});
 assert.deepEqual(p.scenes.map(s=>s.tts.voice),[voice,voice]);
 assert.deepEqual(p.scenes.map(s=>s.tts.speed),[0.7,1.2]);
 assert.deepEqual(p.scenes.map(s=>s.tts.pauseMs),[200,900]);
 assert.deepEqual(p.scenes.map(s=>s.tts.style),['calm','neutral']);
 assert.equal(p.scenes[0].narration,'Lời đọc riêng');
 assert.ok(p.scenes.every(s=>s.tasks.speech.status==='stale'));
 p.scenes[1].tts.voice=other;assert.equal(p.scenes[0].tts.voice,voice);assert.equal(p.projectVoice.voice,voice);
});
test('project voice validates all scenes before mutating and rejects missing models',()=>{
 const p={scenes:[{text:'Xin chào',tts:{}},{text:'',tts:{}}]},before=structuredClone(p);
 assert.throws(()=>applyProjectVoice(p,{voice:voices[0].id},{voiceOnly:true,installed:()=>true}));
 assert.deepEqual(p,before);
 assert.throws(()=>applyProjectVoice(p,{voice:voices[0].id},{voiceOnly:true,installed:()=>false}),/chưa tải/);
 assert.deepEqual(p,before);
 const v=voices.find(v=>v.numSpeakers>1);
 assert.throws(()=>applyProjectVoice({scenes:[{text:'Hello'}]},{voice:v.id,speakerId:v.numSpeakers},{voiceOnly:true}),/Người nói/);
});
test('reapplying unchanged voice keeps current audio usable',()=>{
 const s={text:'Xin chào',tts:{voice:voices[0].id,speed:0.85,pauseMs:450,style:'narration'},tasks:{speech:{status:'done'}}};s.speech={file:'ok.wav',key:speechKey(s)};
 applyProjectVoice({scenes:[s]},{voice:voices[0].id},{voiceOnly:true});assert.equal(s.tasks.speech.status,'done');
});
