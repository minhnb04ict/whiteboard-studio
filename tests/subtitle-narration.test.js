import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSrt,looksLikeSubtitle,narrationText} from '../public/srt-timing.js';
import {settings,speechCurrent,speechKey} from '../src/tts.js';
import {chunks} from '../src/domain.js';
import {sourceUnits} from '../src/scene-plan.js';

test('subtitle indexes separated by empty lines and collapsed clipboard SRT never become narration',()=>{
 const raw='1\n\n00:00:00,000 --> 00:00:04,000\nCó 5 ô vuông.\n\n2\n\n00:00:04,000 --> 00:00:08,000\nNăm 2026, diện tích là 15 m².';
 for(const source of [raw,raw.replace(/\n+/g,' ')]){
  assert.ok(looksLikeSubtitle(source));
  const cues=parseSrt(source);
  assert.deepEqual(cues.map(c=>c.text),['Có 5 ô vuông.','Năm 2026, diện tích là 15 m².']);
  assert.equal(cues.at(-1).endMs,8000);
  const scene=chunks(cues)[0];
  assert.equal(settings(scene).text,'Có 5 ô vuông. Năm 2026, diện tích là 15 m².');
  assert.ok(sourceUnits(cues,1).every(u=>!u.text.includes('-->')));
  assert.equal(narrationText(source),'Có 5 ô vuông.\nNăm 2026, diện tích là 15 m².');
 }
});

test('Piper cleans legacy subtitle narration and cache becomes stale; spoken numbers and ordinary text remain unchanged',()=>{
 const raw='1\n00:00:00,000 --> 00:00:04,000\n5 nhân 3 bằng 15.';
 assert.equal(settings({narration:raw}).text,'5 nhân 3 bằng 15.');
 assert.equal(narrationText('Năm 2026.\n123\nDiện tích 15 m².'),'Năm 2026.\n123\nDiện tích 15 m².');
 assert.equal(narrationText('00:00:00,000 --> 00:00:03,000\n123'),'123');
 const scene={narration:raw,tts:{style:'narration'},speech:{file:'old.wav',key:'old-unclean-key'}};
 assert.equal(speechCurrent(scene),false);
 scene.speech.key=speechKey(scene);assert.equal(speechCurrent(scene),true);
 assert.throws(()=>settings({narration:'00:00:00,000 --> bad\nLời kể.'}));
});
